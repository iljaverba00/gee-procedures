<template>
  <div class="bg-green-1" style="margin-bottom: 20px; padding: 16px">
    <div style="margin-bottom: 16px; font-weight: bold">{{ modelValue?.description }}</div>
    <div v-for="field of modelValue.targetFields" :key="field.key" style="margin-bottom: 20px">
      <q-select
        outlined
        multiple
        use-chips
        clearable
        stack-label
        v-model="field.selectValue"
        :label="field.name"
        :options="modelValue.sourceFields"
        option-value="key"
        option-label="name"
      ></q-select>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
export default {
  name: 'MatchingFields',
  setup() {
    return {
      model: ref(null),
    };
  },
  props: ['modelValue'],
};
</script>
