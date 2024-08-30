<template>
  <q-select
    ref="refChooseList"
    :placeholder="model ? '' : 'Начните вводить текст для поиска...'"
    outlined
    multiple
    use-chips
    use-input
    @filter="filterFn"
    stack-label
    input-debounce="0"
    :label="modelValue.description"
    v-model="model"
    :options="filterOptions"
    @update:model-value="update"
    :rules="getRules()"
    :style="marginBottom"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey q-ma-xs"> Ничего нет :( </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from 'components/procedure/procedureUtills';

export default defineComponent({
  name: 'ChooseList',
  emits: ['update:modelValue', 'updateSelected'],
  props: ['modelValue'],
  data() {
    const rules = rulesProcedureParams();
    return {
      rules,
      check() {
        this.$refs.refChooseList?.validate();
      },
    };
  },
  setup(props, { emit }) {
    const model = ref([]);

    if (props.modelValue) {
      for (let i = 0; i < props.modelValue?.defaultValue?.length; i++) {
        model.value.push(props.modelValue.chooseSet[props.modelValue.defaultValue[i]]);
      }
    }
    //const emitVal = arr.map(val => this.modelValue.chooseSet.indexOf(val))
    emit('updateSelected', props.modelValue?.defaultValue);

    const filterOptions = ref(props.modelValue.chooseSet.concat([]));

    return {
      marginBottom: ref(''),
      model,
      unsubscribe: ref(),
      filterOptions,
      filterFn(val, update) {
        if (val === '') {
          update(() => {
            filterOptions.value = props.modelValue.chooseSet.concat([]);
          });
          return;
        }
        update(() => {
          let needle = val.toLowerCase();
          filterOptions.value = props.modelValue.chooseSet
            .concat([])
            .filter((item) => item.toLowerCase().indexOf(needle) > -1);
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
  methods: {
    update(arr) {
      const emitVal = arr.map((val) => this.modelValue.chooseSet.indexOf(val));
      this.$emit('updateSelected', emitVal);
    },
    getRules() {
      if (this.modelValue.nullable) this.marginBottom = 'margin-bottom: 20px';
      return this.modelValue.nullable ? null : this.rules.chooseList;
    },
  },
});
</script>
