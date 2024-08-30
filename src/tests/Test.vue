<script setup lang="ts">
import requests from "../modules/xsd-forms-admin/XsdFormAdminService.ts";
import XsdFormAdmin from "../modules/xsd-forms-admin/XsdFormAdmin.vue";

const openFileDialog = (val: object)=>{
  console.log(val)
}

</script>
<template>
  <XsdFormAdmin :requests="requests()" @openFileDialog="openFileDialog"/>
</template>

<style>
body {
  height: 100vh;
  width: 100vw;
  margin: 0;
  background-color: #ececec;
}

.app {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 30px;
  position: relative;
}

:root {
  --q-primary: #2450df;
  --q-secondary: #04db89;
  --q-negative: #ce1616;
}
</style>
