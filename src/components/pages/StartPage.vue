<template>
  <Tabs
    v-if="!configProcedure.onlyFavorites"
    :reports="reports"
    :procedures="procedures"
    :proceduresFact="proceduresFact"
    v-model:procedureFavoritesIds="procedureFavoritesIds"
    v-model:reportsFavoritesIds="reportsFavoritesIds"
    :configProcedure="configProcedure"
    :procedureId="procedureId"
    :procedureFavorites="procedureFavorites"
    :reportsFavorites="reportsFavorites"
    :onlyImport="onlyImport"
    @updateSelected="updateSelected"
    @removeFavoriteRep="removeFavoriteRep"
    @removeFavoriteProc="removeFavoriteProc"
  />
  <Favorites
    v-else
    :configProcedure="configProcedure"
    :procedureId="procedureId"
    :procedureFavorites="procedureFavorites"
    :reportsFavorites="reportsFavorites"
    @updateSelected="updateSelected"
    @removeFavoriteRep="removeFavoriteRep"
    @removeFavoriteProc="removeFavoriteProc"
  />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import Tabs from 'src/components/procedure/pages/components/AllTabs.vue';
import Favorites from 'src/components/procedure/pages/components/FavoritesTab.vue';

export default {
  name: 'StartPage',
  components: { Tabs, Favorites },
  props: ['procedureId', 'procedureGroup', 'procedureName', 'onlyImport'],
  emits: ['update:procedureId', 'update:procedureGroup', 'update:procedureName'],
  setup() {
    const $store = useStore();

    const expand = (a = []) => {
      let r = [];

      if (!a?.length) return r;

      for (const aElement of a) {
        r.push(aElement.children?.length ? aElement.children : aElement);
      }
      return r;
    };

    const procedures = computed((_) => {
      const proc =
        $store.getters['modules/getAllProcedures'][$store.getters['modules/getCurrentFactId']]
          ?.procedureList ?? [];
      for (const procElement of proc) {
        if (procElement.children?.length) {
          procElement.noTick = true;
          procElement.selectable = false;
        }
      }
      return proc;
    });

    const proceduresFact = computed(
      (_) =>
        $store.getters['modules/getAllProcedures'][$store.getters['modules/getCurrentFactId']]
          ?.procedureFact ?? [],
    );

    const reports = computed(
      (_) =>
        $store.getters['modules/getAllProcedures'][$store.getters['modules/getCurrentFactId']]
          ?.reportsList ?? [],
    );

    const procedureFavoritesIds = computed({
      get: (_) => $store.getters['modules/getProcedureFavorites'],
      set: (v) => $store.commit('modules/updateProcedureFavorites', v),
    });
    const reportsFavoritesIds = computed({
      get: (_) => $store.getters['modules/getReportsFavorites'],
      set: (v) => $store.commit('modules/updateReportsFavorites', v),
    });

    const procedureFavorites = computed((_) => {
      const procFlat = expand(procedures.value).flat();
      const allFlat = procFlat.concat(proceduresFact.value);
      return (
        procedureFavoritesIds.value
          ?.map((i) => allFlat.find((f) => f.id == i))
          .filter((f) => !!f) ?? []
      );
    });
    const reportsFavorites = computed((_) => {
      return (
        reportsFavoritesIds.value
          ?.map((i) => reports.value.find((f) => f.id == i))
          .filter((f) => !!f) ?? []
      );
    });
    const configProcedure = computed(() => $store.getters['config/getProcedureSet']);

    return {
      ticked: ref([]),
      procedures,
      proceduresFact,
      reports,
      procedureFavorites,
      reportsFavorites,
      procedureFavoritesIds,
      reportsFavoritesIds,
      expand,
      configProcedure,
    };
  },
  methods: {
    updateSelected(group = '', id = '') {
      const procFlat = this.expand(this.procedures).flat();
      const proc = procFlat
        .concat(this.reports)
        .concat(this.proceduresFact)
        .find((p) => p.id == id);

      this.$emit('update:procedureId', id);
      this.$emit('update:procedureName', proc?.name ? proc.name : '');
      this.$emit('update:procedureGroup', group);
    },
    removeFavoriteRep(id) {
      this.reportsFavoritesIds = this.reportsFavoritesIds.filter((fi) => fi != id);
    },
    removeFavoriteProc(id) {
      this.procedureFavoritesIds = this.procedureFavoritesIds.filter((fi) => fi != id);
    },
  },
};
</script>
