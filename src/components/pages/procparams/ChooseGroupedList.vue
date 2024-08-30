<template>
  <q-select
    ref="refChooseGroupedList"
    outlined
    multiple
    use-chips
    stack-label
    :label="modelValue.description"
    v-model="model"
    :options="modelValue.chooseSet.flat()"
    @update:model-value="this.update"
    :rules="getRules()"
    :style="marginBottom"
  />
</template>

<script>
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from 'components/procedure/procedureUtills';

export default defineComponent({
  name: 'ChooseGroupedList',
  props: ['modelValue'],
  setup(props, { emit }) {
    emit('updateSelected', []);
    const rules = rulesProcedureParams();
    return {
      marginBottom: ref(''),
      rules,
      unsubscribe: ref(),
      model: ref(),
      check() {
        this.$refs.refChooseGroupedList.validate();
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
  methods: {
    update(arr) {
      const flatChooseSet = this.modelValue.chooseSet.flat();
      const emitVal = arr.map((val) => flatChooseSet.indexOf(val));
      this.$emit('updateSelected', emitVal);
    },
    getRules() {
      if (this.modelValue.nullable) this.marginBottom = 'margin-bottom: 20px';
      return this.modelValue.nullable ? null : this.rules.chooseGroupedList;
    },
  },
});
</script>
