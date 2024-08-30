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
    <div v-for="(param, index) of procedureParams" :key="param.type">
      <choose-single
        v-if="param.type === 'CHOOSE_SINGLE'"
        v-model:model-value="procedureParams[index]"
      />
      <choose-pair
        v-if="param.type === 'CHOOSE_PAIR'"
        v-model:model-value="procedureParams[index]"
      />
      <choose-pair-list
        v-if="param.type === 'CHOOSE_PAIR_LIST'"
        v-model:model-value="procedureParams[index]"
      />

      <choose-list
        v-if="param.type === 'CHOOSE_LIST'"
        :model-value="procedureParams[index]"
        @updateSelected="procedureParams[index].selectValue = $event"
      />

      <single v-if="param.type === 'SINGLE'" v-model:model-value="procedureParams[index]" />
      <angle
        v-if="param.type === ('ANGLE' || 'ROTATE')"
        v-model:model-value="procedureParams[index]"
      />
      <!--      <toolbar-button v-if="param.type === 'TOOLBAR_BUTTON'" v-model:model-value="procedureParams[index]"/>-->
      <message v-if="param.type === 'MESSAGE'" v-model:model-value="procedureParams[index]" />
      <path-file v-if="param.type === 'PATH'" v-model:model-value="procedureParams[index]" />
      <matching-fields
        v-if="param.type === 'MATCHING_FIELDS'"
        v-model:model-value="procedureParams[index]"
      />
      <choose-grouped-list
        v-if="param.type === 'CHOOSE_GROUPED_LIST'"
        v-model:model-value="procedureParams[index]"
        @updateSelected="procedureParams[index].selectValue = $event"
      />
      <choose-sql-select-pair
        v-if="param.type === 'CHOOSE_SQL_SELECT_PAIR'"
        v-model:model-value="procedureParams[index]"
      />
      <params
        v-if="param.type === 'GROUP'"
        v-model:procedure-params="procedureParams[index].params"
        v-model:procedure-group="procedureParams[index]"
      />
    </div>
  </q-card-section>
</template>

<script>
import ChooseSingle from 'components/procedure/pages/procparams/ChooseSingle.vue';
import ChooseList from 'components/procedure/pages/procparams/ChooseList.vue';
import ChoosePairList from 'components/procedure/pages/procparams/ChoosePairList.vue';
import ChoosePair from 'components/procedure/pages/procparams/ChoosePair.vue';
import Single from 'components/procedure/pages/procparams/Single.vue';
import Message from 'components/procedure/pages/procparams/Message.vue';
import PathFile from 'components/procedure/pages/procparams/PathFile.vue';
import MatchingFields from 'components/procedure/pages/procparams/MatchingFields.vue';
import ChooseGroupedList from 'components/procedure/pages/procparams/ChooseGroupedList.vue';
import Angle from 'components/procedure/pages/procparams/Angle.vue';

import { ref } from 'vue';
import ChooseSqlSelectPair from 'components/procedure/pages/procparams/ChooseSqlSelectPair.vue';
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
  setup() {
    return {
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
      handler(value, oldValue) {
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
  },
};
</script>

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
