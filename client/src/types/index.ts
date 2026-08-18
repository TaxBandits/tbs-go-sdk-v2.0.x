export interface Address {
  Address1: string;
  Address2?: string;
  City: string;
  ProvinceOrState: string;
  ZipCd: string;
  Country: string;
}

export type TINType =
  | "EIN"
  | "SSN"
  | "QI-EIN"
  | "WP-EIN"
  | "WT-EIN"
  | "NQI-EIN"
  | "ITIN"
  | "IRSN";

export interface TINDetails {
  TINType: TINType;
  Last4Digit?: string;
  TINMatchStatus?: string | null;
  Format?: string;
  TIN?: string;
  TINToken?: string;
}

export interface DBADetail {
  SequenceId?: string;
  DBAId?: string;
  DBANm: string;
  DBARef: string;
  IsDefaultDBA: boolean;
  Address: Address;
  CreatedTime?: string;
  LastUpdatedTime?: string;
}

export interface DBAListResponse {
  Response: {
    BusinessId: string;
    PayerRef: string;
    DBADetails: DBADetail[];
    Page: number;
    PageSize: number;
    TotalRecords: number;
    TotalPages: number;
    Errors: any[] | null;
  };
}

export interface DBAActionResponse {
  Response: {
    StatusCode: number;
    BusinessId: string;
    PayerRef: string;
    DBADetails: {
      SuccessRecords: Array<{
        SequenceId: string;
        DBAId: string;
        DBARef: string;
        DBANm: string;
      }>;
      ErrorRecords: Array<{
        SequenceId: string | null;
        DBARef: string | null;
        DBANm: string | null;
        Errors: Array<{
          Id: string;
          Name: string;
          Message: string;
        }>;
      }>;
    };
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }> | null;
  };
}

export interface DBADeleteResponse {
  BusinessId: string;
  PayerRef: string;
  SuccessRecords: Array<{
    DBAId: string;
    DBARef: string;
    Status: string;
    StatusTs: string;
  }>;
  ErrorRecords: Array<{
    DBAId: string | null;
    DBARef: string | null;
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }>;
  }>;
  Errors: Array<{
    Id: string;
    Name: string;
    Message: string;
  }> | null;
}

export interface RecipientDBADetail {
  SequenceId?: string;
  DBAId?: string;
  DBANm: string;
  DBARef: string;
  IsDefaultDBA: boolean;
  Address: Address;
}

export interface RecipientDBAListResponse {
  Response: {
    RecipientId: string;
    PayeeRef: string;
    DBADetails: RecipientDBADetail[];
    Page: number;
    PageSize: number;
    TotalRecords: number;
    TotalPages: number;
    Errors: any[] | null;
  };
}

export interface RecipientDBAActionResponse {
  Response: {
    StatusCode: number;
    RecipientId: string | null;
    PayeeRef: string | null;
    DBADetails: {
      SuccessRecords: Array<{
        SequenceId: string;
        DBAId: string;
        DBARef: string;
        DBANm: string;
      }> | null;
      ErrorRecords: Array<{
        SequenceId: string | null;
        DBARef: string | null;
        DBANm: string | null;
        Errors: Array<{
          Id: string;
          Name: string;
          Message: string;
        }>;
      }> | null;
    } | null;
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }> | null;
  };
}

export interface RecipientDBADeleteResponse {
  Response: {
    RecipientId: string;
    PayeeRef: string;
    SuccessRecords: Array<{
      DBAId: string;
      DBARef: string;
      Status: string;
      StatusTs: string;
    }>;
    ErrorRecords: Array<{
      DBAId: string | null;
      DBARef: string | null;
      Errors: Array<{
        Id: string;
        Name: string;
        Message: string;
      }>;
    }>;
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }> | null;
  };
}

export interface BusinessListEntry {
  BusinessId: string;
  PayerRef: string;
  IsDefaultBusiness: boolean;
  IsActive: boolean;
  TINDetails: TINDetails;
  IndividualNm?: IndividualName | null;
  BusinessNm: string;
  NameCtrl: string;
  DBADetails: {
    DBANm: string;
    DBARef: string;
    DBAId: string;
  };
  Email: string;
  Address: Address;
  CreatedTime: string;
  LastUpdatedTime: string;
}

