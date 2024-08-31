<script lang="ts">
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from '../../../service/procedureUtills.ts';
import { setupComponentValidator } from '../../../service/providerInjection.ts';

export default defineComponent({
  name: 'ChooseGroupedList',
  props: ['modelValue'],
  setup(_, { emit }) {
    emit('updateSelected', []);
    const rules = rulesProcedureParams();
    const refChooseGroupedList = ref();
    return {
      refChooseGroupedList,
      marginBottom: ref(''),
      rules,
      model: ref(),
    };
  },
  created() {
    setupComponentValidator(() => {
      this.refChooseGroupedList?.validate();
    });
  },
  methods: {
    update(arr: string[]) {
      const flatChooseSet = this.modelValue.chooseSet.flat();
      const emitVal = arr.map((val) => flatChooseSet.indexOf(val));
      this.$emit('updateSelected', emitVal);
    },
    getRules() {
      if (this.modelValue.nullable) this.marginBottom = 'margin-bottom: 20px';
      return this.modelValue.nullable ? undefined : this.rules.chooseGroupedList;
    },
  },
});
</script>

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
    @update:model-value="update"
    :rules="getRules()"
    :style="marginBottom"
  />
</template>
