<template>
  <q-card-section class="dialog-list1 full-width full-height">
    <dq-scroll-area style="height: 100%">
      <div v-if="downloadLinks.length > 0" class="text-subtitle1 finish-page-item">
        Файлы для скачивания:
      </div>

      <div v-if="downloadLinks?.length > 1" class="finish-page-item">
        <q-btn
          unelevated
          rounded
          color="red"
          label="Скачать все"
          icon="download"
          v-on:click="downloadALL()"
        />
      </div>

      <div v-for="link of this.downloadLinks" :key="link" class="finish-page-item">
        <q-btn
          unelevated
          rounded
          color="primary"
          :label="link.fileName"
          icon="download"
          v-on:click="downloadLink(link)"
        />
      </div>

      <div v-if="messages.length" class="finish-page-item">
        <div class="text-subtitle1">
          <q-icon name="warning" class="text-orange" />
          <q-icon name="warning" class="text-orange" />
          Сообщения
        </div>
      </div>

      <div
        v-for="message of this.messages"
        :key="message"
        class="bg-orange-1 finish-page-item"
        style="padding: 5px"
      >
        <div v-html="message" />
      </div>
      <div
        v-if="!messages.length && !downloadLinks.length && !postProcess"
        class="text-subtitle1 finish-page-item"
      >
        Процедура выполнена!
      </div>

      <div v-if="postProcess" class="full-height finish-page-item">
        <div class="text-subtitle1 finish-page-item">
          <q-icon name="warning" class="text-blue" />
          <q-icon name="warning" class="text-blue" />
          Результат
        </div>

        <div v-for="proc of postProcess.getProcesses()" :key="proc.type">
          <div v-if="proc.type === 'SHOW_RESULT'" class="bg-blue-1" style="padding: 5px">
            <div v-html="proc.message" />
          </div>

          <div v-if="proc.type === 'SHOW_GRAPHIC_OBJECTS'" class="bg-blue-1" style="padding: 5px">
            <div v-html="proc.graphIds" />
          </div>
        </div>
      </div>
    </dq-scroll-area>
  </q-card-section>
</template>

<script>
import { openURL } from 'quasar';
import { defineComponent } from 'vue';
import { procedureRequests } from 'src/services/Data.service.js';

export default defineComponent({
  name: 'FinishPage',
  props: {
    downloadLinks: {
      type: Array,
      required: true,
      default: (_) => [],
      default: (_) => [],
    },
    messages: {
      type: Array,
      required: true,
      default: (_) => [],
      default: (_) => [],
    },
    postProcess: {
      type: Object,
    },
    processId: {
      type: String,
      type: Object,
    },
    processId: {
      type: String,
    },
  },
  methods: {
    downloadLink(file) {
      openURL(procedureRequests.getDownloadLink(file.fileUid, file.fileName, this.processId));
    },
    downloadALL() {
      openURL(procedureRequests.getDownloadAllLink(this.processId));
    },
  },
});
</script>

<style>
.dialog-list1 {
  overflow-y: hidden;
  overflow-x: hidden;
  user-select: none;
}
.finish-page-item {
  margin-bottom: 8px;
}
</style>
