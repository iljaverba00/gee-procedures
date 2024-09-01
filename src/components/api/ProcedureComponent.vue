<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted, watch } from 'vue';
import StartPage from '../pages/StartPage.vue';
import ParamsPage from '../pages/ParamsPage.vue';
import FinishPage from '../pages/FinishPage.vue';
import ProgressPage from '../pages/ProgreesPage.vue';
import ErrorPage from '../pages/ErrorPage.vue';
import DialogPage from '../pages/DialogPage.vue';
import CustomDialogPage from '../pages/CustomDialogPage.vue';
import { iAllProcedures, iConfig, pRunner, RunProcedure } from '../../service/types.ts';
import { ProcedureRunner } from './ProcedureEndpoint.ts';

const startPage = ref('START_PAGE');
const procedureId = ref('');
const procedureName = ref('');
const procedureGroup = ref('');

console.log('sssssstttt')

interface Props {
  onStartPage: boolean,
  method: boolean
  propTab: string
  onlyImport: boolean
  currentPageProp: string
  procedureProp: Array<{ id: string, name: string } | string>
  allProcedures: iAllProcedures
  config: iConfig
}

const emits = defineEmits(['updateCurrentPage', 'updateProcedureName', 'updateProcedureId']);
const props = defineProps<Props>();

const runner: pRunner = ProcedureRunner();
const processId = runner.processId;
const stageControl = runner.stateControl;

const currentPage = computed(() => stageControl?.name.value ?? startPage.value);
const currentState = computed(() => stageControl.state.value);

const csPP = computed(() => currentState.value?.pp);
const csDialogData = computed(() => currentState.value?.dialogData);
const csDownloadLinks = computed(() => currentState.value?.downloadLinks);
const csMessages = computed(() => currentState.value?.messages);
const csPostProcess = computed(() => currentState.value?.postProcess);
const csError = computed(() => currentState.value?.error);
const csCustomDialogData = computed(() => currentState.value?.customDialogData);


const run = (params: RunProcedure) => {
  runner.run(params);
};
const stop = () => {
  runner.finish();
};
const nextPage = () => {
  runner.nextPage('');
};

onUnmounted(() => {
  stop();
});

onMounted(() => {
  switch (props.currentPageProp) {
    case 'START_PAGE':
      props.onStartPage && (startPage.value = 'START_PAGE');
      break;
    case 'PARAMS_PAGE':
      startPage.value = 'START_PAGE';
      if (typeof props.procedureProp?.[0] == 'object') {
        procedureId.value = props.procedureProp?.[0]?.id;
        procedureName.value = props.procedureProp[0].name;
      }
      if (typeof props.procedureProp?.[1] == 'string') {
        procedureGroup.value = props.procedureProp[1];
      }

      //this.nextPage();
      break;
    default:
      break;
  }
});


watch(currentPage, (v) => {
  emits('updateCurrentPage', v);
});
watch(procedureName, (v) => {
  emits('updateProcedureName', v);
});
watch(procedureId, (v) => {
  emits('updateProcedureId', v);
});

defineExpose({ run, stop, nextPage });


const updateTable = () => {

};

//watch: {
//   currentPage(n);
//   {
//     this.$emit('updateCurrentPage', n);
//   }
// ,
//   procedureName(n);
//   {
//     this.$emit('updateProcedureName', n);
//   }
// ,
//   procedureId(n);
//   {
//     this.$emit('updateProcedureId', n);
//   }


//const nextPage = (param) => {
//   switch (this.currentPage) {
//     case 'START_PAGE': {
//       const table = getTableInstanceByName('mainTable')?.api;
//
//       // if (!table.tableCompInst?.props?.rows.length) {
//       //   triggerWarning('Внимание', 'В таблице нет ни одной записи, запуск процедуры невозможен!')
//       //   break
//       // }
//
//       let param;
//       if (table.tableCompInst?.props?.rows.length) {
//         if (!this.method) {
//           const selectedRows = table.tableCompInst.exposed.selectedRows.value;
//           if (selectedRows?.length) {
//             let rows = [];
//             for (const selectedRow of selectedRows) {
//               rows.push(selectedRow);
//             }
//             param = getPkValues(rows, this.allFdv[this.factId]);
//           }
//         } else if (this.method) {
//           param = JSON.stringify(this.makeBackendJson(this.currentFilter.toJSON()));
//         }
//       }
//       this.run(this.procedureId, this.factId, table.currentCell.id, param);
//       break;
//     }
//     case 'PARAMS_PAGE': {
//       this.procedureInstance?.sendParams?.();
//       break;
//     }
//     case 'DIALOG_PAGE': {
//       this.procedureInstance?.sendDialog?.(param);
//       break;
//     }
//     case 'CUSTOM_DIALOG_PAGE': {
//       this.procedureInstance?.sendCustomDialog?.(param);
//     }
//   }
// };
// const updateTable = async (factDscrId, filter) => {
//   // открыть таблицу по фильтру
//   if (factDscrId && filter) {
//     factDscrId && (this.factId = factDscrId);
//     const tableInst = getTableInstanceByName('mainTable');
//     await tableInst?.api.saveASVFilter(factDscrId, filter);
//   }
//   // обновить таблицу если открыта
//   else if (factDscrId) {
//     const cacheFD = getFactDescriptor(factDscrId);
//     if (this.factId === factDscrId) {
//       const tableInst = getTableInstanceByName('mainTable');
//       await tableInst?.api.saveASVFilter(factDscrId, filter);
//     } else if (cacheFD) {
//       delete this.tableState[factDscrId];
//     }
//     if (cacheFD) {
//       const tableInst = getTableInstanceByName('mainTable');
//       await tableInst?.api.saveASVFilter(factDscrId, filter);
//     }
//   }
// };


</script>

<template>
  <start-page
    v-if="currentPage === 'START_PAGE'"
    v-model:procedure-id="procedureId"
    v-model:procedure-name="procedureName"
    v-model:procedure-group="procedureGroup"
    :all-procedures="props.allProcedures"
    :config-procedure="config"
    :propTab="propTab"
    :onlyImport="onlyImport"
  />
  <progress-page
    v-else-if="currentPage === 'PROGRESS_PAGE'"
    :stage-control="stageControl"
  />

  <params-page
    v-else-if="currentPage === 'PARAMS_PAGE'"
    v-model:procedure-params="csPP"
    :procedure-name="procedureName"
    :procedure-group="procedureGroup"
    :procedure-id="procedureId"
  />

  <dialog-page
    v-else-if="currentPage === 'DIALOG_PAGE'"
    :dialog-data="csDialogData"
    @press="runner.nextPage"
  />

  <finish-page
    v-else-if="currentPage === 'FINISH_PAGE'"
    :download-links="csDownloadLinks"
    :messages="csMessages"
    :post-process="csPostProcess"
    :process-id="processId"
    @updateTable="updateTable"
  />

  <error-page v-else-if="currentPage === 'ERROR_PAGE'" :msg="csError" :name="procedureName" />

  <custom-dialog-page
    v-else-if="currentPage === 'CUSTOM_DIALOG_PAGE'"
    :data="csCustomDialogData"
    @press="runner.nextPage"
  />
</template>