export interface BusinessListResponse {
  Response: {
    Businesses: BusinessListEntry[];
    Page: number;
    PageSize: number;
    TotalRecords: number;
    TotalPages: number;
    Errors: any[] | null;
  };
}

export interface BusinessDetail extends Payer {
  BusinessId: string;
  IsActive: boolean;
  CreatedTime?: string;
  LastUpdatedTime?: string;
}

export interface BusinessGetResponse {
  Response: {
    Business: BusinessDetail;
    Errors: any[] | null;
  };
}

export interface BusinessCreateResponse {
  Response: {
    StatusCode: number;
    SuccessBusinesses: any[] | null;
    ErrorBusinesses: Array<{
      SequenceId: string;
      PayerRef: string | null;
      Errors: Array<{
        Id: string;
        Name: string;
        Message: string;
      }>;
    }> | null;
    Errors: any[] | null;
  };
}

export interface BusinessDeleteResponse {
  Response: {
    StatusCode: number;
    Message: string;
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }> | null;
  };
}

export interface BusinessStatusResponse {
  SuccessRecords: Array<{
    BusinessId: string;
    PayerRef: string;
    Status: string;
    StatusTs: string;
  }>;
  ErrorRecords: Array<{
    BusinessId: string | null;
    PayerRef: string | null;
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }>;
  }>;
  Errors: Array<{
    Id: string;
    Name: string;
    Message: string;
  }> | null;
}

export interface IndividualName {
  FirstNm: string;
  MiddleNm?: string;
  LastNm: string;
  Suffix?: string;
}

export interface ContactDetails {
  FirstNm: string;
  MiddleNm?: string;
  LastNm: string;
  Suffix?: string;
  Phone: string;
  PhoneExtn?: string;
  Email: string;
  Fax?: string;
}

export interface RecipientListEntry {
  RecipientId: string;
  PayeeRef: string;
  IsActive: boolean;
  TINDetails: TINDetails;
  IndividualNm?: IndividualName | null;
  BusinessNm: string;
  DBADetails?: {
    DBANm: string;
    DBARef: string;
    DBAId: string;
  } | null;
  Email: string;
  Address: Address;
  CreatedTime: string;
  LastUpdatedTime: string;
}

export interface RecipientListResponse {
  Response: {
    Business: {
      BusinessId: string;
      BusinessNm: string;
      PayerRef: string;
    } | null;
    Recipient: RecipientListEntry[];
    Page: number;
    PageSize: number;
    TotalRecords: number;
    TotalPages: number;
    Errors: any[] | null;
  };
}

export interface W9Details {
  FedTaxClassification?: string;
  ExemptPayeeCd?: string;
  FATCACode?: string;
  IsBackupWth?: boolean;
}

export interface W8BenDetails {
  CitizenOfCountry?: string;
  FTIN?: string;
  IsFTINNotLegallyRequired?: boolean;
}

export interface Details1042S {
  Ch3Cd?: string;
  Ch4Cd?: string;
  GIIN?: string;
  LOBCode?: string;
}

export interface GetRecipientEntry {
  RecipientId: string;
  PayeeRefs: string[];
  IsActive: boolean;
  TINDetails: TINDetails;
  IndividualNm?: IndividualName | null;
  BusinessNm?: string | null;
  NameCtrl?: string | null;
  DBADetails?: DBADetail[] | null;
  Address: Address;
  DOB?: string | null;
  Email?: string | null;
  Fax?: string | null;
  Phone?: string | null;
  W9Details?: W9Details | null;
  W8BenDetails?: W8BenDetails | null;
  Form1042SDetails?: Details1042S | null;
}

export interface RecipientGetResponse {
  Response: {
    Recipients: GetRecipientEntry[];
    Errors: any[] | null;
  };
}

