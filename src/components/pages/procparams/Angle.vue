<script lang="ts">

import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from 'src/service/procedureUtills';
import { setupComponentValidator } from 'src/service/providerInjection';



export default defineComponent({
  name: 'Angle',
  props: ['modelValue'],
  setup() {
    const rules = rulesProcedureParams();
    const inputRef = ref();
    return {
      inputRef,
      deg: ref(0),
      min: ref(0),
      sec: ref(0),
      rules,
    };
  },

  created() {
    setupComponentValidator(() => {
      this.inputRef?.validate();
    });
  },

  methods: {
    conv(d: number, m: number, s: number) {
      // eslint-disable-next-line vue/no-mutating-props
      this.modelValue.selectValue = ((d + (m + s / 60) / 60) * Math.PI) / 180;
    },
  },

  watch: {
    deg() {
      this.conv(this.deg, this.min, this.sec);
    },
    min() {
      this.conv(this.deg, this.min, this.sec);
    },
    sec() {
      this.conv(this.deg, this.min, this.sec);
    },
  },
});
</script>
<template>
  <div style="margin-bottom: 16px; font-weight: bold">{{ modelValue?.description }}</div>
  <div class="row justify-between">
    <q-input
      dense
      style="width: 31%"
      ref="inputRef"
      outlined
      stack-label
      label="Градусы"
      v-model="deg"
      min="0"
      type="number"
      :rules="rules.singleDouble"
    />
    <h6>&deg;</h6>
    <q-input
      dense
      style="width: 31%"
      ref="inputRef"
      outlined
      stack-label
      label="Минуты"
      max="60"
      v-model="min"
      min="0"
      type="number"
      :rules="rules.singleDouble"
    />
    <h6>'</h6>
    <q-input
      dense
      style="width: 31%"
      ref="inputRef"
      outlined
      stack-label
      label="Секунды"
      max="60"
      v-model="sec"
      min="0"
      type="number"
      :rules="rules.singleDouble"
    />
    <h6>"</h6>
  </div>
</template>

<style>
h6 {
  margin-top: 0;
}
</style>
