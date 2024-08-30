import { procedureRequests, getFactRecords } from 'src/services/Data.service';
import {
  generateProcedureParamActions,
  ProcedureParameters,
  ProcedurePostProcess,
  StageControl,
} from 'components/procedure/procedureUtills';
import { computed, ref } from 'vue';
import { triggerNegative } from 'src/services/Notification.service';
import { store } from 'src/store';

export default class ProcedureAPI {
  procedureInstances = computed({
    get: () => store.getters['modules/getProcedureInstances'],
    set: (val) => store.commit('modules/updateProcedureInstances', val),
  });

  /**
   * @param id {Number} идентификатор процедуры/отчета
   * @param factId {String} идентификатор факта
   * @param cellId {Number} идентификатор выбранной ячейки(cell) в факте
   * @param selected {Array || Object} массив идентификаторов записей или фильтр, для факта
   * @param callback {function} после запуска функция вернет processId,
   * по которому можно получить этот процесс из vuex.
   *
   */
  run(id, factId, cellId, selected, callback, updateTable) {
    this.runP({ id, factId, cellId, selected, updateTable }, callback);
  }

  runP(params, callback) {
    const procedure = new ProcedureRunner(params);
    (async () => {
      const processId = await procedure.run();
      if (!processId) return null;
      this.procedureInstances.value = { [processId]: procedure };
      callback(processId);
    })();
  }

  stop(processId) {
    this.procedureInstances.value[processId].finish();
    delete this.procedureInstances.value[processId];
  }

  getProcedureInstance(processId) {
    return this.procedureInstances[processId];
  }

  // Если в процедуре нужно заполнить параметры, вызовется resolve
  subscribeParams(processId, resolve) {
    const proc = this.procedureInstances.value[processId];
    let uns;
    proc &&
      resolve &&
      (uns = watch(proc.stateControl.name, (val) => {
        if (val === 'PARAMS_PAGE') {
          resolve();
          uns();
        }
      }));
    return !!uns;
  }
}

