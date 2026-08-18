import api from '../api/client';
import type { BusinessListEntry, RecipientListEntry } from '../types';
import type {
  ErrorV3,
  FormValidateFormResult,
  ReturnHeader,
  ReturnManifest,
  SubmissionManifest,
} from './form1099NecService';

export interface MiscStateDetails {
  StateCd?: string;
  StateWH?: number;
  StateIdNum?: string;
  StateIncome?: number;
}

export interface MiscFormData {
  Rents?: number;
  Royalties?: number;
  OtherIncome?: number;
  FedIncomeTaxWH?: number;
  FishingBoatProceeds?: number;
  MedHealthcarePymts?: number;
  IsDirectSale?: boolean;
  SubstitutePymts?: number;
  CropInsurance?: number;
  GrossProceeds?: number;
  FishPurForResale?: number;
  Sec409ADeferrals?: number;
  CashTips?: number;
  TTOC1?: string | null;
  TTOC2?: string | null;
  OvertimeComp?: number;
  IsFATCA?: boolean;
  EPP?: number;
  NonQualDefComp?: number;
  AccountNum?: string;
  Is2ndTINnot?: boolean;
  States?: MiscStateDetails[];
}

export interface MiscReturnData {
  SequenceId?: string;
  ReturnManifest?: ReturnManifest;
  Recipient?: Omit<RecipientListEntry, 'TINDetails'> & {
    TINDetails?: RecipientListEntry['TINDetails'] | null;
  };
  RecordId?: string;
  MISCFormData?: MiscFormData;
}

export interface Form1099MiscCreateRequest {
  SubmissionManifest?: SubmissionManifest;
  ReturnHeader?: Omit<ReturnHeader, 'Business'> & {
    Business?: Omit<BusinessListEntry, 'TINDetails'> & {
      TINDetails?: BusinessListEntry['TINDetails'] | null;
    };
  };
  ReturnData?: MiscReturnData[];
}

export interface Form1099MiscCreatedRecord {
  SequenceId?: string;
  RecordId?: string;
  RecipientId?: string;
  PayeeRef?: string;
}

export interface Form1099MiscCreateErrorRecord {
  SequenceId?: string;
  RecordId?: string;
  Errors?: ErrorV3[];
}

export interface Form1099MiscRecordsWrapper {
  SuccessRecords?: Form1099MiscCreatedRecord[];
  ErrorRecords?: Form1099MiscCreateErrorRecord[];
}

export interface Form1099MiscCreateResponse {
  SubmissionId?: string;
  ScheduleFiling?: string;
  BusinessId?: string;
  PayerRef?: string;
  DBARef?: string;
  DBAId?: string;
  Form1099Type?: string;
  Form1099Records?: Form1099MiscRecordsWrapper;
  Errors?: ErrorV3[];
}

export type Form1099MiscCreateResult =
  | Form1099MiscCreateResponse
  | { Response: Form1099MiscCreateResponse };

export interface MiscFormGetDetails {
  Rents?: number;
  Royalties?: number;
  OtherIncome?: number;
  FedIncomeTaxWH?: number;
  FishingBoatProceeds?: number;
  MedHealthcarePymts?: number;
  IsDirectSale?: boolean;
  SubstitutePymts?: number;
  CropInsurance?: number;
  GrossProceeds?: number;
  FishPurForResale?: number;
  Sec409ADeferrals?: number;
  CashTips?: number;
  TTOC1?: string | null;
  TTOC2?: string | null;
  OvertimeComp?: number;
  IsFATCA?: boolean;
  EPP?: number;
  NonQualDefComp?: number;
  AccountNum?: string;
  Is2ndTINnot?: boolean;
  States?: MiscStateDetails[];
}

export interface MiscReturnGetDetails {
  SequenceId?: string;
  RecordId?: string;
  ReturnManifest?: ReturnManifest;
  Recipient?: RecipientListEntry;
  MISCFormData?: MiscFormGetDetails;
}

export interface Form1099MiscRecord {
  SubmissionManifest?: SubmissionManifest;
  ReturnHeader?: ReturnHeader;
  ReturnData?: MiscReturnGetDetails[];
  StateReconData?: unknown;
}

export interface GetForm1099MiscResponse {
  Form1099Records?: Form1099MiscRecord[];
  Errors?: ErrorV3[];
}

export type GetForm1099MiscResult =
  | GetForm1099MiscResponse
  | { Response: GetForm1099MiscResponse };

export const form1099MiscService = {
  create: async (request: Form1099MiscCreateRequest) => {
    return api.post<Form1099MiscCreateResult>(
      '/form1099misc/create',
      request,
    ) as any as Promise<Form1099MiscCreateResult>;
  },
  update: async (request: Form1099MiscCreateRequest) => {
    return api.put<Form1099MiscCreateResult>(
      '/form1099misc/update',
      request,
    ) as any as Promise<Form1099MiscCreateResult>;
  },
  get: async (params: { recordIds: string }) => {
    return api.get<GetForm1099MiscResult>('/form1099misc/get', {
      params: { RecordIds: params.recordIds },
    }) as any as Promise<GetForm1099MiscResult>;
  },
  validateForm: async (request: Form1099MiscCreateRequest) => {
    return api.post<FormValidateFormResult>(
      '/form1099misc/validateform',
      request,
    ) as any as Promise<FormValidateFormResult>;
  },
};
