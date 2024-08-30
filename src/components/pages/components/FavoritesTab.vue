<template>
  <dq-list v-if="procedureFavorites?.length">
    <q-item-label header>Процедуры</q-item-label>
    <q-item
      v-for="fav of procedureFavorites"
      :key="fav.id"
      clickable
      dense
      active-class="my-menu-link"
      :active="procedureId === fav.id"
      @click="$emit('updateSelected', 'Процедуры', fav.id)"
    >
      <q-item-section>{{ fav.name }}</q-item-section>
      <q-item-section side>
        <q-btn
          v-if="configProcedure?.editFavorites"
          icon="delete"
          :text-color="procedureId === fav.id ? 'white' : ''"
          flat
          round
          dense
          @click="
            $event.stopPropagation();
            $emit('removeFavoriteProc', fav.id);
          "
        />
      </q-item-section>
    </q-item>
  </dq-list>
  <q-separator v-if="reportsFavorites?.length && procedureFavorites.length" />
  <dq-list v-if="reportsFavorites?.length">
    <q-item-label header>Отчеты</q-item-label>
    <q-item
      v-for="fav of reportsFavorites"
      :key="fav.id"
      clickable
      dense
      active-class="my-menu-link"
      :active="procedureId === fav.id"
      @click="$emit('updateSelected', 'Отчеты', fav.id)"
    >
      <q-item-section>{{ fav.name }}</q-item-section>
      <q-item-section side>
        <q-btn
          v-if="configProcedure?.editFavorites"
          icon="delete"
          :text-color="procedureId === fav.id ? 'white' : ''"
          flat
          round
          dense
          @click="
            $event.stopPropagation();
            $emit('removeFavoriteRep', fav.id);
          "
        />
      </q-item-section>
    </q-item>
  </dq-list>
  <warning-in-center
    v-if="!(procedureFavorites?.length || reportsFavorites?.length)"
    main-text="В избранном пока нет процедур или отчетов"
  />
</template>

<script>
import WarningInCenter from 'components/common/WarningInCenter.vue';

export default {
  name: 'Favorites',
  components: { WarningInCenter },
  props: ['configProcedure', 'procedureId', 'procedureFavorites', 'reportsFavorites'],
  emits: ['updateSelected', 'removeFavoriteRep', 'removeFavoriteProc'],
};
</script>

<style></style>
