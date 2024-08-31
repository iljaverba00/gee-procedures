<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import Params from './Params.vue';
import { ProcedureParam } from '../../service/types.ts';

export default defineComponent({
  name: 'ParamsPage',
  components: { Params },
  props: ['procedureParams', 'procedureName', 'procedureGroup', 'procedureId'],
  watch: {
    parameters: {
      handler(n) {
        if (!this.saveSet) return;
        this.saveProcData(n);
      },
      deep: true,
    },
    saveSet: {
      handler() {
        this.saveProcData(this.parameters);
      },
    },
  },
  setup() {
    return {
      parameters: ref(),
      saveSet: ref(false),
    };
  },
  methods: {
    saveProcData(params: ProcedureParam[]) {
      let data = localStorage.getItem('saveProcData');
      if (!data) data = '[]';
      const saveProcData = JSON.parse(data);
      if (!this.saveSet) {
        let ind = saveProcData.findIndex((obj:{id:string}) => obj.id == this.procedureId);
        if (ind != -1) saveProcData.splice(ind, 1);
        const saveToLS = JSON.stringify(saveProcData);
        localStorage.setItem('saveProcData', saveToLS);
        return;
      }
      for (let i in params) {
        if (params[i]?.keys) {
          if (typeof params[i].selectValue == 'number') {
            params[i].selectValue = params[i].keys[params[i].selectValue];
            params[i].defaultValue = params[i].selectValue;
          }
        }
      }
      const newObj = {
        id: this.procedureId,
        value: params,
        save: this.saveSet,
      };
      let index = saveProcData.findIndex((obj: { id: string }) => obj.id == this.procedureId);
      if (index != -1) saveProcData.splice(index, 1);
      saveProcData.push(newObj);
      const saveToLS = JSON.stringify(saveProcData);
      localStorage.setItem('saveProcData', saveToLS);
    },
    checkSave() {
      let prms;
      let data = localStorage.getItem('saveProcData');
      if (!data) return (prms = this.procedureParams.parameters);
      const saveProcData = JSON.parse(data);
      const obj = saveProcData.find((el: {id:string}) => el.id == this.procedureId);

      if (obj && obj?.save) {
        this.saveSet = true;
        prms = obj.value;
      } else {
        prms = this.procedureParams.parameters;
      }
      return prms;
    },
  },
  mounted() {
    this.parameters = this.checkSave();
  },
});
</script>

<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-card-section class="display:inline" v-if="procedureName && procedureGroup">
    <div class="text-subtitle1">
      <strong> Заполните параметры </strong>
      <q-checkbox class="float-right" v-model="saveSet" left-label label="Сохранение"
      >
        <q-tooltip>Сохранение введённых данных</q-tooltip>
      </q-checkbox
      >
    </div>
    <div class="text-subtitle2">{{ procedureGroup + ' / ' + procedureName }}</div>
  </q-card-section>
  <div class="dialog-list1">
    <params v-model:procedure-params="parameters" />
  </div>
</template>

<style scoped>
.dialog-list1 {
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
}
</style>