export interface CreateRecipientEntry {
  SequenceId?: string;
  RecipientId?: string;
  PayeeRef?: string;
  TINDetails?: TINDetails;
  IndividualNm?: IndividualName | null;
  BusinessNm?: string | null;
  NameCtrl?: string | null;
  DBADetails?: {
    DBANm: string;
    DBARef: string;
    Address?: Address;
  } | null;
  Address: Address;
  DOB?: string | null;
  Email?: string | null;
  Fax?: string | null;
  Phone?: string | null;
  W9Details?: W9Details | null;
  W8BenDetails?: W8BenDetails | null;
  Form1042SDetails?: Details1042S | null;
}

export interface RecipientCreateRequest {
  Recipients: CreateRecipientEntry[];
}

export interface RecipientUpdateRequest {
  Recipients: CreateRecipientEntry[];
}

export interface RecipientCreateResponse {
  Response: {
    StatusCode: number;
    SuccessRecipients: Array<{
      SequenceId: string;
      RecipientId: string;
      PayeeRef: string;
      Last4DigitTIN?: string;
    }> | null;
    ErrorRecipients: Array<{
      SequenceId: string | null;
      RecipientId?: string | null;
      PayeeRef: string | null;
      Last4DigitTIN?: string | null;
      Errors: Array<{
        Id: string;
        Name: string;
        Message: string;
      }>;
    }> | null;
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }> | null;
  };
}

export interface RecipientDeleteResponse {
  Response: {
    StatusCode: number;
    RecipientId: string | null;
    PayeeRef: string | null;
    Status: string | null;
    StatusTs: string | null;
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }> | null;
  };
}

export interface RecipientActivateResponse {
  Response: {
    StatusCode: number;
    SuccessRecords: Array<{
      RecipientId: string | null;
      PayeeRef: string | null;
      Status: string | null;
      StatusTs: string | null;
    }> | null;
    ErrorRecords: Array<{
      RecipientId: string | null;
      PayeeRef: string | null;
      Errors: Array<{
        Id: string;
        Name: string;
        Message: string;
      }>;
    }> | null;
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }> | null;
  };
}

export interface RecipientAssignment {
  SequenceId?: string;
  RecipientId: string;
  PayeeRef?: string;
}

export interface AssignRecipientRequest {
  BusinessId: string;
  PayerRef?: string;
  AssignRecipients: RecipientAssignment[];
}

export interface UnAssignRecipientRequest {
  BusinessId: string;
  PayerRef?: string;
  UnAssignRecipients: RecipientAssignment[];
}

export interface AssignRecipientResponse {
  Response: {
    StatusCode: number;
    BusinessId: string | null;
    PayerRef: string | null;
    SuccessRecipients: Array<{
      SequenceId: string | null;
      RecipientId: string | null;
      PayeeRef: string | null;
      Status: string | null;
      StatusTs: string | null;
    }> | null;
    ErrorRecipients: Array<{
      SequenceId: string | null;
      RecipientId: string | null;
      PayeeRef: string | null;
      Errors: Array<{
        Id: string;
        Name: string;
        Message: string;
      }>;
    }> | null;
    Errors: Array<{
      Id: string;
      Name: string;
      Message: string;
    }> | null;
  };
}

export interface Payer {
  BusinessId?: string | null;
  SequenceId?: string;
  PayerRef: string;
  IsDefaultBusiness: boolean;
  TINDetails: TINDetails;
  IndividualNm?: IndividualName | null;
  BusinessNm?: string;
  NameCtrl: string;
  DBADetails?: DBADetail[] | DBADetail; // Can be array or single based on user's mixed requests
  Email: string;
  Address: Address;
  ContactDetails: ContactDetails;
  W2Specific: {
    KindOfEmployer: string;
    KindOfPayer: string;
  };
  Form1042SSpecific: {
    WHAgtCh3Cd: string;
    WHAgtCh4Cd: string;
    WHAgtGIIN: string;
    FTIN: string;
    Country: string;
  };
  ACASpecific: {
    IsInsurer: boolean;
    IsGovernmentalUnit: boolean;
  };
  Form480Specific: {
    TaxPayerType: string;
  };
  BusinessType: string;
  SigningAuthority: {
    FirstNm: string;
    MiddleNm?: string;
    LastNm: string;
    Suffix?: string;
    Phone: string;
    PhoneExtn?: string;
    BusinessMemberType: string;
  };
}
