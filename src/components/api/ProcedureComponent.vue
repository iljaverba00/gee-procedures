<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import StartPage from '../pages/StartPage.vue';
import ParamsPage from '../pages/ParamsPage.vue';
import FinishPage from '../pages/FinishPage.vue';
import ProgressPage from '../pages/ProgreesPage.vue';
import ErrorPage from '../pages/ErrorPage.vue';
import DialogPage from '../pages/DialogPage.vue';
import ProcedureAPI from './ProcedureAPI.ts';
import CustomDialogPage from '../pages/CustomDialogPage.vue';
import { RunProcedure } from '../../service/types.ts';

const startPage = 'START_PAGE';

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
    type: Array,
  },
});

const procedureAPI = ref()

const run = (params: RunProcedure) => {
  this.procedureId = procedureId;

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


  procedureAPI.value = new ProcedureAPI(params)
};


defineExpose({ run })

const params: RunProcedure = { procedureId, fdId, cellId, param, callback };

const procedureAPI = new ProcedureAPI();
const instance = procedureAPI.procedureInstance;

procedureAPI.run();


computed: {
  procedureInstances: {
    get();
    {
      return this.$store.getters['modules/getProcedureInstances'];
    }
  ,
  }
,
  procedureInstance: {
    get();
    {
      return this.procedureInstances?.[this.processId];
    }
  ,
  }
,
  currentPage: {
    get();
    {
      return this.procedureInstance?.stateControl?.name ?? this.startPage;
    }
  ,
  }
,
  currentState: {
    get();
    {
      return this.procedureInstance?.stateControl?.state;
    }
  ,
  }
,
  factId: {
    get();
    {
      return this.$store.getters['modules/getCurrentFactId'];
    }
  ,
    set(val);
    {
      this.$store.commit('modules/updateCurrentfactId', val);
    }
  ,
  }
,
  allFdv: {
    get();
    {
      return this.$store.getters['modules/getfactDescriptorValues'];
    }
  ,
  }
,
  tableState: {
    get();
    {
      return this.$store.getters['modules/getTableState'];
    }
  ,
  }
,
}


watch();

watch: {
  currentPage(n);
  {
    this.$emit('updateCurrentPage', n);
  }
,
  procedureName(n);
  {
    this.$emit('updateProcedureName', n);
  }
,
  procedureId(n);
  {
    this.$emit('updateProcedureId', n);
  }
,
}
,
setup();
{
  const procedureAPI = new ProcedureAPI();

  const $store = useStore();
  const currentFilter = computed(
    (_) =>
      $store.state.modules.filterComponentState[$store.state.modules.UserProperty.currentfactId],
  );

  return {
    procedureId: ref(''),
    procedureGroup: ref(''),
    procedureName: ref(''),
    procedureAPI,
    processId: ref(),
    startPage: ref(),
    makeBackendJson,
    currentFilter,
  };
}
,
mounted();
{
  //использую в диалогах чтобы после создания компонента запустить стартовую страницу
  switch (this.currentPageProp) {
    case 'START_PAGE':
      this.onStartPage && this.runStartPage();
      break;
    case 'PARAMS_PAGE':
      this.startPage = 'START_PAGE';
      this.procedureId = this.procedureProp[0].id;
      this.procedureName = this.procedureProp[0].name;
      this.procedureGroup = this.procedureProp[1];
      this.nextPage();
      break;
    default:
      break;
  }
}
,
methods: {
  async;
  nextPage(param);
  {
    switch (this.currentPage) {
      case 'START_PAGE': {
        const table = getTableInstanceByName('mainTable')?.api;

        // if (!table.tableCompInst?.props?.rows.length) {
        //   triggerWarning('Внимание', 'В таблице нет ни одной записи, запуск процедуры невозможен!')
        //   break
        // }

        let param;
        if (table.tableCompInst?.props?.rows.length) {
          if (!this.method) {
            const selectedRows = table.tableCompInst.exposed.selectedRows.value;
            if (selectedRows?.length) {
              let rows = [];
              for (const selectedRow of selectedRows) {
                rows.push(selectedRow);
              }
              param = getPkValues(rows, this.allFdv[this.factId]);
            }
          } else if (this.method) {
            param = JSON.stringify(this.makeBackendJson(this.currentFilter.toJSON()));
          }
        }
        this.run(this.procedureId, this.factId, table.currentCell.id, param);
        break;
      }
      case 'PARAMS_PAGE': {
        this.procedureInstance?.sendParams?.();
        break;
      }
      case 'DIALOG_PAGE': {
        this.procedureInstance?.sendDialog?.(param);
        break;
      }
      case 'CUSTOM_DIALOG_PAGE': {
        this.procedureInstance?.sendCustomDialog?.(param);
      }
    }
  }
,
  stop();
  {
    if (this.processId) {
      this.procedureAPI.stop(this.processId);
      this.processId = null;
    }
  }
,
  initial();
  {
    this.procedureName = '';
    this.procedureGroup = '';
  }
,
  /** Запуск без параметров.
   *  Первым пользователю будет показано окно выбора процедуры и записей*/
  runStartPage();
  {
    this.startPage = 'START_PAGE';
  }
,
,
}
,

,
}
;
</script>

<template>
  <progress-page
    v-if="currentPage === 'PROGRESS_PAGE'"
    :stage-control="currentState.stageControl"
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
    v-model:procedure-params="currentState.pp"
    v-model:procedure-name="procedureName"
    v-model:procedure-group="procedureGroup"
    v-model:procedure-id="procedureId"
  />

  <dialog-page
    v-if="currentPage === 'DIALOG_PAGE'"
    :dialog-data="currentState.dialogData"
    @press="nextPage"
  />

  <finish-page
    v-if="currentPage === 'FINISH_PAGE'"
    :download-links="currentState.downloadLinks"
    :messages="currentState.messages"
    :post-process="currentState.postProcess"
    :process-id="processId"
    @updateTable="updateTable"
  />

  <error-page v-if="currentPage === 'ERROR_PAGE'" :msg="currentState.error" :name="procedureName" />

  <custom-dialog-page
    v-if="currentPage === 'CUSTOM_DIALOG_PAGE'"
    :data="currentState.customDialogData"
    @press="nextPage"
  />
</template>
