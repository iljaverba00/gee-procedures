<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue';
import StartPage from '../pages/StartPage.vue';
import ParamsPage from '../pages/ParamsPage.vue';
import FinishPage from '../pages/FinishPage.vue';
import ProgressPage from '../pages/ProgreesPage.vue';
import ErrorPage from '../pages/ErrorPage.vue';
import DialogPage from '../pages/DialogPage.vue';
import CustomDialogPage from '../pages/CustomDialogPage.vue';
import { pRunner, RunProcedure } from '../../service/types.ts';
import { ProcedureRunner } from './ProcedureAPI.ts';

const startPage = ref('START_PAGE');
const procedureId = ref('');
const procedureName = ref('');
const procedureGroup = ref('');

const emits = defineEmits(['updateCurrentPage', 'updateProcedureName', 'updateProcedureId']);
const props = defineProps({
  onStartPage: {
    type: Boolean,
    default: false,
  },
  method: {
    type: Boolean,
    default: false,
  },
  propTab: {
    type: String,
    default: 'favorites',
  },
  onlyImport: {
    type: Boolean,
    default: false,
  },
  currentPageProp: {
    type: String,
    default: 'START_PAGE',
  },
  procedureProp: {
    type: Array<{ id: string, name: string } | string>,
  },
});

const runner: pRunner = ProcedureRunner();
const processId = runner.processId;
const stageControl = runner.stateControl;

const currentPage = computed(()=> stageControl?.name.value)
const currentState = computed(()=> stageControl.state.value)


const run = (params: RunProcedure) => {
  runner.run(params);
};
const stop = () => {
  runner.finish();
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


//


defineExpose({ run, stop });


const updateTable = ()=>{

}

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
  <progress-page
    v-if="currentPage === 'PROGRESS_PAGE'"
    :stage-control="stageControl"
  />

  <start-page
    v-if="currentPage === 'START_PAGE'"
    v-model:procedure-id="procedureId"
    v-model:procedure-name="procedureName"
    v-model:procedure-group="procedureGroup"
    :propTab="propTab"
    :onlyImport="onlyImport"
  />

  <params-page
    v-if="currentPage === 'PARAMS_PAGE'"
    v-model:procedure-params="currentState?.pp"
    v-model:procedure-name="procedureName"
    v-model:procedure-group="procedureGroup"
    v-model:procedure-id="procedureId"
  />

  <dialog-page
    v-if="currentPage === 'DIALOG_PAGE'"
    :dialog-data="currentState?.dialogData"
    @press="runner.nextPage"
  />

  <finish-page
    v-if="currentPage === 'FINISH_PAGE'"
    :download-links="currentState?.downloadLinks"
    :messages="currentState?.messages"
    :post-process="currentState?.postProcess"
    :process-id="processId"
    @updateTable="updateTable"
  />

  <error-page v-if="currentPage === 'ERROR_PAGE'" :msg="currentState?.error" :name="procedureName" />

  <custom-dialog-page
    v-if="currentPage === 'CUSTOM_DIALOG_PAGE'"
    :data="currentState?.customDialogData"
    @press="runner.nextPage"
  />
</template>
