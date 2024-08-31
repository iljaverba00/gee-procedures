<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ErrorPage',
  props: ['msg', 'name'],
  setup() {
    return {
      errorBlock: ref(false),
    };
  },
  methods: {
    copy() {
      if (!window.isSecureContext) {
        alert('Работа с буфером обмена возможно только при протоколе HTTPS');
        return;
      }
      navigator.clipboard
        .writeText(this.msg)
        .catch((_) => alert('Ошибка при копировании, повторите попытку'))
        .then((_) => alert('Копирование выполнено успешно'));
    },

    //TODO: пока сделал так, но по хорошему нужно чтобы приходило с сервера
    errorMsg() {
      let length = this.msg.split('Exception: ').length;
      let arrError = [];
      let j = 0;
      for (let i = 0; i < length; i++) {
        let item = this.msg.split('Exception: ')[i].split('at')[0];
        if (!isNaN(item[0])) {
          arrError[j] = item;
          j++;
        }
      }
      return arrError;
    },

    getHeightErrorBlock() {
      const height = document.getElementById('firstErrorBlock')?.offsetHeight ?? 0;
      return height + 12;
    },
  },
});
</script>

<template>
  <!-- <div class="q-pa-sm text-subtitle1 text-red" style="display: inline-flex">
    Ошибка выполнения процедуры {{`'${name}'`}}
  </div> -->

  <div id="firstErrorBlock" class="error-head text-subtitle1 text-red">
    <div v-for="text in errorMsg()" :key="text">{{ text }}</div>
    <q-icon
      v-if="!errorBlock"
      name="keyboard_double_arrow_down"
      class="arrowDown"
      size="2.5em"
      @click="errorBlock = true"
    />
  </div>

  <div
    v-if="errorBlock"
    class="error-body bg-red"
    :style="`height: calc(100% - ${getHeightErrorBlock()}px)`"
  >
    {{ msg }}
  </div>
  <q-btn
    v-if="errorBlock"
    label="Копировать лог ошибки"
    class="bg-primary text-white q-ma-sm"
    @click="copy"
  />
  <q-icon
    v-if="errorBlock"
    name="keyboard_double_arrow_up"
    class="arrowUp"
    size="2.5em"
    @click="errorBlock = false"
  />
</template>

<style>
.error-body {
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  user-select: text;
  font-size: 0.9em;
  /* height: calc(100% - 130px); */
  margin: 0 8px 0 8px;
  padding: 8px;
  border-radius: 4px;
}

.error-head {
  user-select: text;
  font-size: 1.1em;
  margin: 0 8px 0 8px;
  padding: 8px;
}

.arrowDown {
  margin-left: calc(50% - 8px);
  color: rgb(0, 0, 0);
}

.arrowDown:hover {
  cursor: pointer;
  color: rgb(255, 0, 0);
}

.arrowUp {
  color: rgb(0, 0, 0);
}

.arrowUp:hover {
  cursor: pointer;
  color: rgb(255, 0, 0);
}
</style>