export function ProcedureRunner({ id, factId, cellId, selected, updateTable }) {
  const processId = ref(null);
  const finished = ref(false);
  const maxTimeout = 1000 * 30;
  let timeout = 0;

  const stateControl = new StateControl();

  const groupingFacts = computed((_) => store.getters['modules/getGroupingFacts']);
  const procedureCheck = computed({
    get: () => store.getters['modules/getProcedureCheck'],
    set: (val) => store.commit('modules/updateProcedureCheck', val),
  });

  const run = async () => {
    const method = Array.isArray(selected) ? 'selected' : 'all';
    const result = await procedureRequests.startProcedure(id, factId, cellId, method, selected);
    if (!result?.PROCESS_ID) return null; // Если не получилось запустить процедуру
    processId.value = result.PROCESS_ID;
    await domessage(result);
    return processId.value;
  };

  const finish = () => {
    finished.value = true;
  };

  const sendParams = async () => {
    procedureCheck.value = !procedureCheck.value;
    const procParams = stateControl.state.value['pp'];
    if (procParams.isValidParameters()) {
      stateControl.setState('PROGRESS_PAGE');
      timeout = 0;
      const pps = procParams.getParamsFiles();
      for await (const par of pps) {
        await procedureRequests.uploadFileProcedure(par.name, par.selectValue, processId.value);
      }
      const params = procParams.getSelectedValueParams();
      await procedureRequests.parametersPushProcedure(params, processId.value);
    } else {
      triggerNegative('Заполните параметры для продолжения');
      return false;
    }
    return true;
  };

  const sendDialog = async (param) => {
    await procedureRequests.dialogAnswerProcedure(param, processId.value);
    stateControl.setState('PROGRESS_PAGE');
  };

  const sendCustomDialog = async (param) => {
    await procedureRequests.customDialogAnswerProcedure(param, processId.value);
    stateControl.setState('PROGRESS_PAGE');
  };

  const domessage = (message) => {
    setTimeout(async () => {
      if (!finished.value) {
        let result = await procedureRequests.continueProcedure(processId.value);
        await domessage(result);
      }
    }, timeout);
    async function getRecordIds(graphIds, layerId) {
      const filter = getFilter(graphIds);
      const factId = groupingFacts.value.layerIdIndex[layerId].id;
      const bankId = store.getters['modules/getBankId'];
      const data = await getFactRecords(bankId, factId, false, 200, filter);
      return data.map((record) => record.id);
    }
    async function showOnMap(graphIds, layerId) {
      const ids = await getRecordIds(graphIds, layerId);
      const map = document.getElementById('map');
      if (!map) {
        console.error('Нет 2д карты');
        return;
      }
      const graphIdField = {
        fvId: ids,
        layerId: layerId,
      };
      map.dispatchEvent(
        new CustomEvent('showGseeObjects', {
          detail: {
            graphIdField: graphIdField,
            layerId: layerId,
          },
        }),
      );
    }
    function getFilter(graphIds) {
      let filter = '';
      if (graphIds.length == 1) {
        filter = `{"fda":{"name":"Объект","alias":"GraphID"},"oper":"equal","value":${graphIds[0]},"type":"WherePartCondition"}`;
      }
      if (graphIds.length > 1) {
        for (let i = 0; i < graphIds.length; i++) {
          filter += `{"fda":{"name":"Объект","alias":"GraphID"},"oper":"equal","value":"${graphIds[i]}","type":"WherePartCondition"}`;
          if (i < graphIds.length - 1) filter += ',';
        }
      }
      filter =
        '{"byAnd":"true","version":"1","expression":{"byAnd":"false","condition":[' +
        filter +
        ']}}';
      return filter;
    }
    function showOnTable(graphIds, layerId) {
      const factId = groupingFacts.value.layerIdIndex[layerId].id;

      updateTable?.(factId, getFilter(graphIds));
    }
    switch (message.TYPE_PARAM) {
      case 'EMPTY':
        timeout < maxTimeout && (timeout += 500);
        break;
      case 'PARAMETERS':
        stateControl.setState('PARAMS_PAGE', { pp: new ProcedureParameters(message.object) });
        break;
      case 'ACTIONS':
        stateControl.setActions(message.object);
        break;
      case 'SAVE_FILE': {
        const downloadLinks = [{ fileUid: message.object, fileName: message.fileName }];
        stateControl.setState('FINISH_PAGE', { downloadLinks });
        break;
      }
      case 'THROWABLE':
        finish();
        stateControl.setState('ERROR_PAGE', { error: message.object });
        break;
      case 'FINISH':
        stateControl.setState('FINISH_PAGE', {});
        finish();
        break;
      case 'MESSAGE': {
        const msg = message.object.replace(/(?:\r\n|\r|\n)/g, '<br />');
        stateControl.setState('PROGRESS_PAGE', { messages: [msg] });
        break;
      }
      case 'ERROR_RECORD_DATA': {
        const errMsg = message.TEXT;
        stateControl.setState('PROGRESS_PAGE', { messages: [errMsg] });
        break;
      }
      case 'STAGE_DESCRIPTOR': {
        const stageControl = new StageControl(
          message.object[0],
          message.object[1],
          message.object[2],
        );
        stateControl.setState('PROGRESS_PAGE', { stageControl });
        break;
      }
      case 'STAGE_STEP':
        if (message.object?.length > 1) {
          stateControl.state?.value?.stageControl &&
            stateControl.state.value.stageControl.setStep(message.object[0], message.object[1]);
        }
        break;
      case 'STAGE_CLOSE':
        stateControl.setEmpty('PROGRESS_PAGE');
        break;
      case 'POST_PROCESSES': {
        const postProcesses = message.object;
        const pp = { postProcess: new ProcedurePostProcess(postProcesses) };
        stateControl.setState('FINISH_PAGE', pp);
        const isOnlyOpenFD = postProcesses.some((p) => p?.type === 'OPEN_FACTDSCR');

        let showType = '';

        processesLoop: for (const process of postProcesses) {
          if (process.type === 'OPEN_FACTDSCR') {
            updateTable?.(process.factDscrId, process.addSqlWeb);
            break;
          } else if (process.type === 'REFRESH_FACTDSCR' && !isOnlyOpenFD) {
            updateTable?.(process.factDscrId);
            break;
          } else if (process.type === 'SHOW_IN') {
            showType = process.showIn;
          } else if (process.type === 'SHOW_GRAPHIC_OBJECTS') {
            switch (showType) {
              case 'SEMANTIC_AND_GRAPHIC': {
                showOnMap(process.graphIds, process.layerId);
                showOnTable(process.graphIds, process.layerId);
                break processesLoop;
              }
              case 'SEMANTIC_ONLY': {
                showOnTable(process.graphIds, process.layerId);
                break processesLoop;
              }
              case 'GRAPHIC_ONLY': {
                showOnMap(process.graphIds, process.layerId);
                break processesLoop;
              }
              default: {
                console.error('Неизвестное место вывода объектов');
                break processesLoop;
              }
            }
          }
        }
        break;
      }
      case 'DIALOG':
        stateControl.setState('DIALOG_PAGE', { dialogData: message.object });
        break;
      case 'CUSTOM_DIALOG':
        stateControl.setState('CUSTOM_DIALOG_PAGE', { customDialogData: message.object });
        break;
      case 'STAGE_SET_BASE_TITLE':
      case 'STAGE_SET_ADDITION_TITLE':
        stateControl.state?.value?.stageControl &&
          stateControl.state.value.stageControl.setStep(message.object[0], message.object[1]);
        break;
    }
  };

  return {
    run,
    finish,
    sendParams,
    sendDialog,
    sendCustomDialog,
    stateControl,
  };
}

export function StateControl() {
  const name = ref('PROGRESS_PAGE');
  const state = ref({});

  const finishState = ref({});
  let downloadLinks = [];
  let messages = [];
  let actions = [];

  /**Задаем activeState
   * @param {String} nameState название состояния
   * @param {Object} value значение состояния
   */
  const setState = (nameState, value = {}) => {
    state.value = Object.assign(name.value === nameState ? state.value : {}, value);
    name.value = nameState;
    if (name.value === 'FINISH_PAGE' || name.value === 'PROGRESS_PAGE') {
      if (value.downloadLinks) {
        downloadLinks = downloadLinks.concat(value.downloadLinks);
      }
      if (value.messages) {
        messages = messages.concat(value.messages);
      }
      state.value = Object.assign(state.value, finishState.value);
      state.value.downloadLinks = downloadLinks;
      state.value.messages = messages;
      finishState.value = Object.assign({}, state.value);
    }

    if (name.value === 'PARAMS_PAGE') {
      //Закидываем в параметры процедуры их actions

      if (actions?.length && state?.value?.pp?.parameters?.length > 0) {
        generateProcedureParamActions(state?.value?.pp, actions);
      }
    }

    //Когда получили параметры, раскидываем actions события по ним
  };

  const setActions = (act) => {
    actions = act;
  };

  const setEmpty = (nname) => {
    state.value = {};
    name.value = nname;
  };

  const clearState = () => {
    name.value = 'START_PAGE';
    state.value = {};
  };
  return {
    name,
    state,
    setState,
    clearState,
    setEmpty,
    setActions,
  };
}
