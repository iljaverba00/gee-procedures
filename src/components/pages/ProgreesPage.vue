<template>
  <q-card-section class="absolute-center">
    <q-spinner-gears indeterminate size="100px" color="primary" />
  </q-card-section>

  <div v-if="!stageControl" class="text-subtitle1 absolute-center progress_style text-center">
    {{ t('ProgressPage.wait') }}
  </div>
  <div v-if="stageControl" class="text-subtitle1 absolute-center progress_style text-center">
    {{ stageControl.getStage() }}
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'ProgressPage',
  props: {
    stageControl: {
      type: Object,
    },
  },
  setup() {
    const { t } = useI18n({ useScope: 'global' });
    return {
      t,
    };
  },
});
</script>

<style>
.progress_style {
  margin: 100px 0 0 0;
}
</style>
