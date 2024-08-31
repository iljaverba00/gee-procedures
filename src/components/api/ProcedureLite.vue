<script setup lang="ts">
import ProcedureComponent from './ProcedureComponent.vue';

// Компонент, который позволяет выполнить процедуру

import { ref, onBeforeUnmount, computed } from 'vue';

const props = defineProps(['procedureId', 'factId', 'cellId', 'recordIds']);

const emit = defineEmits(['finish']);

const processId = ref(null);
const procedureComponent = ref(null);
const currentPage = ref();

const procedureInstance = computed(
    () => store.getters['modules/getProcedureInstances']?.[processId.value],
);
const stateControl = computed(() => procedureInstance?.value?.stateControl?.state);

const run = () => {
  procedureComponent.value?.run?.(
      props.procedureId,
      props.factId,
      props.cellId,
      props.recordIds,
      (id) => {
        processId.value = id;
      },
  );
};

const stop = () => {
  procedureComponent.value.stop();
};

onBeforeUnmount(() => {
  stop();
});

defineExpose({
  run,
  stop,
});
</script>
<style scoped lang="scss">
.procedure-lite-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0px 15px 8px 15px;
}
</style>


<template>
  <ProcedureComponent
    ref="procedureComponent"
    @updateCurrentPage="
      currentPage = $event;
      $event === 'FINISH_PAGE' && emit('finish', stateControl);
    "
  />
  <q-btn
    class="procedure-lite-btn"
    v-if="['PARAMS_PAGE'].includes(currentPage)"
    label="Далее"
    @click="
      ('PARAMS_PAGE' === currentPage && $refs.procedureComponent?.nextPage()) ||
        ('ERROR_PAGE' === currentPage && $refs.procedureComponent?.stop()) ||
        ('ERROR_PAGE' === currentPage && $refs.procedureComponent?.stop())
    "
  />
</template>
