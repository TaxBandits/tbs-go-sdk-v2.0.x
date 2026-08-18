import api from "../api/client";

export interface ListBusinessReq {
  BusinessId?: string;
  PayerRef?: string;
  BusinessNm?: string;
  PayerTIN?: string;
  TINType?: string;
}

export interface ListRecipientReq {
  RecipientId?: string;
  PayeeRef?: string;
  RecipientNm?: string;
  RecipientTIN?: string;
  TINType?: string;
}

export interface ListStateReq {
  StateCd?: string[];
  Status?: string[];
}

export interface ListDistributionReq {
  OAStatus?: string[];
  PostalStatus?: string[];
}

export interface ListEmployeeReq {
  EmployeeId?: string;
  EmployeeRef?: string;
  EmployeeNm?: string;
  EmployeeTIN?: string;
  EmployeeTINType?: string;
}

export interface List1099UtilityRequest {
  TaxYear?: string | null;
  FormTypes?: string[] | null;
  Business?: ListBusinessReq | null;
  Recipient?: ListRecipientReq | null;
  SubmissionId?: string | null;
  FederalStatus?: string[] | null;
  State?: ListStateReq | null;
  Distribution?: ListDistributionReq | null;
  FromDate?: string | null;
  ToDate?: string | null;
  Page?: number;
  PageSize?: number;
  Employee?: ListEmployeeReq | null;
}

export interface IndividualName {
  FirstNm?: string;
  MiddleNm?: string;
  LastNm?: string;
  Suffix?: string;
}

export interface ErrorV3 {
  Id: string;
  Name: string;
  Message: string;
}

export interface ListFederalResponse {
  StatusCd: string;
  Status: string;
  StatusTs: string;
  Info?: string;
  Errors: ErrorV3[];
}

export interface ListStateResponse {
  StateCd?: string;
  StatusCd: string;
  Status: string;
  StatusTs: string;
  Info: string;
  Errors: ErrorV3[];
}

export interface ListPostalResponse {
  PostalType?: string;
  Code?: string;
  Status?: string;
  StatusTs?: string;
  Info?: string;
}

export interface ListOAResponse {
  Email?: string;
  Code?: string;
  Status: string;
  StatusTs?: string;
  Info?: string;
}

export interface ListDistributionResponse {
  DistributionType?: string;
  PostalStatus?: ListPostalResponse;
  OnlineAccessStatus?: ListOAResponse;
  AttachmentURL?: string;
}

export interface Form1099UtilityListRecords {
  TaxYear: string;
  FormType: string;
  SubmissionId: string;
  RecordId: string;
  BusinessId: string;
  BusinessNm: string;
  PayerRef?: string;
  RecipientId?: string;
  EmployeeId?: string;
  PayeeRef?: string;
  EmployeeRef?: string;
  RecipientNm?: string;
  IndividualNm?: IndividualName;
  FederalStatus?: ListFederalResponse;
  StatesStatus?: ListStateResponse[];
  Distribution?: ListDistributionResponse;
  CreatedTs: string;
  LastUpdatedTs: string;
}

export interface List1099UtilityResponse {
  Form1099Records?: Form1099UtilityListRecords[];
  FormW2Records?: Form1099UtilityListRecords[];
  Page: number;
  PageSize: number;
  TotalRecords: number;
  TotalPages: number;
  Errors?: ErrorV3[];
}

export interface List1099UtilityApiResponse {
  Response: List1099UtilityResponse;
}

export interface StatusFederal {
  Status: string;
  StatusTs: string;
  Errors?: ErrorV3[];
}

export interface StatusState {
  StateCd: string;
  Status: string;
  StatusTs: string;
  Info: string;
  Errors?: ErrorV3[];
}

export interface StatusPostal {
  PostalType?: string;
  Status: string;
  StatusTs: string;
  Info?: string;
}

export interface StatusOnlineAccess {
  Email: string;
  Status: string;
  StatusTs: string;
}

export interface StatusDistribution {
  DistributionType: string;
  PostalStatus?: StatusPostal;
  OnlineAccessStatus?: StatusOnlineAccess;
}

export interface Form1099UtilityStatusRecord {
  RecordId: string;
  FederalStatus?: StatusFederal;
  StatesStatus?: StatusState[];
  Distribution?: StatusDistribution;
}

export interface StatusResponse {
  SubmissionId: string;
  FormType: string;
  Form1099Records?: Form1099UtilityStatusRecord[];
  FormW2Records?: Form1099UtilityStatusRecord[];
  Errors?: ErrorV3[];
}

export interface StatusApiResponse {
  Response: StatusResponse;
}

// The local SDKs do not all use the same response envelope.  The .NET API
// wraps the TaxBandits payload in `Response`, while the Go handler can return
// the status payload directly.
export type StatusResult = StatusApiResponse | StatusResponse;

export interface RequestDraftPdfUrlResponse {
  RecordId?: string;
  RecipientId?: string;
  PayeeRef?: string;
  DraftPdfUrl?: string;
  DraftPdfPath?: string;
  Error?: ErrorV3;
}

export type RequestDraftPdfUrlResult =
  | RequestDraftPdfUrlResponse
  | { Response: RequestDraftPdfUrlResponse };

export interface Form1099UtilityDeleteSuccessRecord {
  SequenceId?: string;
  FormType?: string;
  RecordId?: string;
  Status?: string;
  StatusTs?: string;
}

export interface Form1099UtilityDeleteResponseGroup {
  SuccessRecords?: Form1099UtilityDeleteSuccessRecord[];
  ErrorRecords?: ErrorV3[];
}

