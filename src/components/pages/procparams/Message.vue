<script setup lang="ts">
import { ProcedureParam } from 'src/service/types';

const props = defineProps<{ modelValue: ProcedureParam }>();
</script>

<template>
  <div style="margin-bottom: 20px" v-html="props.modelValue.description" />
</template>



