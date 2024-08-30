<template>
  <q-select
    ref="refChoosePair"
    :placeholder="model ? '' : 'Начните вводить текст для поиска...'"
    outlined
    use-input
    @filter="filterFn"
    v-model="model"
    :options="options"
    :label="modelValue.description"
    @update:model-value="update"
    :rules="getRules()"
    :style="marginBottom"
    map-options
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section v-if="!options">
          <q-spinner color="primary" size="3em" />
        </q-item-section>
        <q-item-section v-else class="text-grey q-ma-xs"> Ничего нет :( </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from 'components/procedure/procedureUtills';
import { procedureRequests } from 'src/services/Data.service';

export default defineComponent({
  name: 'ChooseSqlSelectPair',
  props: ['modelValue'],
  setup(props) {
    const rules = rulesProcedureParams();
    const options = ref([]);

    const runSql = async (text) => {
      const sqlQuery = props.modelValue?.sqlSelect?.originalText;
      const innerParams = props.modelValue?.innerParams;
      if (sqlQuery) {
        const rez = await procedureRequests.sqlProcedure(sqlQuery, text, innerParams[0]);
        const mapRez = [];
        if (rez?.rows?.length) {
          for (const rezElement of rez.rows) {
            mapRez.push({
              label: rezElement?.[1],
              value: rezElement?.[0],
            });
          }
        }
        console.log(mapRez);
        return mapRez;
      }
      return [];
    };

    return {
      marginBottom: ref(''),
      rules,
      unsubscribe: ref(),
      model: ref(null),
      options,
      check() {
        this.$refs.refChoosePair?.validate();
      },
      filterFn(val, update) {
        update(async () => {
          options.value = undefined;
          const rez = (options.value = !val ? [] : await runSql(val.trim().toLowerCase()));
        });
      },
    };
  },
  created() {
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'modules/updateProcedureCheck') {
        this.check();
      }
    });
  },
  beforeUnmount() {
    this.unsubscribe();
  },
  watch: {
    modelValue: {
      handler(value) {
        this.initial(value);
      },
      immediate: true,
    },
  },
  methods: {
    update(value) {
      console.log(value);
      this.modelValue.selectValue = value?.value;
      this.$emit('update:modelValue', this.modelValue);
    },

    initial(value) {
      // for (let i = 0; i < this.modelValue.keys.length; i++) {
      //   if (JSON.stringify(this.modelValue.keys[i]) === JSON.stringify(this.modelValue.defaultValue)) {
      //     // eslint-disable-next-line vue/no-mutating-props
      //     this.modelValue.selectValue = i;
      //     this.model = this.modelValue.values[i];
      //     break;
      //   }
      // }
    },
    getRules() {
      if (this.modelValue.nullable) this.marginBottom = 'margin-bottom: 20px';
      return this.modelValue.nullable ? null : this.rules.choosePair;
    },
  },
});
</script>
