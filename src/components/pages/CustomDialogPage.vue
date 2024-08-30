<script setup>
import { toRefs } from 'vue';
import ChangeStatusInformationRegisterUI from 'components/procedure/pages/dialogs/ChangeStatusInformationRegisterUI.vue';
import EiszsUI from 'components/procedure/pages/dialogs/EiszsUI.vue';

const props = defineProps(['data']);
const emits = defineEmits(['press']);
const { data: data } = toRefs(props);

const pressNext = (val) => {
  emits('press', val);
};
</script>

<template>
  <change-status-information-register-u-i
    v-if="data?.type === 'com.geocad.wc.procedure.ogd.ui.ChangeStatusInformationRegisterUI'"
    :data="data"
    @press="pressNext"
  />
  <eiszs-u-i
    v-else-if="data?.type === 'com.geocad.wc.procedure.smev.ui.eiszhs.EiszsUI'"
    :data="data"
    @press="pressNext"
  />
</template>
