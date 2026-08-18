import api from '../api/client';
import type { BusinessListEntry, RecipientListEntry } from '../types';

export interface ScheduleFiling {
  EfileDate?: string | null;
}

export interface SubmissionManifest {
  SubmissionId?: string;
  TaxYear?: string;
  IsScheduleFiling?: boolean;
  ScheduleFiling?: ScheduleFiling;
}

export interface ReturnHeader {
  Business?: Omit<BusinessListEntry, 'TINDetails'> & {
    TINDetails?: BusinessListEntry['TINDetails'] | null;
  };
}

export interface DistributionDetails {
  DistributionType?: string;
  PostalType?: string;
}

export interface ReturnManifest {
  IsPostal?: boolean;
  IsFederal?: boolean;
  IsState?: boolean;
  IsDistribution?: boolean;
  DistributionDetails?: DistributionDetails;
  IsForced?: boolean;
}

export interface NecStateDetails {
  StateCd?: string;
  StateIdNum?: string;
  StateWH?: number;
  StateIncome?: number;
}

export interface NecFormData {
  NEC?: number;
  CashTips?: number;
  TTOC1?: string | null;
  TTOC2?: string | null;
  OvertimeComp?: number;
  IsDirectSales?: boolean;
  EPP?: number;
  FedTaxWH?: number;
  Is2ndTINnot?: boolean;
  AccountNum?: string;
  States?: NecStateDetails[];
}

export interface NecReturnData {
  SequenceId?: string;
  ReturnManifest?: ReturnManifest;
  RecordId?: string;
  Recipient?: Omit<RecipientListEntry, 'TINDetails'> & {
    TINDetails?: RecipientListEntry['TINDetails'] | null;
  };
  NECFormData?: NecFormData;
}

export interface Form1099NecCreateRequest {
  SubmissionManifest?: SubmissionManifest;
  ReturnHeader?: ReturnHeader;
  ReturnData?: NecReturnData[];
}

export interface ErrorV3 {
  Id: string;
  Name: string;
  Message: string;
}

export interface Form1099NecCreatedRecord {
  SequenceId?: string;
  RecordId?: string;
  RecipientId?: string;
  PayeeRef?: string;
}

export interface Form1099NecCreateErrorRecord {
  SequenceId?: string;
  RecordId?: string;
  Errors?: ErrorV3[];
}

export interface Form1099NecRecordsWrapper {
  SuccessRecords?: Form1099NecCreatedRecord[];
  ErrorRecords?: Form1099NecCreateErrorRecord[];
}

export interface Form1099NecCreateResponse {
  SubmissionId?: string;
  ScheduleFiling?: string;
  BusinessId?: string;
  PayerRef?: string;
  DBARef?: string;
  DBAId?: string;
  Form1099Type?: string;
  Form1099Records?: Form1099NecRecordsWrapper;
  Errors?: ErrorV3[];
}

export type Form1099NecCreateResult =
  | Form1099NecCreateResponse
  | { Response: Form1099NecCreateResponse };

export interface NecFormGetDetails {
  NEC?: number;
  CashTips?: number;
  TTOC1?: string | null;
  TTOC2?: string | null;
  OvertimeComp?: number;
  IsDirectSales?: boolean;
  EPP?: number;
  FedTaxWH?: number;
  Is2ndTINnot?: boolean;
  AccountNum?: string;
  States?: NecStateDetails[];
}

export interface NecReturnGetDetails {
  SequenceId?: string;
  RecordId?: string;
  ReturnManifest?: ReturnManifest;
  Recipient?: RecipientListEntry;
  NECFormData?: NecFormGetDetails;
}

export interface Form1099NecRecord {
  SubmissionManifest?: SubmissionManifest;
  ReturnHeader?: ReturnHeader;
  ReturnData?: NecReturnGetDetails[];
  StateReconData?: unknown;
}

export interface GetForm1099NecResponse {
  Form1099Records?: Form1099NecRecord[];
  Errors?: ErrorV3[];
}

export type GetForm1099NecResult =
  | GetForm1099NecResponse
  | { Response: GetForm1099NecResponse };

export interface ValidateFormErrorRecord {
  SequenceId?: string;
  RecordId?: string;
  Errors?: ErrorV3[];
}

export interface FormValidateFormResponse {
  ErrorRecords?: ValidateFormErrorRecord[];
  Errors?: ErrorV3[];
}

export type FormValidateFormResult =
  | FormValidateFormResponse
  | { Response: FormValidateFormResponse };

export const form1099NecService = {
  create: async (request: Form1099NecCreateRequest) => {
    return api.post<Form1099NecCreateResult>(
      '/form1099nec/create',
      request,
    ) as any as Promise<Form1099NecCreateResult>;
  },
  get: async (params: { recordIds: string }) => {
    return api.get<GetForm1099NecResult>('/form1099nec/get', {
      params: { RecordIds: params.recordIds },
    }) as any as Promise<GetForm1099NecResult>;
  },
  update: async (request: Form1099NecCreateRequest) => {
    return api.put<Form1099NecCreateResult>(
      '/form1099nec/update',
      request,
    ) as any as Promise<Form1099NecCreateResult>;
  },
  validateForm: async (request: Form1099NecCreateRequest) => {
    return api.post<FormValidateFormResult>(
      '/form1099nec/validateform',
      request,
    ) as any as Promise<FormValidateFormResult>;
  },
};
