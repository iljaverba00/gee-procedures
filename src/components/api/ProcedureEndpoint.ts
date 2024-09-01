import requests from '../../service/requests.ts';
import {
  generateProcedureParamActions,
  ProcedureParameters,
  ProcedurePostProcess,
  StageControl,
} from '../../service/procedureUtills.ts';
import { ref } from 'vue';
import { iDownloadLink, iState, pRunner, RunProcedure } from '../../service/types.ts';
import { iResponse } from '../../service/RequestTypes.ts';


export function ProcedureRunner(): pRunner {
  const processId = ref<string>();
  const finished = ref(false);
  const maxTimeout = 1000 * 30;
  let timeout = 0;

  const stateControl = StateControl();

  const procedureCheck = ref(false);

  const run = async (runParams: RunProcedure) => {
    const method = Array.isArray(runParams.selected) ? 'selected' : 'all';
    const result = await requests.startProcedure(
      runParams.id, runParams.factId, runParams.cellId, method, runParams.selected);
    if (!result?.PROCESS_ID) return; // Если не получилось запустить процедуру
    processId.value = result.PROCESS_ID;
    await domessage(result);
    return processId.value;
  };

  const finish = () => {
    finished.value = true;
  };


  const nextPage = (param: string | object) => {
    const currentPage = stateControl.name.value;
    switch (currentPage) {
      case 'PARAMS_PAGE': {
        void sendParams();
        break;
      }
      case 'DIALOG_PAGE': {
        if (typeof param === 'string')
          void sendDialog(param);
        break;
      }
      case 'CUSTOM_DIALOG_PAGE': {
        if (typeof param === 'object')
          void sendCustomDialog(param);
        break;
      }
    }
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
        if (Array.isArray(message.object) &&
          message.object?.every(e => typeof e == 'object')) {
          const pp = new ProcedureParameters(message.object);
          stateControl.setState('PARAMS_PAGE', { pp });
        }
        break;
      case 'ACTIONS':
        if (Array.isArray(message.object) && message.object?.every(e => typeof e == 'string'))
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
        if (typeof message?.object === 'string') {
          stateControl.setState('ERROR_PAGE', { error: message.object });
        }
        break;
      case 'FINISH':
        stateControl.setState('FINISH_PAGE', {});
        finish();
        break;
      case 'MESSAGE': {
        if (typeof message?.object == 'string') {
          const msg = message.object.replace(/(?:\r\n|\r|\n)/g, '<br />');
          stateControl.setState('PROGRESS_PAGE', { messages: [msg] });
        }
        break;
      }
      case 'ERROR_RECORD_DATA': {
        const errMsg = message.TEXT;
        if (errMsg) {
          stateControl.setState('PROGRESS_PAGE', { messages: [errMsg] });
        }
        break;
      }
      case 'STAGE_DESCRIPTOR': {
        if (typeof message?.object[0] === 'string' &&
          typeof message?.object[1] === 'string' &&
          typeof message?.object[2] === 'number'
        ) {
          const stageControl = new StageControl(
            message.object[0],
            message.object[1],
            message.object[2],
          );
          stateControl.setState('PROGRESS_PAGE', { stageControl });
        }
        break;
      }
      case 'STAGE_STEP':
        if (typeof message.object?.[0] == 'string' &&
          typeof message.object?.[1] == 'string' &&
          stateControl.state?.value?.stageControl
        ) {
          stateControl.state.value.stageControl.setStep(message.object[0], message.object[1]);
        }
        break;
      case 'STAGE_CLOSE':
        stateControl.setEmpty('PROGRESS_PAGE');
        break;
      case 'POST_PROCESSES': {
        const postProcesses = message.object;
        if (Array.isArray(postProcesses) && postProcesses.every(p => typeof p === 'string')) {
          const pp = { postProcess: new ProcedurePostProcess(postProcesses) };
          stateControl.setState('FINISH_PAGE', pp);
          // const isOnlyOpenFD = postProcesses.some((p) => p?.type === 'OPEN_FACTDSCR');
          //
          // let showType = '';

          // processesLoop: for (const process of postProcesses) {
          //   if (process.type === 'OPEN_FACTDSCR') {
          //     updateTable?.(process.factDscrId, process.addSqlWeb);
          //     break;
          //   } else if (process.type === 'REFRESH_FACTDSCR' && !isOnlyOpenFD) {
          //     updateTable?.(process.factDscrId);
          //     break;
          //   } else if (process.type === 'SHOW_IN') {
          //     showType = process.showIn;
          //   } else if (process.type === 'SHOW_GRAPHIC_OBJECTS') {
          //     switch (showType) {
          //       case 'SEMANTIC_AND_GRAPHIC': {
          //         showOnMap(process.graphIds, process.layerId);
          //         showOnTable(process.graphIds, process.layerId);
          //         break processesLoop;
          //       }
          //       case 'SEMANTIC_ONLY': {
          //         showOnTable(process.graphIds, process.layerId);
          //         break processesLoop;
          //       }
          //       case 'GRAPHIC_ONLY': {
          //         showOnMap(process.graphIds, process.layerId);
          //         break processesLoop;
          //       }
          //       default: {
          //         console.error('Неизвестное место вывода объектов');
          //         break processesLoop;
          //       }
          //     }
          //   }
          // }
        }
        break;
      }
      case 'DIALOG':
        if (typeof message?.object === 'string')
          stateControl.setState('DIALOG_PAGE', { dialogData: message.object });
        break;
      case 'CUSTOM_DIALOG':
        if (typeof message?.object === 'string')
          stateControl.setState('CUSTOM_DIALOG_PAGE', { customDialogData: message.object });
        break;
      case 'STAGE_SET_BASE_TITLE':
      case 'STAGE_SET_ADDITION_TITLE': {
        if (stateControl.state?.value?.stageControl
          && typeof message.object[0] == 'string'
          && typeof message.object[1] == 'string'
        ) {
          stateControl.state.value.stageControl.setStep(message.object[0], message.object[1]);
        }
        break;
      }
    }
  };

  return {
    run,
    finish,
    nextPage,
    sendParams,
    sendDialog,
    sendCustomDialog,
    stateControl,
    processId,
  };
}

export function StateControl() {
  const name = ref('PROGRESS_PAGE');
  const state = ref<iState>();

  const finishState = ref({});
  let downloadLinks: iDownloadLink[] = [];
  let messages: string[] = [];
  let actions: any[] = [];

  /**Задаем activeState
   * @param {String} nameState название состояния
   * @param {Object} value значение состояния
   */
  const setState = (nameState: string, value: iState = {}) => {
    const dState: iState = {};
    state.value = Object.assign(name.value === nameState && state?.value ? state.value : dState, value);
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

      if (actions?.length && state?.value?.pp?.parameters?.length) {
        generateProcedureParamActions(state?.value?.pp?.parameters, actions);
      }
    }

    //Когда получили параметры, раскидываем actions события по ним
  };

  const setActions = (act: string[]) => {
    actions = act;
  };

  const setEmpty = (nname: string) => {
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
