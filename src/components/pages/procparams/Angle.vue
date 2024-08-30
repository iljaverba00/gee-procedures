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
      :rules="this.rules.singleDouble"
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
      :rules="this.rules.singleDouble"
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
      :rules="this.rules.singleDouble"
    />
    <h6>"</h6>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from 'components/procedure/procedureUtills';

export default defineComponent({
  name: 'Angle',
  props: ['modelValue'],
  setup() {
    const rules = rulesProcedureParams();

    return {
      deg: ref(0),
      min: ref(0),
      sec: ref(0),
      unsubscribe: ref(),
      rules,
      check() {
        this.$refs.inputRef?.validate();
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
    conv(d, m, s) {
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

<style>
h6 {
  margin-top: 0;
}
</style>
