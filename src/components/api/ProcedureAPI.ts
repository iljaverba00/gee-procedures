import requests from '../../service/requests.ts';
import {
  generateProcedureParamActions,
  ProcedureParameters,
  ProcedurePostProcess,
  StageControl,
} from '../../service/procedureUtills.ts';
import { ref, watch, WatchStopHandle } from 'vue';
import { iDownloadLink, iState, ProcedureInstance, pRunner, RunProcedure } from '../../service/types.ts';
import { iResponse } from '../../service/RequestTypes.ts';


export default class ProcedureAPI {
  procedureInstance?: ProcedureInstance = undefined;

  run(params: RunProcedure) {
    const instance = ProcedureRunner(params);
    (async () => {
      const processId = await instance.run();
      if (!processId) return null;
      this.procedureInstance = { processId, instance };
      params?.callback?.(processId);
    })();
  }

  stop() {
    this.procedureInstance?.instance?.finish();
    this.procedureInstance = undefined;
  }

  getProcedureInstance() {
    return this.procedureInstance?.instance;
  }

  subscribeParams(resolve: () => void) {
    const proc = this.procedureInstance?.instance;
    let uns: WatchStopHandle | undefined = undefined;
    proc &&
    resolve &&
    (uns = watch(proc.stateControl.name, (val) => {
      if (val === 'PARAMS_PAGE') {
        resolve();
        uns?.();
      }
    }));
    return !!uns;
  }
}

export function ProcedureRunner({ id, factId, cellId, selected, updateTable }: RunProcedure): pRunner {
  const processId = ref<string>();
  const finished = ref(false);
  const maxTimeout = 1000 * 30;
  let timeout = 0;

  const stateControl = StateControl();

  const procedureCheck = ref(false);

  const run = async () => {
    const method = Array.isArray(selected) ? 'selected' : 'all';
    const result = await requests.startProcedure(id, factId, cellId, method, selected);
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
    const procParams = stateControl.state.value?.pp;
    if (procParams?.isValidParameters()) {
      stateControl.setState('PROGRESS_PAGE');
      timeout = 0;
      const pps = procParams.getParamsFiles();
      for await (const par of pps) {
        if (par?.name && par?.selectValue) {
          // @ts-ignore
          await requests.uploadFileProcedure(par.name, par.selectValue, processId.value);
        }
      }
      const params = procParams.getSelectedValueParams();
      await requests.parametersPushProcedure(params, processId.value);
    } else {
      console.log('Заполните параметры для продолжения');
      return false;
    }
    return true;
  };

  const sendDialog = async (param: string) => {
    await requests.dialogAnswerProcedure(param, processId.value);
    stateControl.setState('PROGRESS_PAGE');
  };

  const sendCustomDialog = async (param: object) => {
    await requests.customDialogAnswerProcedure(param, processId.value);
    stateControl.setState('PROGRESS_PAGE');
  };

  const domessage = (message: iResponse) => {
    setTimeout(async () => {
      if (!finished.value) {
        let result = await requests.continueProcedure(processId.value);
        await domessage(result);
      }
    }, timeout);

    console.log(message);
    // async function getRecordIds(graphIds, layerId) {
    //   const filter = getFilter(graphIds);
    //   const factId = groupingFacts.value.layerIdIndex[layerId].id;
    //   const bankId = store.getters['modules/getBankId'];
    //   const data = await getFactRecords(bankId, factId, false, 200, filter);
    //   return data.map((record) => record.id);
    // }
    //todo
    // async function showOnMap(graphIds, layerId) {
    //   const ids = await getRecordIds(graphIds, layerId);
    //   const map = document.getElementById('map');
    //   if (!map) {
    //     console.error('Нет 2д карты');
    //     return;
    //   }
    //   const graphIdField = {
    //     fvId: ids,
    //     layerId: layerId,
    //   };
    //   map.dispatchEvent(
    //     new CustomEvent('showGseeObjects', {
    //       detail: {
    //         graphIdField: graphIdField,
    //         layerId: layerId,
    //       },
    //     }),
    //   );
    // }
    // function getFilter(graphIds) {
    //   let filter = '';
    //   if (graphIds.length == 1) {
    //     filter = `{"fda":{"name":"Объект","alias":"GraphID"},"oper":"equal","value":${graphIds[0]},"type":"WherePartCondition"}`;
    //   }
    //   if (graphIds.length > 1) {
    //     for (let i = 0; i < graphIds.length; i++) {
    //       filter += `{"fda":{"name":"Объект","alias":"GraphID"},"oper":"equal","value":"${graphIds[i]}","type":"WherePartCondition"}`;
    //       if (i < graphIds.length - 1) filter += ',';
    //     }
    //   }
    //   filter =
    //     '{"byAnd":"true","version":"1","expression":{"byAnd":"false","condition":[' +
    //     filter +
    //     ']}}';
    //   return filter;
    // }
    // function showOnTable(graphIds, layerId) {
    //   const factId = groupingFacts.value.layerIdIndex[layerId].id;
    //
    //   updateTable?.(factId, getFilter(graphIds));
    // }
    switch (message.TYPE_PARAM) {
      case 'EMPTY':
        timeout < maxTimeout && (timeout += 500);
        break;
      case 'PARAMETERS':
        if (typeof message.object == 'object') {
          stateControl.setState('PARAMS_PAGE', { pp: new ProcedureParameters(message.object) });
        }
        break;
      case 'ACTIONS':
        stateControl.setActions(message.object);
        break;
      case 'SAVE_FILE': {
        if (typeof message.object == 'string') {
          const downloadLinks: iDownloadLink[] = [{ fileUid: message.object, fileName: message.fileName }];
          stateControl.setState('FINISH_PAGE', { downloadLinks });
        }
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
  const state = ref<iState>();

  const finishState = ref({});
  let downloadLinks: string[] = [];
  let messages: string[] = [];
  let actions = [];

  /**Задаем activeState
   * @param {String} nameState название состояния
   * @param {Object} value значение состояния
   */
  const setState = (nameState, value: iState = {}) => {
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
        generateProcedureParamActions(state?.value?.pp?.parameters, actions);
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
