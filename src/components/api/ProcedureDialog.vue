<script setup lang="ts">
import ProcedureComponent from './ProcedureComponent.vue';
import { ref, computed } from 'vue';

import { YesNoDialog } from '@gee/dialog';
import { useI18n } from 'vue-i18n';

const emits = defineEmits(['update:showDialog']);
const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
    required: true,
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

const { t } = useI18n({ useScope: 'global' });

const currentPage = ref();
const method = ref(false);
const procedureName = ref('');
const procedureId = ref('');
const procedureAPI = ref(null);
const showConfirmDialog = ref(false);

const isFinishOrError = computed(
    () => currentPage.value === 'FINISH_PAGE' || currentPage.value === 'ERROR_PAGE',
);

const isStartPage = computed(() => currentPage.value === 'START_PAGE');
const isParamsPage = computed(() => currentPage.value === 'PARAMS_PAGE');
const isFinishPage = computed(() => currentPage.value === 'FINISH_PAGE');
const isErrorPage = computed(() => currentPage.value === 'ERROR_PAGE');

function showMethod(is) {
  if (!is) {
    emits('update:showDialog', false);
    procedureAPI.value?.stop?.();
  }
}

function noBtnAction() {
  isStartPage.value && method.value
      ? (showConfirmDialog.value = true)
      : procedureAPI.value?.nextPage();
}

function yesBtnAction() {
  procedureAPI.value?.stop?.();
}
</script>

<template>
  <q-dialog
    :header="onlyImport ? 'Процедуры импорта' : t('ProcedureDialog.header')"
    :show-dialog="showDialog"
    :no-btn-label="t('ProcedureDialog.noBtn')"
    :yes-btn-label="isFinishOrError ? t('ProcedureDialog.yesBtn1') : t('ProcedureDialog.yesBtn2')"
    :cancel-btn-label="t('ProcedureDialog.cancelBtn')"
    :no-btn-show="isStartPage || isParamsPage"
    :yes-btn-show="(isParamsPage && !onlyImport) || isFinishPage || isErrorPage"
    :cancel-btn-show="isFinishOrError"
    :no-btn-disable="isStartPage && procedureName === ''"
    :persistent="true"
    :resizable="false"
    yes-btn-off-close-popup
    no-btn-off-close-popup
    minWidth="450px"
    minHeight="400px"
    style="overflow: hidden"
    overflow-hide
    :allow-focus-outside="true"
    @no="noBtnAction()"
    @yes="yesBtnAction()"
    @close="showMethod"
  >
    <template #default>
      <procedure-component
        ref="procedureAPI"
        onStartPage
        v-model:method="method"
        :propTab="propTab"
        :onlyImport="onlyImport"
        :currentPageProp="currentPageProp"
        :procedureProp="procedureProp"
        @updateCurrentPage="currentPage = $event"
        @updateProcedureName="procedureName = $event"
        @updateProcedureId="procedureId = $event"
      />
    </template>
    <template #button-left v-if="currentPage === 'START_PAGE'">
      <q-checkbox
        v-model="method"
        dense
        :label="t('ProcedureDialog.method.label')"
        class="text-black q-ma-none"
      >
        <q-tooltip>{{ t('ProcedureDialog.method.tooltip') }}</q-tooltip>
      </q-checkbox></template
    >
  </q-dialog>
  <yes-no-dialog
    v-model:show-dialog="showConfirmDialog"
    :title="t('ProcedureDialog.showDialog.title')"
    :value="t('ProcedureDialog.showDialog.value')"
    @save="procedureAPI?.nextPage"
    height="200px"
  />
</template>
