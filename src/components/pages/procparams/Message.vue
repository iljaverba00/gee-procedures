<script setup lang="ts">
import { ProcedureParam } from '../../../service/types.ts';

const props = defineProps<{ modelValue: ProcedureParam }>();
</script>

<template>
  <div style="margin-bottom: 20px" v-html="props.modelValue.description" />
</template>



