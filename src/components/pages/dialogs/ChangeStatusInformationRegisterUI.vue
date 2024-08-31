<template>
  <q-card style="height: 100%">
    <q-card-section class="text-subtitle2">
      <div>
        Число записей: {{ data?.pks?.length }} <br />
        Им будет присвоен статус « {{ data?.status }} »<br />
        После нажатия кнопки «Подписать файлы» будут подписаны все <br />
        прикрепленные файлы к связанным записям из таблицы «Приказ_433»
      </div>
    </q-card-section>

    <q-card-section class="text-subtitle2">
      Файлы для подписания:
      <div v-for="file in data?.filesForSignIn" :key="file.fileId.id">
        {{ file.fileName }}
      </div>
    </q-card-section>

    <q-card-actions>
      <q-btn :loading="showSigningDialog" color="primary" @click="signFiles" style="width: 150px">
        Подписать файлы
        <template v-slot:loading>
          <q-spinner-gears class="on-left" />
          Подписание ...
        </template>
      </q-btn>
    </q-card-actions>
  </q-card>

  <signing-dialog-c-s-p
    v-model:show-dialog="showSigningDialog"
    :filesForSigning="filesForSigning"
    @signing-finished="uploadCertificates"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { PUBLIC_PATH } from 'src/services/build';
import { useStore } from 'vuex';
import SigningDialogCSP from 'components/Files/signingCSP/SigningDialogCSP.vue';
import { procedureRequests, xFiles } from 'src/services/Data.service';

const { t } = useI18n({ useScope: 'global' });

const store = useStore();

const props = defineProps(['data']);
const emits = defineEmits(['press']);
const { data: data } = toRefs(props);

const showSigningDialog = ref(false);
const filesForSigning = ref([]);
const signed = ref(false); // Подписаны ли файлы

const processId = computed(() => {
  const instances = store.getters['modules/getProcedureInstances'];
  return instances ? Object.keys(instances)?.[0] : undefined;
});

const signFiles = async () => {
  filesForSigning.value = [];

  for await (const fileDescription of data.value.filesDescriptions) {
    const file = await getFile(
      fileDescription.fileId.id,
      fileDescription.tableId,
      fileDescription.fileName,
    );
    filesForSigning.value.push(file);
  }
  showSigningDialog.value = true;
};

//После подписания файлов, получаем сертификаты и отправляем их на сервер
const uploadCertificates = async (certificates) => {
  if (certificates?.length) {
    const allCertificates = certificates.map((cert) => cert.ECPfile);
    await procedureRequests.uploadFileProcedure('certificates', allCertificates, processId.value);

    emits('press', {}); //
  }
};

// onMounted(() => {
//   console.log(`the component is now mounted.`)
// })

const getFile = async (fileId, factId, fileName) => {
  // const response = await fetch(getUrl(fileId, baseUrl, factId, cardSetting));
  // const zipBuffer = new Uint8Array(await response.arrayBuffer());
  // const unzipped = multithreaded
  //     ? await new Promise((resolve, reject) => unzip(zipBuffer, (err, result) => (err ? reject(err) : resolve(result))))
  //     : unzipSync(zipBuffer);
  // const fileArray = [];
  // for (let filename in unzipped) {
  //   if (unzipped[filename].length > 0) {
  //     fileArray.push(new File([unzipped[filename]], filename));
  //   }
  // }
  // return fileArray;

  return await fetch(getUrlToFile(factId, fileId)).then(
    (dat) =>
      new Promise(async (resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          console.log(reader.result);
          const file = new File([reader.result], fileName);
          resolve(file);
        };
        reader.readAsArrayBuffer(await dat.blob());
      }),
  );
};

const getUrlToFile = (factId, fileId) => {
  return xFiles.getLink(null, factId, fileId);
};
</script>

<style scoped lang="sass"></style>
