import { Ref } from 'vue';
import { ValidationRule } from 'quasar';
import { ProcedureParameters, ProcedurePostProcess, StageControl } from './procedureUtills.ts';

export interface ProcedureParam {
  selectValue?: ppSelectValue;
  defaultValue?: ppSelectValue;
  typeValue?: string;
  values?: string[];
  keys?: string[];
  type: ppType;
  bigList: string;
  name?: string;
  dialogType?: ppDialogType;
  params?: ProcedureParam[];
  mask?: string;
  nullable?: boolean;
  ext?: string[];
  description?: string;
  signSupport?: boolean;

  actions?: ProcedureAction[];
  targetFields?: { selectValue: string }[];
  sourceFields?: string[];
}

export interface ProcedureAction {
  class?: string[];
  action: paAction;
  value: object;
  params: string[];

}

export interface paAction {
  action1: { action: { param: string } };
  action2: { konst: string };
}

export type ppSelectValue = string | boolean | string[] | null | ppSelectValFileType[] | ppSelectValFileType


export enum ppType {
  SINGLE,
  CHOOSE_SINGLE,
  CHOOSE_LIST,
  CHOOSE_PAIR,
  PATH,
  GROUP,
  MATCHING_FIELDS,
  CHOOSE_PAIR_LIST,
  CHOOSE_GROUPED_LIST,
  ANGLE,
  ROTATE,
  TOOLBAR_BUTTON,
}

export interface ppSelectValFileType {
  name?: string;
}

export enum ppDialogType {
  LOAD_FILE
}


export interface ValidatePPFunc {
  singleInt: ValidationRule[];
  singleDouble: ValidationRule[];
  singleString: ValidationRule[];
  singleDate: ValidationRule[];
  singleBoolean: ValidationRule[];
  chooseSingle: ValidationRule[];
  choosePair: ValidationRule[];
  chooseList: ValidationRule[];
  chooseFile: ValidationRule[];
  choosePairList: ValidationRule[];
  chooseGroupedList: ValidationRule[];
  toolbarButton: ValidationRule[];
  angle: ValidationRule[];
  groupBoolean: ValidationRule[];
  messageValue: ValidationRule[];
  containMask: ValidationRule[];
}


export interface RunProcedure {
  id: string
  factId: string
  cellId?: string
  selected?: string[] | string
  callback?: (processId?: string) => void,
  updateTable?: (f: string, sql: string) => void
}

export interface ProcedureInstance {
  processId: string,
  instance: pRunner

}

export interface pRunner {
  finish: () => void;
  run: (p: RunProcedure) => Promise<string | undefined>;
  nextPage: (p: string | object) => void;
  stateControl: rStateControl;
  sendParams: () => Promise<boolean>;
  sendDialog: (param: string) => Promise<void>;
  sendCustomDialog: (param: object) => Promise<void>;
  processId: Ref<string | undefined>;
}

export interface rStateControl {
  // name: Ref<string>
  //stateControl: iState
  // setState: (name: string, value: object) => void
  // clearState: () => void
  // setEmpty: (name:string) => void
  // setActions: (act:object)=>void,

  name: Ref<string>;
  state: Ref<iState | undefined>;
  setState: (nameState: string, value?: iState) => void;
  clearState: () => void;
  setEmpty: (nname: string) => void;
  setActions: (act: string[]) => void;
}

export interface iState {
  pp?: ProcedureParameters;
  downloadLinks?: iDownloadLink[];
  messages?: string[];
  error?: string;
  stageControl?: StageControl;
  postProcess?: ProcedurePostProcess;
  dialogData?: string;
  customDialogData?: string;
}

// export interface iSPP{
//   parameters:ProcedureParam
//   isValidParameters: ()=>boolean
//   getParamsFiles: ()=>ProcedureParam[]
//   getSelectedValueParams: ()=> object
// }

export interface iDownloadLink {
  fileName?: string;
  fileUid?: string;
}


export interface iAllProcedures {
  procedureList: ProcedureEl[];
  procedureFact: ProcedureEl[];
  reportsList: ProcedureEl[];
  favorites: {
    procedures: ProcedureEl[]
    reports: ProcedureEl[]
  };
}

export interface ProcedureEl {
  name: string;
  id: string;
  children: ProcedureEl[];
}

export interface iConfig {
  onlyFavorites: boolean;
  editFavorites: boolean;
}

export enum Pages {
  START_PAGE
}



