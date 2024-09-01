<script setup lang="ts">
import {
  QTab,
  QTabs,
  QSeparator,
  QTabPanels,
  QList,
  QItem,
  QTree,
  QCheckbox,
  QItemLabel,
  QTooltip,
  QItemSection,
  QBtn,
} from 'quasar';

import { ref } from 'vue';

const props = defineProps([
  'configProcedure',
  'procedureId',
  'procedureFavorites',
  'reportsFavorites',
  'reports',
  'procedures',
  'procedureFavoritesIds',
  'reportsFavoritesIds',
  'proceduresFact',
  'onlyImport',
]);

const emits = defineEmits([
  'updateSelected',
  'removeFavoriteRep',
  'removeFavoriteProc',
  'update:propTab',
  'update:procedureFavoritesIds',
  'update:reportsFavoritesIds',
]);

const propTab = ref('favorites');

const checkProcedure = () => {
  return props.onlyImport
    ? props.procedures.filter((v: { name: string }) => v.name == 'Импорт из ...')
    : props.procedures;
};

console.log(!props.configProcedure?.onlyFavorites && !props.onlyImport);

</script>

<template>
  <q-tabs
    v-if="!props.configProcedure?.onlyFavorites && !props.onlyImport"
    v-model="propTab"
    dense
    class="text-grey"
    active-color="primary"
    indicator-color="primary"
    align="justify"
    narrow-indicator
  >
    <q-tab name="favorites" label="Избранное" icon="star" />
    <q-tab
      id="procedureMenuBtn"
      name="procedures"
      label="Процедуры"
      icon="display_settings"
    />
    <q-tab name="reports" label="Отчеты" icon="receipt" v-if="reports?.length" />
  </q-tabs>

  <q-separator />

  <q-tab-panels
    id="tabPanels"
    v-model="propTab"
    animated
    swipeable
    vertical
    transition-prev="jump-up"
    transition-next="jump-up"
    :class="onlyImport ? '' : 'tab-panels'"
  >
    <q-tab-panel name="favorites">
      <q-list v-if="procedureFavorites?.length">
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
              dense
              @click="
                $event.stopPropagation();
                $emit('removeFavoriteProc', fav.id);
              "
            >
              <q-tooltip>Удалить из избранных</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator v-if="reportsFavorites?.length && procedureFavorites.length" />
      <q-list v-if="reportsFavorites?.length">
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
              dense
              @click="
                $event.stopPropagation();
                $emit('removeFavoriteRep', fav.id);
              "
            >
              <q-tooltip>Удалить из избранных</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="!procedureFavorites?.length && !reportsFavorites?.length"
           style="height: 100%; user-select: none">
        <div class="text-subtitle1 absolute-center" :style="`font-size:1rem`">
          <div style="user-select: none; text-align: center">В избранном пока нет процедур или отчетов!</div>
          <div style="display: flex; justify-content: center; align-items: center">
            <q-btn rounded @click="propTab = 'procedures'" color="primary" text-color="white">
              Добавить
            </q-btn>
          </div>
        </div>
      </div>
    </q-tab-panel>

    <q-tab-panel name="procedures">
      <q-tree
        id="procedersTabMenu"
        class="col-12 col-sm-6"
        :nodes="checkProcedure()"
        node-key="id"
        :tick-strategy="configProcedure?.editFavorites ? 'leaf' : 'none'"
        :selected="procedureId"
        :ticked="procedureFavoritesIds"
        @update:ticked="$emit('update:procedureFavoritesIds', $event)"
        label-key="name"
        selected-color="primary"
        @update:selected="$emit('updateSelected', 'Процедуры', $event)"
      >
        <template v-slot:default-header="prop">
          <div
            :class="`row no-wrap full-width ${
              prop.node.id == procedureId ? 'bg-primary' : 'bg-white'
            }`"
          >
            <div :class="`full-width ${prop.node.id == procedureId ? 'text-white' : 'text-black'}`">
              {{ prop.node.name }}
            </div>
            <q-checkbox
              v-if="configProcedure?.editFavorites"
              v-show="!prop.node.noTick"
              unchecked-icon="star"
              checked-icon="star"
              style="align-items: flex-end"
              keep-color
              :class="`${prop.node.id == procedureId ? 'bg-primary' : 'bg-white'}`"
              :color="prop.ticked ? 'warning' : prop.node.id == procedureId ? 'white' : 'grey'"
              v-model="prop.ticked"
              dense
            >
            </q-checkbox>
          </div>
        </template>
      </q-tree>
      <q-separator v-if="proceduresFact?.length" />
      <q-tree
        v-if="proceduresFact?.length && !onlyImport"
        class="col-12 col-sm-6"
        :nodes="proceduresFact"
        node-key="id"
        :tick-strategy="configProcedure?.editFavorites ? 'leaf' : 'none'"
        :selected="procedureId"
        :ticked="procedureFavoritesIds"
        @update:ticked="$emit('update:procedureFavoritesIds', $event)"
        label-key="name"
        selected-color="primary"
        @update:selected="$emit('updateSelected', 'Процедуры', $event)"
      >
        <template v-slot:default-header="prop">
          <div
            :class="`row no-wrap full-width ${
              prop.node.id == procedureId ? 'bg-primary' : 'bg-white'
            }`"
          >
            <div :class="`full-width ${prop.node.id == procedureId ? 'text-white' : 'text-black'}`">
              {{ prop.node.name }}
            </div>
            <q-checkbox
              v-if="configProcedure?.editFavorites"
              v-show="!prop.node.noTick"
              unchecked-icon="star"
              checked-icon="star"
              style="align-items: flex-end"
              keep-color
              :class="`${prop.node.id == procedureId ? 'bg-primary' : 'bg-white'}`"
              :color="prop.ticked ? 'warning' : prop.node.id == procedureId ? 'white' : 'grey'"
              v-model="prop.ticked"
              dense
            >
            </q-checkbox>
          </div>
        </template>
      </q-tree>
    </q-tab-panel>

    <q-tab-panel name="reports">
      <q-tree
        class="col-12 col-sm-6"
        :nodes="reports"
        node-key="id"
        :tick-strategy="configProcedure?.editFavorites ? 'leaf' : 'none'"
        :selected="procedureId"
        :ticked="reportsFavoritesIds"
        @update:ticked="$emit('update:reportsFavoritesIds', $event)"
        label-key="name"
        selected-color="primary"
        @update:selected="$emit('updateSelected', 'Отчеты', $event)"
      >
        <template v-slot:default-header="prop">
          <div
            :class="`row no-wrap full-width ${
              prop.node.id == procedureId ? 'bg-primary' : 'bg-white'
            }`"
          >
            <div :class="`full-width ${prop.node.id == procedureId ? 'text-white' : 'text-black'}`">
              {{ prop.node.name }}
            </div>
            <q-checkbox
              v-if="configProcedure?.editFavorites"
              v-show="!prop.node.noTick"
              unchecked-icon="star"
              checked-icon="star"
              style="align-items: flex-end"
              keep-color
              :class="`${prop.node.id == procedureId ? 'bg-primary' : 'bg-white'}`"
              :color="prop.ticked ? 'warning' : prop.node.id == procedureId ? 'white' : 'grey'"
              v-model="prop.ticked"
              dense
            >
            </q-checkbox>
          </div>
        </template>
      </q-tree>
    </q-tab-panel>
  </q-tab-panels>
</template>

<style>
:deep(.q-tree__tickbox) {
  margin-right: 4px;
  display: none !important;
}

.q-tree__tickbox {
  margin-right: 4px;
  display: none !important;
}

.tab-panels {
  height: calc(100% - 55px)
}
</style>
