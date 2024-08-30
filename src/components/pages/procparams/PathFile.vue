<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-file
    ref="refFile"
    v-model="modelValue.selectValue"
    :label="modelValue.description"
    outlined
    use-chips
    :multiple="
      modelValue.dialogType !== 'LOAD_FILE' ||
      modelValue.name == 'LOAD_FILES_ImportMapInfo' ||
      modelValue.name == 'LOAD_GRAPHIC_3D'
    "
    :accept="fileName()"
    :rules="getRules()"
    :style="marginBottom"
  >
    <template v-if="modelValue.signSupport && modelValue.selectValue?.length" #append>
      <q-btn
        :disable="!modelValue.selectValue"
        outline
        :label="t('FileDialog.fileMenu.signFile')"
        @click="signDocument()"
      />
    </template>
  </q-file>
  <!--    @rejected="onRejected"-->
  <!--    lazy-rules-->
  <!--    :rules="getRules()"-->
  <!--    :accept="modelValue.ext ?'.'+modelValue.ext[0]:''"-->
  <!--  />-->
  <SigningFileDialog
    v-model:show-dialog="showSigningFileDialog"
    :certificate="showSigningFileDialog"
    :insideFiles="false"
    @update:certificate="showSigningFileDialog = $event"
    :filesMap="false"
    :files="null"
    :factId="null"
    :cardSetting="null"
    :model="model"
    @model-updated="updateModel"
    :selected="modelValue.selectValue"
    :seamless="true"
  />
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, toRefs, computed } from 'vue';
import { triggerNegative } from 'src/services/Notification.service';
import { rulesProcedureParams } from 'components/procedure/procedureUtills';
import { useI18n } from 'vue-i18n';
import SigningFileDialog from 'components/Files/SigningFileDialog.vue';
// import { getECPFromProcedure, creatingECP } from 'components/Files/FileDialog.js';
import { useStore } from 'vuex';

const $store = useStore();

const props = defineProps(['modelValue']);
const { modelValue } = toRefs(props);

const { t } = useI18n({ useScope: 'global' });
const refFile = ref(null);
const marginBottom = ref('');
const unsubscribe = ref();
const rules = rulesProcedureParams();
const showSigningFileDialog = ref(false);
const model = ref('');

onMounted(() => {
  unsubscribe.value = $store.subscribe((mutation) => {
    if (mutation.type === 'modules/updateProcedureCheck') {
      check();
    }
  });
});
onBeforeUnmount(() => {
  unsubscribe.value?.();
});

const check = () => {
  refFile.value?.validate();
};

const updateModel = (newValue) => {
  model.value = newValue;
};
const signDocument = async () => {
  showSigningFileDialog.value = true;
};
const onRejected = (rejEnt) => {
  triggerNegative(rejEnt.length + ' Файл(ов) имеют неверный формат');
};
const getRules = () => {
  if (modelValue.value.nullable) {
    marginBottom.value = 'margin-bottom: 20px';
    return null;
  }

  return rules.chooseFile;
  // switch (  modelValue.value.dialogType){
  //   case "LOAD_FILE" :
  //     return  rules.chooseFile
  //   default:
};
const fileName = () => {
  if (!modelValue.value.ext) return;
  let supportedExts = modelValue.value.ext.map((el) => '.' + el);
  if (modelValue.value.mask?.includes('mid')) {
    supportedExts.push('.mid');
  }
  if (modelValue.value.ext.includes('shp')) {
    let match = modelValue.value.mask.match(/\\N\.\{(.+?)\}/);
    if (match) {
      let extensions = match[1].split(',');
      if (extensions.includes('shx') && extensions.includes('dbf')) {
        supportedExts.push('.shx', '.dbf');
      }
    }
  }
  try {
    const mask = modelValue.value.mask;
    if (mask) {
      const maskFormats = mask
        .replaceAll('}', '')
        .split('{')[1]
        .split(',')
        .map((v) => `.${v.trim()}`);
      supportedExts = supportedExts.concat(maskFormats);
    }
  } catch (ignore) {}

  return supportedExts.join(', ');
};

const processId = computed(() => {
  return $store.state.modules.ProcedureProperty.processId;
});
</script>
<style></style>
