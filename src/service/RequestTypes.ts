import { ProcedureParam } from './types.ts';


export interface SqlProcedureType {
  rows: string[]
}

export interface iResponse {
  PROCESS_ID: string
  TYPE_PARAM: string
  object: string | string[] | ProcedureParam[]
  fileName: string
  TEXT?:string
}
