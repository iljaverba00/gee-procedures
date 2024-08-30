<template>
  <q-tabs
    v-if="!configProcedure.onlyFavorites & !onlyImport"
    v-model="tabModel"
    dense
    class="text-grey"
    active-color="primary"
    indicator-color="primary"
    align="justify"
    narrow-indicator
  >
    <q-tab name="favorites" :label="t('AllTabs.favorites')" icon="star" />
    <q-tab
      id="procedureMenuBtn"
      name="procedures"
      :label="t('AllTabs.procedures')"
      icon="display_settings"
    />
    <q-tab name="reports" :label="t('AllTabs.reports')" icon="receipt" v-if="reports?.length" />
  </q-tabs>

  <q-separator />

  <q-tab-panels
    id="tabPanels"
    v-model="tabModel"
    animated
    swipeable
    vertical
    transition-prev="jump-up"
    transition-next="jump-up"
    :class="onlyImport ? '' : 'tab-panels'"
  >
    <q-tab-panel name="favorites">
      <dq-list v-if="procedureFavorites?.length">
        <q-item-label header>{{ t('AllTabs.tabHeader') }}</q-item-label>
        <q-item
          v-for="fav of procedureFavorites"
          :key="fav.id"
          clickable
          dense
          active-class="my-menu-link"
          :active="procedureId === fav.id"
          @click="$emit('updateSelected', t('AllTabs.tabClick'), fav.id)"
        >
          <q-item-section>{{ fav.name }}</q-item-section>
          <q-item-section side>
            <dq-btn
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
              <q-tooltip>{{ t('AllTabs.delete') }}</q-tooltip>
            </dq-btn>
          </q-item-section>
        </q-item>
      </dq-list>
      <q-separator v-if="reportsFavorites?.length && procedureFavorites.length" />
      <dq-list v-if="reportsFavorites?.length">
        <q-item-label header>{{ t('AllTabs.itemHeader') }}</q-item-label>
        <q-item
          v-for="fav of reportsFavorites"
          :key="fav.id"
          clickable
          dense
          active-class="my-menu-link"
          :active="procedureId === fav.id"
          @click="$emit('updateSelected', t('AllTabs.itemClick'), fav.id)"
        >
          <q-item-section>{{ fav.name }}</q-item-section>
          <q-item-section side>
            <dq-btn
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
              <q-tooltip>{{ t('AllTabs.delete') }}</q-tooltip>
            </dq-btn>
          </q-item-section>
        </q-item>
      </dq-list>
      <warning-in-center
        v-if="!(procedureFavorites?.length || reportsFavorites?.length)"
        :main-text="t('AllTabs.warning')"
        :button-text="t('AllTabs.warningButton')"
        @buttonClick="tabModel = 'procedures'"
      />
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
        @update:selected="$emit('updateSelected', t('AllTabs.treeProcedure'), $event)"
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
        @update:selected="$emit('updateSelected', t('AllTabs.treeProcedure'), $event)"
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
        @update:selected="$emit('updateSelected', t('AllTabs.treeReport'), $event)"
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

<script>
import { useI18n } from 'vue-i18n';

export default {
  name: 'Tabs',
  props: [
    'configProcedure',
    'procedureId',
    'procedureFavorites',
    'reportsFavorites',
    'reports',
    'procedures',
    'procedureFavoritesIds',
    'reportsFavoritesIds',
    'proceduresFact',
    'propTab',
    'onlyImport',
  ],
  emits: [
    'updateSelected',
    'removeFavoriteRep',
    'removeFavoriteProc',
    'update:procedureFavoritesIds',
    'update:reportsFavoritesIds',
  ],
  data() {
    const { t } = useI18n({ useScope: 'global' });
    return {
      t,
      tabModel: this.propTab,
    };
  },
  methods: {
    checkProcedure() {
      return this.onlyImport
        ? this.procedures.filter((v) => v.name == 'Импорт из ...')
        : this.procedures;
    },
  },
};
</script>

<style scoped lang="sass">
:deep(.q-tree__tickbox)
  margin-right: 4px
  display: none !important
.tab-panels
  height: calc(100% - 55px)
</style>
