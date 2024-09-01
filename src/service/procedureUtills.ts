import { computed } from 'vue';
import {
  iSPP,
  ppDialogType,
  ppSelectValue,
  ppType,
  ProcedureAction,
  ProcedureParam,
  ValidatePPFunc,
} from './types.ts';
import { ValidationRule } from 'quasar';

export class StageControl {
  id: string;
  name: string;
  count: number;
  step?: object;

  constructor(id: string, name: string, count: number) {
    this.id = id;
    this.name = name;
    this.count = count;
  }

  setStep(id: string, step: object) {
    id; // ?
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
  parameters?: ProcedureParam[];

  constructor(parameters: ProcedureParam[]) {
    this.addParameters(parameters);
  }

  addParameter(param: ProcedureParam) {
    this.addParameters([param]);
  }

  addParameters(parameters: ProcedureParam[]) {
    if (!this.parameters) this.parameters = [];
    if (parameters && parameters.length > 0)
      this.parameters = this.parameters.concat(this.#setupSelectValue(parameters));
  }

  // Initialize default value for procedure param
  nonChecked = [ppType.MATCHING_FIELDS];

  #setupSelectValue(pp: ProcedureParam[]) {
    for (let i = 0; i < pp.length; i++) {
      let par = pp[i];

      if (!this.nonChecked.includes(par.type)) par.selectValue = par.defaultValue;

      if (par.typeValue === 'boolean' && par.selectValue === undefined) par.selectValue = false;
      if (par.type === ppType.CHOOSE_LIST) {
        par.selectValue = [];
      }
      if (par.type === ppType.CHOOSE_PAIR) {
        if (par.bigList && par.values && par.keys) {
          par.values = par.values.map((val, i) => (!!val ? val : '') + `(${par.keys?.[i]})`);
        }
      }
      if (par.type === ppType.PATH) {
        par.selectValue = null;
      }
      if (par.type === ppType.GROUP && par.params) this.#setupSelectValue(par.params);
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

  getExpandedParametersRecursion(params?: ProcedureParam[]) {
    let ppArr: ProcedureParam[] = [];
    if (params?.length) {
      for (let i = 0; i < params.length; i++) {
        ppArr.push(params[i]);
        if (params[i].type === ppType.GROUP) {
          let childArr = this.getExpandedParametersRecursion(params[i].params);
          ppArr = ppArr.concat(childArr);
        }
      }
    }
    return ppArr;
  }

  getParameters() {
    return this.parameters ? this.parameters : null;
  }

  // setParameters(parameters) {
  //   this.parameters = parameters;
  // }

  // Проверка параметров на валидность
  isValidParameters():boolean {
    if (!this.parameters) return false;

    const rules = rulesProcedureParams();

    //let parametersExp = this.getExpandedParameters();

    const checkThreeParameters = (parametersExp?: ProcedureParam[]) => {
      if (!parametersExp) return;

      for (let i = 0; i < parametersExp.length; i++) {
        let validator: (ValidationRule)[] | undefined;
        let p = parametersExp[i];
        if (p.nullable) continue;

        switch (p.type) {
          case ppType.SINGLE:
            if (p.typeValue === 'integer') {
              validator = rules.singleInt;
            } else if (p.typeValue === 'double') {
              validator = rules.singleDouble;
            } else if (p.typeValue === 'string') {
              validator = rules.singleString;
              if (p.mask && p.selectValue && typeof p.selectValue === 'string') {
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
          case ppType.GROUP:
            if (p.selectValue) checkThreeParameters(p.params);
            validator = rules.groupBoolean;
            break;
          case ppType.CHOOSE_SINGLE:
            validator = rules.chooseSingle;
            break;
          case ppType.CHOOSE_LIST:
            validator = rules.chooseList;
            break;
          case ppType.PATH:
            validator = rules.chooseFile;
            break;
          case ppType.CHOOSE_PAIR:
            validator = rules.choosePair;
            break;
          case ppType.CHOOSE_PAIR_LIST:
            validator = rules.choosePairList;
            break;
          case ppType.CHOOSE_GROUPED_LIST:
            validator = rules.chooseGroupedList;
            break;
          case ppType.ANGLE:
          case ppType.ROTATE:
            validator = rules.angle;
            break;
          case ppType.TOOLBAR_BUTTON: // <------
            validator = rules.toolbarButton;
            break;
        }

        if (p.type !== ppType.CHOOSE_PAIR_LIST && validator) {
          for (const valid of validator) {
            // @ts-ignore
            if (typeof valid === 'function' && valid(p.selectValue) != true) {
              return false;
            }
          }
        } else if (p?.values?.length && p?.values?.length > 0 && validator) {
          for (const valid of validator) {
            // @ts-ignore
            if (typeof valid === 'function' && valid(p.selectValue) != true) {
              return false;
            }
          }
        }
        if (p.params && p.selectValue && !checkThreeParameters(p.params)) return false;
      }

      return true;
    };

    return checkThreeParameters(this.parameters);
  }

  getParamsFiles(): ProcedureParam[] {
    const parametersExp = this.getExpandedParameters();

    return parametersExp
      .filter(
        (p) =>
          p.type === ppType.PATH &&
          ((Array.isArray(p.selectValue) && p.selectValue?.length) ||
            (!Array.isArray(p.selectValue) && p.selectValue)),
      )
      .map((fp) => {
        return {
          name: fp.name,
          selectValue: fp?.dialogType === ppDialogType.LOAD_FILE ? [fp.selectValue] : fp.selectValue,
        };
      });
  }

  // JSON выбранных значений параметров
  getSelectedValueParams(): object {
    let value = {} as { [key: string]: any };
    let parametersExp = this.getExpandedParameters();

    for (const parameterExp of parametersExp) {
      if (parameterExp.name) {
        switch (parameterExp.type) {
          case ppType.MATCHING_FIELDS: {
            let matchingFieldsRes = [];
            if (parameterExp.targetFields && parameterExp.sourceFields)
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
          case ppType.PATH: {
            value[parameterExp.name] = Array.isArray(parameterExp.selectValue)
              ? parameterExp.selectValue.map((file: ppSelectValue) => typeof file == 'object' && !Array.isArray(file) && file?.name)
              : typeof parameterExp.selectValue == 'object' && !Array.isArray(parameterExp.selectValue) && parameterExp.selectValue?.name;
            break;
          }
          case ppType.CHOOSE_LIST: {
            value[parameterExp.name] = parameterExp.selectValue ? parameterExp.selectValue : [];
            break;
          }
          default: {
            value[parameterExp.name] =
              parameterExp.selectValue !== undefined ? parameterExp.selectValue : '';
          }
        }
      }
    }
    return value;
  }
}

export class ProcedurePostProcess {
  processes: string[];

  constructor(data: string[]) {
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

export function rulesProcedureParams(): ValidatePPFunc {
  const message = 'Заполните значение';

  const singleInt: ValidationRule[] = [(val) => (val !== undefined && val != null && val !== '') || message];
  const singleDouble: ValidationRule[] = [(val) => (val && val !== '' && typeof val === 'number') || message];
  const singleString: ValidationRule[] = [(val) => (val && typeof val === 'string' && val.length > 0) || message];
  const singleDate: ValidationRule[] = [...singleString, (val) => (val && typeof val === 'string' && val.length < '3000-12-31'.length) || 'Введите корректное значение даты'];
  const singleBoolean: ValidationRule[] = [(val) => (val !== null && val !== undefined) || message];
  const chooseSingle: ValidationRule[] = [(val) => (val !== undefined && val != null && val !== '') || message];
  const choosePair: ValidationRule[] = [(val) => (val !== null && val !== undefined) || message];
  const chooseList: ValidationRule[] = singleString;
  const chooseFile: ValidationRule[] = [(val) => !!val || message];
  const choosePairList: ValidationRule[] = singleString;
  const chooseGroupedList: ValidationRule[] = singleString;
  const toolbarButton: ValidationRule[] = [(val) => val == undefined || message];
  const angle: ValidationRule[] = [(val) => (val !== undefined && val != null) || message];
  const groupBoolean: ValidationRule[] = [(val) => (val !== null && val !== undefined) || message];
  const messageValue: ValidationRule[] = [(val) => (val !== null && val !== undefined && val !== false) || message];
  const containMask: ValidationRule[] = [...singleString,
    (val) => (val && typeof val === 'string' && !val?.includes('.')) || 'Поле не должно содержать "."',
    (val) => (val && typeof val == 'string' && !(val?.trim() == '')) || 'Поле не должно состоять из одних пробелов',
  ];

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

export function generateProcedureParamActions(parameters: ProcedureParam[], actions: ProcedureAction[]) {
  // распределяем actions по параметрам
  for (const param of parameters) {
    const paramActions = actions.filter((a) => param?.name && a.params?.includes(param.name));
    if (paramActions?.length > 0) {
      param.actions = generate(paramActions, parameters);
    }
  }

  // создаем на каждый параметр реактивную переменную акшена
  function generate(paramActions: ProcedureAction[], parameters: ProcedureParam[]) {
    for (const pa of paramActions) {
      if (pa.class?.includes('NotAction')) {
        const action1 = pa.action.action1;
        const action2 = pa.action.action2;

        const valueAction = parameters.find((p) => p.name === action1.action.param);
        pa.value = computed(() => {
          /*Добавлю отрицание для акшена, потому что используется в свойстве disable а не visible как в gee
            акшен отрицания с отрицанием дает условие ==*/
          let selectedValue = valueAction?.selectValue;
          if (valueAction?.type === ppType.CHOOSE_PAIR && typeof valueAction.selectValue == 'number') {
            selectedValue = valueAction?.keys?.[valueAction.selectValue];
          }
          return selectedValue == action2?.konst;
        });
      }
    }
    return paramActions;
  }
}


export function toIsoString(date: Date) {
  var tzo = -date.getTimezoneOffset(), dif = tzo >= 0 ? '+' : '-', pad = function(num: number) {
    return (num < 10 ? '0' : '') + num;
  };
  return (date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()) + dif + pad(Math.floor(Math.abs(tzo) / 60)) + ':' + pad(Math.abs(tzo) % 60));
}

