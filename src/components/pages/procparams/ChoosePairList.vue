<script lang="ts">
/* eslint-disable vue/no-mutating-props */
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from '../../../service/procedureUtills.ts';
import { setupComponentValidator } from '../../../service/providerInjection.ts';

export default defineComponent({
  name: 'ChoosePairList',
  props: ['modelValue'],
  setup(props) {
    const rules = rulesProcedureParams();
    const filterOptions = ref(props.modelValue.values.concat([]));
    const refChoosePairList = ref();

    return {
      refChoosePairList,
      marginBottom: ref(''),
      rules,
      model: ref<any[]>([]),
      filterOptions,
      filterFn(val: string, update: (f: () => void) => void) {
        if (val === '') {
          update(() => {
            filterOptions.value = props.modelValue.values.concat([]);
          });
          return;
        }
        update(() => {
          let needle = val.toLowerCase();
          filterOptions.value = props.modelValue.values
            .concat([])
            .filter((item: string) => item.toLowerCase().indexOf(needle) > -1);
        });
      },
    };
  },
  created() {
    setupComponentValidator(() => {
      this.refChoosePairList?.validate();
    });
  },
  watch: {
    modelValue: {
      handler() {
        this.initial();
      },
      immediate: true,
    },
  },

  methods: {
    initial() {
      if (this.modelValue.defaultValue) {
        for (let i = 0; i < this.modelValue.keys.length; i++) {
          if (
            JSON.stringify(this.modelValue.keys[i]) === JSON.stringify(this.modelValue.defaultValue)
          ) {
            this.modelValue.selectValue = i;
            this.model.push(this.modelValue.values[i]);
          }
        }
      }
    },
    update(arr: string[]) {
      this.modelValue.selectValue = [];
      for (let i = 0; i < arr.length; i++) {
        let index = this.modelValue.values.indexOf(arr[i]);
        this.modelValue.selectValue.push(index);
      }
      this.$emit('update:modelValue', this.modelValue);
    },
    getRules() {
      if (this.modelValue.nullable) this.marginBottom = 'margin-bottom: 20px';
      return this.modelValue.nullable ? undefined : this.rules.choosePairList;
    },
  },
});
</script>
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-select
    ref="refChoosePairList"
    :placeholder="model ? '' : 'Начните вводить текст для поиска...'"
    outlined
    multiple
    use-chips
    use-input
    stack-label
    @filter="filterFn"
    v-model:label="modelValue.description"
    v-model="model"
    :options="filterOptions"
    @update:model-value="update"
    :rules="getRules()"
    :style="marginBottom"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey q-ma-xs"> Ничего нет :(</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

