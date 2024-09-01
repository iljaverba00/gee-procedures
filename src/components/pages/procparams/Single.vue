<script lang="ts">
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams, toIsoString } from '../../../service/procedureUtills.ts';
import { setupComponentValidator } from '../../../service/providerInjection.ts';

import {
  QCheckbox,
  QIcon,
  QInput,
} from 'quasar';

export default defineComponent({
  name: 'Single',
  props: ['modelValue'],
  setup() {
    const rules = rulesProcedureParams();
    const inputRef = ref<QInput>()
    return {
      inputRef,
      isHiddenPwd: ref(true),
      localModel: ref(),
      marginBottom: ref(''),
      rules,
    };
  },
  mounted() {
    setupComponentValidator(() => {
      this.inputRef?.validate();
    });
  },
  methods: {
    getFormat(): 'number' | 'textarea' | 'time' | 'text' | 'password' | 'date' | 'datetime-local' | 'email' | 'search' | 'tel' | 'file' | 'url' | undefined {
      if (this.modelValue.asterisk) {
        return 'password';
      } else if (
        this.modelValue.typeValue === 'integer' ||
        this.modelValue.typeValue === 'double'
      ) {
        return 'number';
      } else if (this.modelValue.typeValue === 'date') {
        return 'date';
      } else if (this.modelValue.typeValue === 'datetime') {
        return 'datetime-local';
      }
    },
    getMin() {
      switch (this.modelValue?.typeValue) {
        case 'double':
        case 'integer':
          return '2147483647';
        default:
          return '';
      }
    },
    getMax() {
      switch (this.modelValue?.typeValue) {
        case 'date':
          return '3000-12-31';
        case 'double':
        case 'integer':
          return '2147483647';
        default:
          return '';
      }
    },
    getRules() {
      if (this.modelValue.nullable) {
        this.marginBottom = 'margin-bottom: 20px';
        return;
      }

      if (this.modelValue.mask) return this.rules.containMask;

      switch (this.modelValue.typeValue) {
        case 'integer':
          return this.rules.singleInt;
        case 'double':
          return this.rules.singleDouble;
        case 'string':
          return this.rules.singleString;
        case 'date':
          return this.rules.singleDate;
        default:
          return;
      }
    },
    updateModelValue(value: string | number | null) {
      if (['datetime'].includes(this.modelValue.typeValue) && value != null) {
        const datetime = new Date(value);
        this.modelValue.selectValue = toIsoString(datetime);
      }
    },
  },
});
</script>


<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <q-checkbox
    v-if="modelValue.typeValue === 'boolean'"
    v-model="modelValue.selectValue"
    :disable="modelValue?.actions?.[0]?.value"
  >{{ modelValue.description }}
  </q-checkbox>

  <q-input
    v-else-if="['datetime'].includes(modelValue.typeValue)"
    ref="inputRef"
    outlined
    stack-label
    :type="getFormat()"
    :label="modelValue.description"
    v-model="localModel"
    :rules="getRules()"
    :style="marginBottom"
    @update:modelValue="updateModelValue"
  />

  <q-input
    v-else-if="['integer', 'double', 'string', 'date'].includes(modelValue.typeValue)"
    ref="inputRef"
    outlined
    stack-label
    :autogrow="modelValue.multiline ? true : false"
    :max="getMax()"
    :min="getMin()"
    :type="getFormat()"
    :label="modelValue.description"
    v-model="modelValue.selectValue"
    :rules="getRules()"
    :style="marginBottom"
    :disable="modelValue?.actions?.[0]?.value"
  >
    <template #append v-if="modelValue.asterisk">
      <q-icon
        :name="isHiddenPwd ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        size="xs"
        @click="isHiddenPwd = !isHiddenPwd"
      />
    </template>
  </q-input>
  <!--  <q-input-->
  <!--    v-else-if = "modelValue.typeValue === "-->
  <!--    v-model="modelValue.selectValue"-->
  <!--    type="date"-->
  <!--    outlined-->

  <!--  />-->
</template>

