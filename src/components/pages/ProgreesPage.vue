<script setup lang="ts">
import {
  QCardSection,
  QSpinnerGears
} from 'quasar';
const props = defineProps(['stageControl']);
</script>

<template>
  <q-card-section class="absolute-center">
    <q-spinner-gears indeterminate size="100px" color="primary" />
  </q-card-section>

  <div v-if="!props.stageControl" class="text-subtitle1 absolute-center progress_style text-center">
    Пожалуйста подождите ...
  </div>
  <div v-if="props.stageControl" class="text-subtitle1 absolute-center progress_style text-center">
    {{ props.stageControl?.getStage?.() }}
  </div>
</template>

<style>
.progress_style {
  margin: 100px 0 0 0;
}
</style>
