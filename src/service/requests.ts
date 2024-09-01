import axios, { AxiosRequestConfig } from 'axios';
import { iResponse, SqlProcedureType } from './RequestTypes';


export default {
  sqlProcedure: async (bankId: number, sql: string, text: string, innerParams: string, baseURL?: string): Promise<SqlProcedureType> => {
    const url = `/api/procedures/banks/${bankId}/CHOOSE_SQL_SELECT_PAIR`;
    const data = { sql, text, innerParams };
    const config: AxiosRequestConfig = {
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    };
    return (await axios.post(url, data, config))?.data;
  },
  uploadFileProcedure: (paramName: string, files: File[], processId?: string, baseURL?: string) => {
    const url = '/ActionServlet';

    const data = new FormData();
    const flatFiles = files.flat();
    for (let i = 0; i < flatFiles.length; i++) {
      data.append('files[' + i + ']', flatFiles[i]);
    }

    const config: AxiosRequestConfig = {
      baseURL,
      headers: { 'Content-Type': 'multipart/form-data' },
      params: {
        action: 'wl_base_reports',
        mode: 'uploadFile',
        PROCESS_ID: processId,
        PROC_PARAM: paramName,
      },
    };
    void axios.post(url, data, config);
  },
  customDialogAnswerProcedure: async (value: object, processId?: string, baseURL?: string) => {
    const url = '/ActionServlet';
    const config = {
      baseURL,
      params: {
        action: 'wl_base_reports',
        PROCESS_ID: processId,
        type_message: 'CUSTOM_DIALOG_ANSWER',
      },
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    };
    return await axios.post(url, value, config);
  },
  dialogAnswerProcedure: async (value: string, processId?: string, baseURL?: string) => {
    const url = '/ActionServlet';
    const config = {
      baseURL,
      params: {
        action: 'wl_base_reports',
        type_message: 'DIALOG_ANSWER',
        result: value,
        PROCESS_ID: processId,
      },
    };
    return await axios.get(url, config);
  },
  requestProcedures: async (datamode: string, fdv: string, baseURL?: string) => {
    const url = '/ActionServlet';
    const config = {
      baseURL,
      params: {
        action: 'wl_reports',
        datamode,
        fdv,
      },
    };
    return (await axios.get(url, config))?.data
  },

  startProcedure: async (procId: string, factId: string, cellId?: string, method?: string, param?: string[] | string, baseURL?: string): Promise<iResponse> => {
    let url = '/ActionServlet';
    if (method === 'selected' && param && Array.isArray(param)) {
      url += param.map(p => `&pkValue=${p}`).join();
    } else if (method === 'all' && param && typeof param === 'string') {
      url += '&fullFilter=' + encodeURI(param);
    }

    const config = {
      baseURL,
      params: {
        action: 'wl_base_reports',
        procId,
        factId,
        cellId: cellId ? cellId : undefined,
      },
    };
    return (await axios.get(url, config)).data;
  },
  continueProcedure: async (processId?: string, baseURL?: string):Promise<iResponse> => {
    const url = `/ActionServlet`;
    const config = {
      baseURL,
      params: {
        action: 'wl_base_reports',
        type_message: 'EMPTY',
        result: null,
        PROCESS_ID: processId,
      },
    };
    return (await axios.get<iResponse>(url, config)).data;
  },
  parametersPushProcedure: async (body: object, processId?: string, baseURL?: string) => {
    const url = '/ActionServlet';
    const config = {
      baseURL,
      params: {
        action: 'wl_base_reports',
        PROCESS_ID: processId,
        type_message: 'PARAMETERS_ANSWER',
      },
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    };
    return await axios.post(url, body, config);
  },
  getDownloadLink: (fileUid?: string, fileName?: string, processId?: string, baseURL?: string) => {
    return `${baseURL ?? ''}/ActionServlet?action=wl_base_reports&fileUid=${fileUid}&fileName=${fileName}&PROCESS_ID=${processId}`
  },
  getDownloadAllLink: (processId?: string, baseURL?: string) => {
    return `${baseURL ?? ''}/ActionServlet?action=wl_base_reports&allFiles=true&PROCESS_ID=${processId}`
  },
};
