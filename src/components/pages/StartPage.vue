<script lang="ts">
import { computed, ComputedRef, ref } from 'vue';
import FavoritesTab from './components/FavoritesTab.vue';
import AllTabs from './components/AllTabs.vue';
import { ProcedureEl } from '../../service/types.ts';

export default {
  name: 'StartPage',
  components: { FavoritesTab, AllTabs },
  props: ['procedureId', 'procedureGroup', 'procedureName', 'onlyImport', 'allProcedures','configProcedure'],
  emits: ['update:procedureId', 'update:procedureGroup', 'update:procedureName'],
  setup(props) {
    const expand = (a: ProcedureEl[] = []) => {
      let r: ProcedureEl[] = [];
      if (!a?.length) return r;

      for (const aElement of a) {
        if (aElement.children?.length) {
          r = r.concat(aElement.children);
        } else {
          r.push(aElement);
        }
      }
      return r;
    };

    const procedures: ComputedRef<ProcedureEl[]> = computed((_) => {
      const proc = props.allProcedures?.procedureList;
      for (const procElement of proc) {
        if (procElement.children?.length) {
          procElement.noTick = true;
          procElement.selectable = false;
        }
      }
      return proc;
    });

    const proceduresFact: ComputedRef<ProcedureEl[]> = computed((_) => props.allProcedures?.procedureFact);

    const reports: ComputedRef<ProcedureEl[]> = computed((_) => props.allProcedures?.reportsList);

    //todo set для избранных процедур
    const procedureFavoritesIds: ComputedRef<ProcedureEl[]> = computed(()=> props.allProcedures?.favorites?.procedures);
    const reportsFavoritesIds: ComputedRef<ProcedureEl[]> = computed(()=> props.allProcedures?.favorites?.reports);


    const procedureFavorites = computed((_) => {
      const procFlat = expand(procedures.value).flat();
      const allFlat = procFlat.concat(proceduresFact.value);
      return (
        procedureFavoritesIds.value
          ?.map((i) => allFlat.find((f) => f.id == i.id))
          .filter((f) => !!f) ?? []
      );
    });
    const reportsFavorites = computed((_) => {
      return (
        reportsFavoritesIds.value
          ?.map((i) => reports.value.find((f) => f.id == i.id))
          .filter((f) => !!f) ?? []
      );
    });
    console.log('start')
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
    removeFavoriteRep() {
      console.log('removeFavoriteRep')
      //this.reportsFavoritesIds = this.reportsFavoritesIds.filter((fi) => fi != id);
    },
    removeFavoriteProc() {
      console.log('removeFavoriteProc')
      //this.procedureFavoritesIds = this.procedureFavoritesIds.filter((fi) => fi != id);
    },
  },
};
</script>
<template>
  <AllTabs
    v-if="!configProcedure?.onlyFavorites"
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
  <FavoritesTab
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
