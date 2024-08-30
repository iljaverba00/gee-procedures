import axios, {AxiosRequestConfig} from "axios";


export default {
    sqlProcedure: async (bankId: number, sql: string, text: string, innerParams: string, baseURL?: string) => {
        const url = `/api/procedures/banks/${bankId}/CHOOSE_SQL_SELECT_PAIR`;
        const data = {sql, text, innerParams};
        const config: AxiosRequestConfig = {
            baseURL,
            headers: {'Content-Type': 'application/json'}
        };
        return await axios.post(url, data, config);
    },
    uploadFileProcedure: async (paramName, files, processId) => {
        let formData = new FormData();
        const flatFiles = files.flat();
        for (let i = 0; i < flatFiles.length; i++) {
            formData.append('files[' + i + ']', flatFiles[i]);
        }
        await api.post('/ActionServlet?action=wl_base_reports&mode=uploadFile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: {
                PROCESS_ID: processId,
                PROC_PARAM: paramName,
            },
        });
    },
    customDialogAnswerProcedure: async (value, processId) => {
        const params = {
            action: 'wl_base_reports',
            PROCESS_ID: processId,
            type_message: 'CUSTOM_DIALOG_ANSWER',
        };
        return await api.post('/ActionServlet', value, {
            params,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
        });
    },
    dialogAnswerProcedure: async (value, processId) => {
        return await requestApi.get({
            url: '/ActionServlet?action=wl_base_reports&type_message=DIALOG_ANSWER',
            options: {
                params: {
                    result: value,
                    PROCESS_ID: processId,
                },
            },
        });
    },
    requestProcedures: async (serverUrl, datamode, fdv, resolve) => {
        return await requestApi.get({
            url: `${serverUrl ? serverUrl : ''}/ActionServlet?action=wl_reports`,
            options: {params: {datamode, fdv}},
            resolve,
        });
    },

    startProcedure: async (procId, factId, cellId, method, param) => {
        var url = '/ActionServlet?action=wl_base_reports';
        if (method === 'selected') {
            param && (url = url + '&pkValue=' + param.join('&pkValue='));
        } else if (method === 'all') {
            url = url + '&fullFilter=' + encodeURI(param);
        }
        return await requestApi.get({
            url,
            options: {
                params: {
                    procId,
                    factId,
                    cellId: cellId ? cellId : undefined,
                },
            },
        });
    },
    continueProcedure: async (processId) => {
        return await requestApi.get({
            url:
                '/ActionServlet?action=wl_base_reports&type_message=EMPTY&result=null' +
                '&PROCESS_ID=' +
                processId,
        });
    },

    parametersPushProcedure: async (body, processId) => {
        return await requestApi.post({
            url: '/ActionServlet',
            body,
            options: {
                params: {
                    action: 'wl_base_reports',
                    PROCESS_ID: processId,
                    type_message: 'PARAMETERS_ANSWER',
                },
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
            },
        });
    },
    getDownloadLink: (fileUid, fileName, processId, serverUrl = PUBLIC_PATH) => {
        return (
            serverUrl +
            '/ActionServlet?action=wl_base_reports' +
            '&fileUid=' +
            fileUid +
            '&fileName=' +
            fileName +
            '&PROCESS_ID=' +
            processId
        );
    },
    getDownloadAllLink: (processId, serverUrl = PUBLIC_PATH) => {
        return (
            serverUrl +
            '/ActionServlet?action=wl_base_reports' +
            '&allFiles=true' +
            '&PROCESS_ID=' +
            processId
        );
    },
};