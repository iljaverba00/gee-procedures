<script setup lang="ts">

import { onMounted, ref, toRefs } from 'vue';
import { rulesProcedureParams } from '../../../service/procedureUtills.ts';
// import SigningFileDialog from 'components/Files/SigningFileDialog.vue';
import { QFile, ValidationRule } from 'quasar';
import { ppDialogType } from '../../../service/types.ts';
import { setupComponentValidator } from '../../../service/providerInjection.ts';

const props = defineProps<{ modelValue: any }>();
const { modelValue } = toRefs(props);

const refFile = ref<QFile>();
const marginBottom = ref('');
const rules = rulesProcedureParams();
const showSigningFileDialog = ref(false);

onMounted(() => {
  setupComponentValidator(()=>{
    refFile.value?.validate();
  })
});


const signDocument = async () => {
  showSigningFileDialog.value = true;
};
const getRules = (): ValidationRule[] | undefined => {
  if (modelValue?.value.nullable) {
    marginBottom.value = 'margin-bottom: 20px';
    return;
  }
  return rules.chooseFile;
};
const fileName = () => {
  if (!modelValue?.value.ext) return;
  let supportedExts = modelValue.value.ext.map((el:string) => '.' + el);
  if (modelValue.value.mask?.includes('mid')) {
    supportedExts.push('.mid');
  }
  if (modelValue.value.ext.includes('shp')) {
    const match = modelValue.value.mask?.match(/\\N\.\{(.+?)\}/);
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
        .map((v:string) => `.${v.trim()}`);
      supportedExts = supportedExts.concat(maskFormats);
    }
  } catch (ignore) {
  }

  return supportedExts.join(', ');
};

</script>

<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-file
    ref="refFile"
    v-model="modelValue.selectValue"
    :label="modelValue.description"
    outlined
    use-chips
    :multiple="
      modelValue.dialogType !== ppDialogType.LOAD_FILE ||
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
        label="Подписать файл"
        @click="signDocument()"
      />
    </template>
  </q-file>


  <!--  <SigningFileDialog-->
  <!--    v-model:show-dialog="showSigningFileDialog"-->
  <!--    :certificate="showSigningFileDialog"-->
  <!--    :insideFiles="false"-->
  <!--    @update:certificate="showSigningFileDialog = $event"-->
  <!--    :filesMap="false"-->
  <!--    :files="null"-->
  <!--    :factId="null"-->
  <!--    :cardSetting="null"-->
  <!--    :model="model"-->
  <!--    @model-updated="updateModel"-->
  <!--    :selected="modelValue.selectValue"-->
  <!--    :seamless="true"-->
  <!--  />-->
</template>
