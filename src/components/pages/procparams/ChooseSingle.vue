<template>
  <q-select
    ref="refChooseSingle"
    :placeholder="model ? '' : 'Начните вводить текст для поиска...'"
    outlined
    v-model="model"
    use-input
    @filter="filterFn"
    :options="filterOptions"
    :option-label="(item) => (typeof item === 'string' ? item : item.name)"
    :label="modelValue.description"
    @update:model-value="update"
    :rules="getRules()"
    :style="marginBottom"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey q-ma-xs"> Ничего нет :( </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from 'components/procedure/procedureUtills';

export default defineComponent({
  name: 'ChooseSingle',
  emits: ['update:modelValue'],
  props: ['modelValue'],
  data() {
    const rules = rulesProcedureParams();

    return {
      unsubscribe: ref(),
      model: ref(),
      rules,
      check() {
        this.$refs.refChooseSingle?.validate();
      },
    };
  },

  setup(props) {
    const filterOptions = ref(props.modelValue.chooseSet.concat([]));

    return {
      marginBottom: ref(''),

      filterOptions,

      filterFn(val, update) {
        if (val === '') {
          update(() => {
            filterOptions.value = props.modelValue.chooseSet.concat([]);
          });
          return;
        }
        update(() => {
          let needle = val.toLowerCase();
          filterOptions.value = props.modelValue.chooseSet
            .concat([])
            .filter((item) => item.toLowerCase().indexOf(needle) > -1);
        });
      },
    };
  },

  created() {
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'modules/updateProcedureCheck') {
        this.check();
      }
    });
  },
  beforeUnmount() {
    this.unsubscribe();
  },
  watch: {
    modelValue: {
      handler(value) {
        !!this.model || (this.model = this.modelValue.chooseSet[this.modelValue.defaultValue]);
      },
      immediate: true,
    },
  },
  methods: {
    update(value) {
      const clone = Object.assign({}, this.modelValue);
      clone.selectValue = this.modelValue.chooseSet.indexOf(value);
      this.$emit('update:modelValue', clone);
    },
    getRules() {
      if (this.modelValue.nullable) this.marginBottom = 'margin-bottom: 20px';
      return this.modelValue.nullable ? null : this.rules.chooseSingle;
    },
  },
});
</script>
