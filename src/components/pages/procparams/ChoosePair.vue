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
        <q-item-section class="text-grey q-ma-xs"> Ничего нет :( </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from 'components/procedure/procedureUtills';

export default defineComponent({
  name: 'ChoosePair',
  props: ['modelValue'],
  setup(props) {
    const rules = rulesProcedureParams();
    const filterOptions = ref(props.modelValue.values.concat([]));
    return {
      marginBottom: ref(''),
      rules,
      unsubscribe: ref(),
      model: ref(null),
      filterOptions,
      check() {
        this.$refs.refChoosePair?.validate();
      },
      filterFn(val, update) {
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
        this.initial(value);
      },
      immediate: true,
    },
  },
  methods: {
    update(value) {
      const index = this.modelValue.values.indexOf(value);
      // eslint-disable-next-line vue/no-mutating-props
      this.modelValue.selectValue = index;
      this.$emit('update:modelValue', this.modelValue);
    },
    initial(value) {
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
      return this.modelValue.nullable ? null : this.rules.choosePair;
    },
  },
});
</script>
