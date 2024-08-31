<script setup lang="ts">

const props = defineProps(['configProcedure', 'procedureId', 'procedureFavorites', 'reportsFavorites']);
const emits = defineEmits(['updateSelected', 'removeFavoriteRep', 'removeFavoriteProc']);

</script>

<template>
  <q-list v-if="props.procedureFavorites?.length">
    <q-item-label header>Процедуры</q-item-label>
    <q-item
      v-for="fav of props.procedureFavorites"
      :key="fav.id"
      clickable
      dense
      active-class="my-menu-link"
      :active="props.procedureId === fav.id"
      @click="emits('updateSelected', 'Процедуры', fav.id)"
    >
      <q-item-section>{{ fav.name }}</q-item-section>
      <q-item-section side>
        <q-btn
          v-if="props.configProcedure?.editFavorites"
          icon="delete"
          :text-color="props.procedureId === fav.id ? 'white' : ''"
          flat
          round
          dense
          @click="
            $event.stopPropagation();
            emits('removeFavoriteProc', fav.id);
          "
        />
      </q-item-section>
    </q-item>
  </q-list>
  <q-separator v-if="props.reportsFavorites?.length && props.procedureFavorites.length" />
  <q-list v-if="props.reportsFavorites?.length">
    <q-item-label header>Отчеты</q-item-label>
    <q-item
      v-for="fav of props.reportsFavorites"
      :key="fav.id"
      clickable
      dense
      active-class="my-menu-link"
      :active="props.procedureId === fav.id"
      @click="$emit('updateSelected', 'Отчеты', fav.id)"
    >
      <q-item-section>{{ fav.name }}</q-item-section>
      <q-item-section side>
        <q-btn
          v-if="props.configProcedure?.editFavorites"
          icon="delete"
          :text-color="props.procedureId === fav.id ? 'white' : ''"
          flat
          round
          dense
          @click="
            $event.stopPropagation();
            emits('removeFavoriteRep', fav.id);
          "
        />
      </q-item-section>
    </q-item>
  </q-list>
  <div
    v-if="!(props.procedureFavorites?.length || props.reportsFavorites?.length)"
    style="height: 100%; user-select: none">
    <div class="text-subtitle1 absolute-center" :style="`font-size:1rem`">
      <div style="user-select: none; text-align: center">В избранном пока нет процедур или отчетов</div>
    </div>
  </div>

</template>

