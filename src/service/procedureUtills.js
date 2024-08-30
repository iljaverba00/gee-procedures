import { computed } from 'vue';

export class StageControl {
  constructor(id, name, count) {
    this.id = id;
    this.name = name;
    this.count = count;
  }

  setStep(id, step) {
    this.step = step;
  }

  getStage() {
    if (!this.id) return '';
    if (this.step && this.count) {
      return this.name + ': ' + this.step + ' из ' + this.count;
    } else if (this.step) {
      return this.name + ': ' + this.step;
    }
  }
}

export class ProcedureParameters {
  constructor(parameters) {
    this.addParameters(parameters);
  }

  addParameter(param) {
    this.addParameters([param]);
  }

  addParameters(parameters) {
    if (!this.parameters) this.parameters = [];
    if (parameters && parameters.length > 0)
      this.parameters = this.parameters.concat(this.#setupSelectValue(parameters));
  }

  // Initialize default value for procedure param
  nonChecked = ['MATCHING_FIELDS'];

  #setupSelectValue(pp) {
    for (let i = 0; i < pp.length; i++) {
      let par = pp[i];

      if (!this.nonChecked.includes(par.type)) par.selectValue = par.defaultValue;

      if (par.typeValue === 'boolean' && par.selectValue === undefined) par.selectValue = false;
      if (par.type === 'CHOOSE_LIST') {
        par.selectValue = [];
      }
      if (par.type === 'CHOOSE_PAIR') {
        if (par.bigList) {
          par.values = par.values.map((val, i) => (!!val ? val : '') + `(${par.keys[i]})`);
        }
      }
      if (par.type === 'PATH') {
        par.selectValue = null;
      }
      if (par.type === 'GROUP') this.#setupSelectValue(par.params);
    }
    return pp;
  }

  getExpandedParameters() {
    return this.getExpandedParametersRecursion(this.parameters);
  }

  // Вернет все параметры списком, если есть вложенные, проверяет
  getExpCheckParameters() {
    return this.getExpandedParametersRecursion(this.parameters);
  }

  getExpandedParametersRecursion(params) {
    let ppArr = [];
    for (let i = 0; i < params.length; i++) {
      ppArr.push(params[i]);
      if (params[i].type === 'GROUP') {
        let childArr = this.getExpandedParametersRecursion(params[i].params);
        ppArr = ppArr.concat(childArr);
      }
    }
    return ppArr;
  }

  getParameters() {
    return this.parameters ? this.parameters : null;
  }

  setParameters(parameters) {
    this.parameters = parameters;
  }

  // Проверка параметров на валидность
  isValidParameters() {
    if (!this.parameters) return false;

    const rules = rulesProcedureParams();

    //let parametersExp = this.getExpandedParameters();

    const checkThreeParameters = (parametersExp) => {
      for (let i = 0; i < parametersExp.length; i++) {
        let validator = [];
        let p = parametersExp[i];
        if (p.nullable) continue;

        switch (p.type) {
          case 'SINGLE':
            if (p.typeValue === 'integer') {
              validator = rules.singleInt;
            } else if (p.typeValue === 'double') {
              validator = rules.singleDouble;
            } else if (p.typeValue === 'string') {
              validator = rules.singleString;
              if (p.mask && p.selectValue) {
                if (p.selectValue.trim().length == 0) validator = rules.containMask;
                if (p.selectValue.indexOf(p.mask[2]) !== -1) validator = rules.containMask;
              }
            } else if (p.typeValue === 'date') {
              validator = rules.singleDate;
            } else if (p.typeValue === 'datetime') {
              validator = rules.singleDate;
            } else if (p.typeValue === 'boolean') {
              validator = rules.singleBoolean;
            }
            break;
          case 'GROUP':
            if (p.selectValue) checkThreeParameters(p.params);
            validator = rules.groupBoolean;
            break;
          case 'CHOOSE_SINGLE':
            validator = rules.chooseSingle;
            break;
          case 'CHOOSE_LIST':
            validator = rules.chooseList;
            break;
          case 'PATH':
            validator = rules.chooseFile;
            break;
          case 'CHOOSE_PAIR':
            validator = rules.choosePair;
            break;
          case 'CHOOSE_PAIR_LIST':
            validator = rules.choosePairList;
            break;
          case 'CHOOSE_GROUPED_LIST':
            validator = rules.chooseGroupedList;
            break;
          case 'ANGLE':
          case 'ROTATE':
            validator = rules.angle;
            break;
          case 'TOOLBAR_BUTTON': // <------
            validator = rules.toolbarButton;
            break;
          // case 'MESSAGE':
          //   validator = rules.messageValue
          //   break
        }
        if (p.type !== 'CHOOSE_PAIR_LIST') {
          for (const valid of validator) {
            if (valid(p.selectValue) != true) {
              return false;
            }
          }
        } else {
          if (p.values.length > 0) {
            for (const valid of validator) {
              if (valid(p.selectValue) != true) {
                return false;
              }
            }
          }
        }

        if (p.params && p.selectValue && !checkThreeParameters(p.params)) return false;
      }

      return true;
    };

    return checkThreeParameters(this.parameters);
  }

