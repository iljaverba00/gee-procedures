<!--<script setup lang="ts">-->

<!--//todo-->
<!--import { ref, toRefs } from 'vue';-->
<!--import requests from '../../../service/requests.ts';-->
<!--import { xFiles } from 'src/services/Data.service';-->
<!--import { processIdPI } from '../../../service/providerInjection.ts';-->


<!--const props = defineProps(['data']);-->
<!--const emits = defineEmits(['press']);-->
<!--const { data: data } = toRefs(props);-->

<!--const showSigningDialog = ref(false);-->
<!--const filesForSigning = ref([]);-->

<!--const processId = processIdPI.injection();-->

<!--const signFiles = async () => {-->
<!--  filesForSigning.value = [];-->

<!--  for await (const fileDescription of data.value.filesDescriptions) {-->
<!--    const file = await getFile(-->
<!--      fileDescription.fileId.id,-->
<!--      fileDescription.tableId,-->
<!--      fileDescription.fileName,-->
<!--    );-->
<!--    filesForSigning.value.push(file);-->
<!--  }-->
<!--  showSigningDialog.value = true;-->
<!--};-->

<!--//После подписания файлов, получаем сертификаты и отправляем их на сервер-->
<!--// const uploadCertificates = async (certificates) => {-->
<!--//   if (certificates?.length) {-->
<!--//     const allCertificates = certificates.map((cert) => cert.ECPfile);-->
<!--//     await requests.uploadFileProcedure('certificates', allCertificates, processId);-->
<!--//-->
<!--//     emits('press', {}); //-->
<!--//   }-->
<!--// };-->

<!--const getFile = async (fileId, factId, fileName) => {-->
<!--  return await fetch(getUrlToFile(factId, fileId)).then(-->
<!--    (dat) =>-->
<!--      new Promise(async (resolve, reject) => {-->
<!--        const reader = new FileReader();-->
<!--        reader.onerror = reject;-->
<!--        reader.onload = () => {-->
<!--          console.log(reader.result);-->
<!--          const file = new File([reader.result], fileName);-->
<!--          resolve(file);-->
<!--        };-->
<!--        reader.readAsArrayBuffer(await dat.blob());-->
<!--      }),-->
<!--  );-->
<!--};-->

<!--const getUrlToFile = (factId:string, fileId:string) => {-->
<!--  return xFiles.getLink(null, factId, fileId);-->
<!--};-->
<!--</script>-->
<!--<template>-->
<!--  <q-card style="height: 100%">-->
<!--    <q-card-section class="text-subtitle2">-->
<!--      <div>-->
<!--        Число записей: {{ data?.pks?.length }} <br />-->
<!--        Им будет присвоен статус « {{ data?.status }} »<br />-->
<!--        После нажатия кнопки «Подписать файлы» будут подписаны все <br />-->
<!--        прикрепленные файлы к связанным записям из таблицы «Приказ_433»-->
<!--      </div>-->
<!--    </q-card-section>-->

<!--    <q-card-section class="text-subtitle2">-->
<!--      Файлы для подписания:-->
<!--      <div v-for="file in data?.filesForSignIn" :key="file.fileId.id">-->
<!--        {{ file.fileName }}-->
<!--      </div>-->
<!--    </q-card-section>-->

<!--    <q-card-actions>-->
<!--      <q-btn :loading="showSigningDialog" color="primary" @click="signFiles" style="width: 150px">-->
<!--        Подписать файлы-->
<!--        <template v-slot:loading>-->
<!--          <q-spinner-gears class="on-left" />-->
<!--          Подписание ...-->
<!--        </template>-->
<!--      </q-btn>-->
<!--    </q-card-actions>-->
<!--  </q-card>-->

<!--&lt;!&ndash;  <signing-dialog-c-s-p&ndash;&gt;-->
<!--&lt;!&ndash;    v-model:show-dialog="showSigningDialog"&ndash;&gt;-->
<!--&lt;!&ndash;    :filesForSigning="filesForSigning"&ndash;&gt;-->
<!--&lt;!&ndash;    @signing-finished="uploadCertificates"&ndash;&gt;-->
<!--&lt;!&ndash;  />&ndash;&gt;-->
<!--</template>-->