export interface Delete1099UtilityResponse {
  SubmissionId?: string;
  Form1099Records?: Form1099UtilityDeleteResponseGroup;
  FormW2Records?: Form1099UtilityDeleteResponseGroup;
  Errors?: ErrorV3[];
}

export type Delete1099UtilityResult =
  | Delete1099UtilityResponse
  | { Response: Delete1099UtilityResponse };

export interface TransmitStatus {
  Code?: string;
  Name?: string;
  Message?: string | null;
  Ts?: string;
  WebhookRef?: string | null;
}

export interface TransmitStateStatus extends TransmitStatus {
  StateCd?: string;
}

export interface TransmitDistribution {
  DistributionType?: string | null;
  PostalStatus?: TransmitStatus;
  OnlineAccessStatus?: TransmitStatus;
}

export interface TransmitRecord {
  FormType?: string;
  BusinessId?: string;
  SubmissionId?: string;
  RecordId?: string;
  FederalStatus?: TransmitStatus;
  StatesStatus?: TransmitStateStatus[];
  Distribution?: TransmitDistribution;
  Errors?: ErrorV3[];
}

export interface TransmitResponse {
  Form1099Records?: TransmitRecord[];
  FormW2Records?: TransmitRecord[];
  Errors?: ErrorV3[];
}

export type TransmitResult = TransmitResponse | { Response: TransmitResponse };

export interface PdfFiles {
  Unmasked?: string;
  UnmaskedPath?: string;
  Masked?: string;
  MaskedPath?: string;
}

export interface RequestPdfUrlErrorResponse {
  SubmissionId?: string;
  RecordId?: string;
  Errors?: ErrorV3[];
}

export interface Form1099UtilityPdfUrlsRecords {
  RecordId?: string;
  Status?: string;
  Copy1?: PdfFiles;
  Copy2?: PdfFiles;
  CopyB?: PdfFiles;
  CopyC?: PdfFiles;
  CopyD?: PdfFiles;
  Copy4Up?: PdfFiles;
  ErrorRecords?: RequestPdfUrlErrorResponse[];
}

export interface RequestPdfUrlsResponse {
  SubmissionId?: string;
  FormType?: string;
  Form1099Records?: Form1099UtilityPdfUrlsRecords;
  Errors?: ErrorV3[];
}

export type RequestPdfUrlsResult =
  | RequestPdfUrlsResponse
  | { Response: RequestPdfUrlsResponse };

export interface FederalStatusLog {
  Code?: string;
  Status?: string;
  Message?: string;
  StatusTs?: string;
}

export interface StateStatusLog {
  StateCd?: string;
  Code?: string;
  Status?: string;
  Message?: string;
  StatusTs?: string;
}

export interface OnlineAccessStatusLog {
  Email?: string;
  Code?: string;
  Status?: string;
  Message?: string;
  StatusTs?: string;
}

export interface PostalStatusLog {
  PostalType?: string;
  Code?: string;
  Status?: string;
  Message?: string;
  StatusTs?: string;
}

export interface StatusLogResponse {
  SubmissionId?: string;
  RecordId?: string;
  FormType?: string;
  FederalStatusLog?: FederalStatusLog[];
  StateStatusLog?: StateStatusLog[];
  OnlineAccessStatusLog?: OnlineAccessStatusLog[];
  PostalStatusLog?: PostalStatusLog[];
  Errors?: ErrorV3[];
}

export type StatusLogResult =
  | StatusLogResponse
  | { Response: StatusLogResponse };

export const form1099UtilityService = {
  list: async (request: List1099UtilityRequest) => {
    return api.post<List1099UtilityApiResponse>(
      "/form1099utility/list",
      request,
    ) as any as Promise<List1099UtilityApiResponse>;
  },
  status: async (params: { submissionId: string; recordIds: string }) => {
    return api.get<StatusResult>("/form1099utility/status", {
      params: {
        SubmissionId: params.submissionId,
        RecordIds: params.recordIds,
      },
    }) as any as Promise<StatusResult>;
  },
  requestDraftPdfUrl: async (recordId: string) => {
    return api.get<RequestDraftPdfUrlResult>(
      "/form1099utility/requestdraftpdfurl",
      {
        params: { RecordId: recordId },
      },
    ) as any as Promise<RequestDraftPdfUrlResult>;
  },
  requestPdfUrls: async (params: {
    submissionId: string;
    recordId: string;
  }) => {
    return api.get<RequestPdfUrlsResult>("/form1099utility/requestpdfurls", {
      params: { SubmissionId: params.submissionId, RecordId: params.recordId },
    }) as any as Promise<RequestPdfUrlsResult>;
  },
  getDraftPdfFileUrl: (draftPdfUrl: string) => {
    const params = new URLSearchParams({ draftPdfUrl });
    return `${api.defaults.baseURL}/form1099utility/draftpdffile?${params.toString()}`;
  },
  delete: async (params: { submissionId: string; recordIds: string }) => {
    return api.delete<Delete1099UtilityResult>("/form1099utility/delete", {
      params: {
        SubmissionId: params.submissionId,
        RecordIds: params.recordIds,
      },
    }) as any as Promise<Delete1099UtilityResult>;
  },
  transmit: async (params: { submissionId: string; recordIds: string[] }) => {
    return api.post<TransmitResult>("/form1099utility/transmit", {
      SubmissionId: params.submissionId,
      RecordIds: params.recordIds,
    }) as any as Promise<TransmitResult>;
  },
  statusLog: async (params: { recordId: string }) => {
    return api.get<StatusLogResult>("/form1099utility/statuslog", {
      params: { RecordId: params.recordId },
    }) as any as Promise<StatusLogResult>;
  },
};
