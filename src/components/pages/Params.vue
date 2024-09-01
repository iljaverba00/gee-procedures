<script lang="ts">
import ChooseSingle from './procparams/ChooseSingle.vue';
import ChooseList from './procparams/ChooseList.vue';
import ChoosePairList from './procparams/ChoosePairList.vue';
import ChoosePair from './procparams/ChoosePair.vue';
import Single from './procparams/Single.vue';
import Message from './procparams/Message.vue';
import PathFile from './procparams/PathFile.vue';
import MatchingFields from './procparams/MatchingFields.vue';
import ChooseGroupedList from './procparams/ChooseGroupedList.vue';
import Angle from './procparams/Angle.vue';
import ChooseSqlSelectPair from './procparams/ChooseSqlSelectPair.vue';



import { computed, ref } from 'vue';

export default {
  name: 'Params',
  components: {
    ChooseSqlSelectPair,
    ChooseGroupedList,
    ChoosePairList,
    MatchingFields,
    PathFile,
    Single,
    /*ToolbarButton,*/ ChoosePair,
    ChooseList,
    ChooseSingle,
    Message,
    Angle,
  },
  setup(props) {
    const procedureLocalParams = computed(()=> props.procedureParams ?? [] )
    return {
      procedureLocalParams,
      isGroup: ref(false),
      switchableGroup: ref(false),
    };
  },
  props: {
    procedureParams: Object,
    procedureGroup: Object,
  },
  watch: {
    procedureGroup: {
      handler(value) {
        if (
          this.procedureGroup &&
          (this.procedureGroup.selectValue === undefined ||
            this.procedureGroup.selectValue === null)
        )
          // eslint-disable-next-line vue/no-mutating-props
          this.procedureGroup.selectValue = false;
        if (value) this.isGroup = true;
        if (this.procedureGroup?.checked) this.switchableGroup = true;
      },
      immediate: true,
    },
  }
};
</script>

<template>
  <!-- eslint-disable vue/no-mutating-props -->

  <q-checkbox
    v-if="procedureGroup?.checked"
    v-model="procedureGroup.selectValue"
    v-bind:class="{ nogroup: !isGroup, group: isGroup, switchableGroup: switchableGroup }"
  >
    {{ procedureGroup.description }}
  </q-checkbox>

  <q-card-section
    v-if="!procedureGroup || procedureGroup.selectValue === true"
    v-bind:class="{ nogroup: !isGroup, group: isGroup, switchableGroup: switchableGroup }"
  >
    <div v-if="!procedureGroup?.checked" style="margin-bottom: 16px; font-weight: bold">
      {{ procedureGroup?.description }}
    </div>
    <div v-for="(param, index) of procedureLocalParams" :key="param.type">
      <choose-single
        v-if="param.type === 'CHOOSE_SINGLE'"
        v-model:model-value="procedureLocalParams[index]"
      />
      <choose-pair
        v-if="param.type === 'CHOOSE_PAIR'"
        v-model:model-value="procedureLocalParams[index]"
      />
      <choose-pair-list
        v-if="param.type === 'CHOOSE_PAIR_LIST'"
        v-model:model-value="procedureLocalParams[index]"
      />

      <choose-list
        v-if="param.type === 'CHOOSE_LIST'"
        :model-value="procedureLocalParams[index]"
        @updateSelected="procedureLocalParams[index] && (procedureLocalParams[index].selectValue = $event)"
      />

      <single v-if="param.type === 'SINGLE'" v-model:model-value="procedureLocalParams[index]" />
      <angle
        v-if="param.type === ('ANGLE' || 'ROTATE')"
        v-model:model-value="procedureLocalParams[index]"
      />
      <!--      <toolbar-button v-if="param.type === 'TOOLBAR_BUTTON'" v-model:model-value="procedureParams[index]"/>-->
      <message v-if="param.type === 'MESSAGE'" v-model:model-value="procedureLocalParams[index]" />
      <path-file v-if="param.type === 'PATH'" v-model:model-value="procedureLocalParams[index]" />
      <matching-fields
        v-if="param.type === 'MATCHING_FIELDS'"
        v-model:model-value="procedureLocalParams[index]"
      />
      <choose-grouped-list
        v-if="param.type === 'CHOOSE_GROUPED_LIST'"
        v-model:model-value="procedureLocalParams[index]"
        @updateSelected="procedureLocalParams[index] && (procedureLocalParams[index].selectValue = $event)"
      />
      <choose-sql-select-pair
        v-if="param.type === 'CHOOSE_SQL_SELECT_PAIR'"
        v-model:model-value="procedureLocalParams[index]"
      />
      <params
        v-if="param.type === 'GROUP'"
        v-model:procedure-params="procedureLocalParams[index].params"
        v-model:procedure-group="procedureLocalParams[index]"
      />
    </div>
  </q-card-section>
</template>

<style>
.nogroup {
  background: white;
}

.group {
  background: #eaf6ff;
  width: 100%;
}

.switchableGroup {
  background: #eaf6ff;
  width: 100%;
  border-left: 2px solid #636363;
}
</style>
