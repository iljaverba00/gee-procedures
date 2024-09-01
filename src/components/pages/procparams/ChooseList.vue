<script lang="ts">
import { defineComponent, ref } from 'vue';
import { rulesProcedureParams } from 'src/service/procedureUtills';
import { setupComponentValidator } from 'src/service/providerInjection';



export default defineComponent({
  name: 'ChooseList',
  emits: ['update:modelValue', 'updateSelected'],
  props: ['modelValue'],
  data() {
    const rules = rulesProcedureParams();
    return {
      rules,
    };
  },
  setup(props, { emit }) {
    const model = ref<any[]>([]);

    if (props.modelValue) {
      for (let i = 0; i < props.modelValue?.defaultValue?.length; i++) {
        model.value.push(props.modelValue.chooseSet[props.modelValue.defaultValue[i]]);
      }
    }
    //const emitVal = arr.map(val => this.modelValue.chooseSet.indexOf(val))
    emit('updateSelected', props.modelValue?.defaultValue);

    const filterOptions = ref(props.modelValue.chooseSet.concat([]));

    const refChooseList = ref();
    return {
      refChooseList,
      marginBottom: ref(''),
      model,
      filterOptions,
      filterFn(val: string, update: (f: () => void) => void) {
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
            .filter((item: string) => item.toLowerCase().indexOf(needle) > -1);
        });
      },
    };
  },
  created() {
    setupComponentValidator(() => {
      this.refChooseList?.validate();
    });
  },
  methods: {
    update(arr: string[]) {
      const emitVal = arr.map((val: string) => this.modelValue.chooseSet.indexOf(val));
      this.$emit('updateSelected', emitVal);
    },
    getRules() {
      if (this.modelValue.nullable) this.marginBottom = 'margin-bottom: 20px';
      return this.modelValue.nullable ? undefined : this.rules.chooseList;
    },
  },
});
</script>

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
        <q-item-section class="text-grey q-ma-xs"> Ничего нет :(</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
