<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { procedureRequests } from 'src/services/Data.service';
import ChooseCertificateCSP from 'components/Files/signingCSP/ChooseCertificateCSP.vue';
import { triggerWarning } from 'src/services/Notification.service';
import { signXML } from 'components/procedure/pages/dialogs/eiszsUI';

const store = useStore();

const props = defineProps(['data']);
const emits = defineEmits(['press']);
const { map: filesForSign, content: strXmlForSign } = props.data;

const processId = computed(
  () => Object.keys(store.getters['modules/getProcedureInstances'] ?? {})[0],
);
const showChooseCertificateDialog = ref(false);
const selectedCertificate = ref();

async function uploadResult() {
  if (!selectedCertificate.value) {
    triggerWarning('Сертификат не выбран');
    return;
  }

  const res = await signXMLDoc();
  if (res) {
    await procedureRequests.parametersPushProcedure(res, processId.value);
    emits('press', {});
  } else {
    triggerWarning('Ошибка при формировании документа');
  }
}

async function setCertificate(cert) {
  selectedCertificate.value = cert;
}

async function signXMLDoc() {
  const domParser = new DOMParser();
  const inputXML = domParser.parseFromString(strXmlForSign, 'application/xml');
  const xml = await signXML(inputXML, selectedCertificate.value, filesForSign);
  return new XMLSerializer().serializeToString(xml);
}
</script>

<template>
  <q-card style="height: 100%">
    <q-card-section class="text-subtitle2">
      Файлы для подписания:
      <div class="text-h6" v-for="fileName in Object.keys(filesForSign)" :key="fileName">
        {{ fileName }}
      </div>
    </q-card-section>

    <q-card-section class="text-subtitle2">
      Выбранный сертификат:
      {{ selectedCertificate ?? 'не выбран' }}
    </q-card-section>

    <q-card-actions>
      <q-btn color="primary" @click="showChooseCertificateDialog = true" style="width: 150px">
        (1) Выбрать сертификат
      </q-btn>
      <q-btn
        :loading="showChooseCertificateDialog"
        color="primary"
        @click="uploadResult()"
        style="width: 150px"
      >
        (2) Подписать и отправить
      </q-btn>
    </q-card-actions>
  </q-card>

  <ChooseCertificateCSP v-model:show-dialog="showChooseCertificateDialog" @done="setCertificate" />
</template>
