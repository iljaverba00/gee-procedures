<script lang="ts">
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from '../../../service/procedureUtills.ts';
import { setupComponentValidator } from '../../../service/providerInjection.ts';

export default defineComponent({
  name: 'ChoosePair',
  props: ['modelValue'],
  setup(props) {
    const rules = rulesProcedureParams();
    const filterOptions = ref(props.modelValue.values.concat([]));
    const refChoosePair = ref();
    return {
      refChoosePair,
      marginBottom: ref(''),
      rules,
      model: ref(null),
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
      this.refChoosePair?.validate();
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
    update(value: string) {
      const index = this.modelValue.values.indexOf(value);
      // eslint-disable-next-line vue/no-mutating-props
      this.modelValue.selectValue = index;
      this.$emit('update:modelValue', this.modelValue);
    },
    initial() {
      for (let i = 0; i < this.modelValue.keys.length; i++) {
        if (
          JSON.stringify(this.modelValue.keys[i]) === JSON.stringify(this.modelValue.defaultValue)
        ) {
          // eslint-disable-next-line vue/no-mutating-props
          this.modelValue.selectValue = i;
          this.model = this.modelValue.values[i];
          break;
        }
      }
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
    :options="filterOptions"
    :label="modelValue.description"
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
