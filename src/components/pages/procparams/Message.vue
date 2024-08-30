<template>
  <div style="margin-bottom: 20px" v-html="modelValue.description" />
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Message',
  props: ['modelValue'],
});
</script>

<style></style>
