<script setup lang="ts">
import { toRefs, ref } from 'vue';
import ProcedureLite from 'components/procedure/api/ProcedureLite.vue';

const showDialog = ref(false);

const props = defineProps(['procedureId', 'factId', 'cellId', 'recordIds', 'header']);
const emits = defineEmits(['finish']);
const { procedureId, factId, cellId, recordIds, header } = toRefs(props);
const close = () => (showDialog.value = false);

const procedureLite = ref(null);

defineExpose({
  start: () => {
    showDialog.value = true;
    setTimeout(() => {
      procedureLite.value.run();
    }, 1000);
  },
  finish: () => {
    procedureLite.value.finish();
    showDialog.value = false;
  },
});
</script>
<template>
  <q-dialog v-model:show-dialog="showDialog" @close="close" :header="header">
    <ProcedureLite
      ref="procedureLite"
      :procedure-id="procedureId"
      :fact-id="factId"
      :cell-id="cellId"
      :record-ids="recordIds"
      @finish="emits('finish', $event)"
    />
  </q-dialog>
</template>

<style scoped lang="sass">
.header-text
  padding-bottom: 30px

.progress-bar-downloader
  max-width: 50%
  width: 50%
</style>
