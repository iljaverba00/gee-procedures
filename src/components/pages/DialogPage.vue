<script setup lang="ts">
import {
  QCard,
  QBtn,
  QBtnGroup,
  QCardSection,
  QCardActions,
} from 'quasar';

const props = defineProps(['dialogData']);
const emits = defineEmits(['press']);

const buttonTranscriptions: any = { YES: 'Да', NO: 'НЕТ', YES_TO_ALL: 'Да, для всех' };

</script>
<template>
  <q-card>
    <q-card-section class="text-subtitle1">
      <div v-html="props.dialogData?.title"></div>
    </q-card-section>
    <q-card-section class="text-subtitle2">
      <div v-html="props.dialogData?.description"></div>
    </q-card-section>
    <q-card-actions>
      <q-btn-group v-for="btn in props.dialogData?.buttons" :key="btn">
        <q-btn
          :label="buttonTranscriptions[btn]"
          class="text-primary"
          @click="emits('press', btn)"
        />
      </q-btn-group>
      <q-btn-group></q-btn-group>
    </q-card-actions>
  </q-card>
</template>
