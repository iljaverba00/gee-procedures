<script lang="ts">
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from '../../../service/procedureUtills.ts';
import requests from '../../../service/requests.ts';
import { setupComponentValidator } from '../../../service/providerInjection.ts';
import {
  QItem,
  QSpinner,
  QItemSection,
  QSelect
} from 'quasar';

export default defineComponent({
  name: 'ChooseSqlSelectPair',
  props: ['modelValue'],
  setup(props) {
    const rules = rulesProcedureParams();
    const options = ref<{ label: string; value: string; }[]>([]);

    const runSql = async (text: string) => {
      const sqlQuery = props.modelValue?.sqlSelect?.originalText;
      const innerParams = props.modelValue?.innerParams;
      if (sqlQuery) {
        //todo
        const rez = await requests.sqlProcedure(0, sqlQuery, text, innerParams[0]);
        const mapRez = [];
        if (rez?.rows?.length) {
          for (const rezElement of rez.rows) {
            mapRez.push({
              label: rezElement?.[1],
              value: rezElement?.[0],
            });
          }
        }
        console.log(mapRez);
        return mapRez;
      }
      return [];
    };

    const refChoosePair = ref<QSelect>();
    return {
      refChoosePair,
      marginBottom: ref(''),
      rules,
      model: ref(null),
      options,
      filterFn(val: string, update: (f: () => void) => void) {
        update(async () => {
          options.value = !val ? [] : await runSql(val.trim().toLowerCase());
        });
      },
    };
  },
  created() {
    setupComponentValidator(() => {
      this.refChoosePair?.validate();
    });
  },
  methods: {
    update(value: { value: string }) {
      this.modelValue.selectValue = value?.value;
      this.$emit('update:modelValue', this.modelValue);
    },
    getRules() {
      if (this.modelValue.nullable) this.marginBottom = 'margin-bottom: 20px';
      return this.modelValue.nullable ? undefined : this.rules.choosePair;
    },
  },
});
</script>

<template>
  <q-select
    ref="refChoosePair"
    :placeholder="model ? '' : 'Начните вводить текст для поиска...'"
    outlined
    use-input
    @filter="filterFn"
    v-model="model"
    :options="options"
    :label="modelValue.description"
    @update:model-value="update"
    :rules="getRules()"
    :style="marginBottom"
    map-options
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section v-if="!options">
          <q-spinner color="primary" size="3em" />
        </q-item-section>
        <q-item-section v-else class="text-grey q-ma-xs"> Ничего нет :(</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