  getParamsFiles() {
    const parametersExp = this.getExpandedParameters();

    return parametersExp
      .filter(
        (p) =>
          p.type === 'PATH' &&
          ((Array.isArray(p.selectValue) && p.selectValue?.length) ||
            (!Array.isArray(p.selectValue) && p.selectValue)),
      )
      .map((fp) => {
        return {
          name: fp.name,
          selectValue: fp.dialogType === 'LOAD_FILE' ? [fp.selectValue] : fp.selectValue,
        };
      });
  }

  // JSON выбранных значений параметров
  getSelectedValueParams() {
    let value = {};
    let parametersExp = this.getExpandedParameters();

    for (const parameterExp of parametersExp) {
      switch (parameterExp.type) {
        case 'MATCHING_FIELDS': {
          let matchingFieldsRes = [];
          for (const field of parameterExp.targetFields) {
            let sources = [];
            if (field.selectValue)
              for (const source of field.selectValue) {
                sources.push(parameterExp.sourceFields.indexOf(source));
              }
            matchingFieldsRes.push(sources);
          }
          value[parameterExp.name] = matchingFieldsRes;
          break;
        }
        case 'PATH': {
          value[parameterExp.name] = Array.isArray(parameterExp.selectValue)
            ? parameterExp.selectValue.map((file) => file.name)
            : parameterExp.selectValue?.name;
          break;
        }
        case 'CHOOSE_LIST': {
          value[parameterExp.name] = parameterExp.selectValue ? parameterExp.selectValue : [];
          break;
        }
        default: {
          value[parameterExp.name] =
            parameterExp.selectValue !== undefined ? parameterExp.selectValue : '';
        }
      }
    }
    return value;
  }
}

export class ProcedurePostProcess {
  constructor(data) {
    this.processes = [];
    if (data && data.length > 0) {
      for (const d of data) {
        this.processes.push(d);
      }
    }
  }

  getProcesses() {
    return this.processes;
  }
}

export function rulesProcedureParams() {
  const message = 'Заполните значение';

  const singleInt = [(val) => (val !== undefined && val != null && val !== '') || message];
  const singleDouble = [(val) => (val !== '' && !isNaN(val)) || message];
  const singleString = [(val) => (val && val.length > 0) || message];
  const singleDate = singleString.concat([
    (val) => val < '3000-12-31' || 'Введите корректное значение даты',
  ]);
  const singleBoolean = [(val) => (val !== null && val !== undefined) || message];
  const chooseSingle = [(val) => (val !== undefined && val != null && val !== '') || message];
  const choosePair = [(val) => (val !== null && val !== undefined) || message];
  const chooseList = singleString;
  const chooseFile = [(val) => !!val || message];
  const choosePairList = singleString;
  const chooseGroupedList = singleString;
  const toolbarButton = [(val) => val == undefined || message];
  const angle = [(val) => (val !== undefined && val != null) || message];
  const groupBoolean = [
    (val) => (val !== null && val !== undefined) /*&& val !== false*/ || message,
  ];
  const messageValue = [(val) => (val !== null && val !== undefined && val !== false) || message];
  const containMask = singleString
    .concat([(val) => val.indexOf('.') == -1 || 'Поле не должно содержать "."'])
    .concat([(val) => !val.trim().length == 0 || 'Поле не должно состоять из одних пробелов']);

  return {
    singleInt,
    singleDouble,
    singleString,
    singleDate,
    singleBoolean,
    chooseSingle,
    choosePair,
    chooseList,
    chooseFile,
    choosePairList,
    chooseGroupedList,
    toolbarButton,
    angle,
    groupBoolean,
    messageValue,
    containMask,
  };
}

export function generateProcedureParamActions(pp, actions) {
  // распределяем actions по параметрам
  for (const param of pp.parameters) {
    const paramActions = actions.filter((a) => a.params.includes(param.name)).map((a) => a.action);
    if (paramActions?.length > 0) {
      param.actions = generate(param, paramActions, pp.parameters);
    }
  }

  // создаем на каждый параметр реактивную переменную акшена
  function generate(param, paramActions, parameters) {
    for (const pa of paramActions) {
      if (pa.class.includes('NotAction')) {
        const action1 = pa.action.action1;
        const action2 = pa.action.action2;

        const valueAction = parameters.find((p) => p.name === action1.action.param);
        pa.value = computed(() => {
          /*Добавлю отрицание для акшена, потому что используется в свойстве disable а не visible как в gee
            акшен отрицания с отрицанием дает условие ==*/
          let selectedValue = valueAction.selectValue;
          if (valueAction.type === 'CHOOSE_PAIR') {
            selectedValue = valueAction.keys[valueAction.selectValue];
          }
          return selectedValue == action2.konst;
        });
      }
    }
    return paramActions;
  }
}
