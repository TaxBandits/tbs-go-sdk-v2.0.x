package dtos

type BusinessesRequest struct {
	Businesses []Business `json:"Businesses,omitempty"`
}

type Business struct {
	SequenceID        *string            `json:"SequenceId,omitempty"`
	BusinessID        *string            `json:"BusinessId,omitempty"`
	PayerRef          *string            `json:"PayerRef,omitempty"`
	IsDefaultBusiness *bool              `json:"IsDefaultBusiness,omitempty"`
	IsActive          *bool              `json:"IsActive,omitempty"`
	TINDetails        *TINDetails        `json:"TINDetails,omitempty"`
	IndividualNm      *PersonName        `json:"IndividualNm,omitempty"`
	BusinessNm        *string            `json:"BusinessNm,omitempty"`
	NameCtrl          *string            `json:"NameCtrl,omitempty"`
	DBADetails        *DBADetail         `json:"DBADetails,omitempty"`
	Address           *Address           `json:"Address,omitempty"`
	ContactDetails    *ContactDetails    `json:"ContactDetails,omitempty"`
	W2Specific        *W2Specific        `json:"W2Specific,omitempty"`
	Form1042SSpecific *Form1042SSpecific `json:"Form1042SSpecific,omitempty"`
	ACASpecific       *ACASpecific       `json:"ACASpecific,omitempty"`
	Form480Specific   *Form480Specific   `json:"Form480Specific,omitempty"`
	BusinessType      *string            `json:"BusinessType,omitempty"`
	SigningAuthority  *SigningAuthority  `json:"SigningAuthority,omitempty"`
}

type TINDetails struct {
	Format  *string `json:"Format,omitempty"`
	TINType *string `json:"TINType,omitempty"`
	TIN     *string `json:"TIN,omitempty"`
}

type PersonName struct {
	FirstNm  *string `json:"FirstNm,omitempty"`
	MiddleNm *string `json:"MiddleNm,omitempty"`
	LastNm   *string `json:"LastNm,omitempty"`
	Suffix   *string `json:"Suffix,omitempty"`
}

type Address struct {
	Address1        *string `json:"Address1,omitempty"`
	Address2        *string `json:"Address2,omitempty"`
	City            *string `json:"City,omitempty"`
	ProvinceOrState *string `json:"ProvinceOrState,omitempty"`
	ZipCd           *string `json:"ZipCd,omitempty"`
	Country         *string `json:"Country,omitempty"`
}

type ContactDetails struct {
	FirstNm   *string `json:"FirstNm,omitempty"`
	MiddleNm  *string `json:"MiddleNm,omitempty"`
	LastNm    *string `json:"LastNm,omitempty"`
	Suffix    *string `json:"Suffix,omitempty"`
	Phone     *string `json:"Phone,omitempty"`
	PhoneExtn *string `json:"PhoneExtn,omitempty"`
	Email     *string `json:"Email,omitempty"`
	Fax       *string `json:"Fax,omitempty"`
}

type W2Specific struct {
	KindOfEmployer *string `json:"KindOfEmployer,omitempty"`
	KindOfPayer    *string `json:"KindOfPayer,omitempty"`
}

type Form1042SSpecific struct {
	WHAgtCh3Cd *string `json:"WHAgtCh3Cd,omitempty"`
	WHAgtCh4Cd *string `json:"WHAgtCh4Cd,omitempty"`
	WHAgtGIIN  *string `json:"WHAgtGIIN,omitempty"`
	FTIN       *string `json:"FTIN,omitempty"`
	Country    *string `json:"Country,omitempty"`
}

type ACASpecific struct {
	IsInsurer          *bool `json:"IsInsurer,omitempty"`
	IsGovernmentalUnit *bool `json:"IsGovernmentalUnit,omitempty"`
}

type Form480Specific struct {
	TaxPayerType *string `json:"TaxPayerType,omitempty"`
}

type SigningAuthority struct {
	FirstNm            *string `json:"FirstNm,omitempty"`
	MiddleNm           *string `json:"MiddleNm,omitempty"`
	LastNm             *string `json:"LastNm,omitempty"`
	Suffix             *string `json:"Suffix,omitempty"`
	Phone              *string `json:"Phone,omitempty"`
	PhoneExtn          *string `json:"PhoneExtn,omitempty"`
	BusinessMemberType *string `json:"BusinessMemberType,omitempty"`
}

type DBADetail struct {
	SequenceID *string  `json:"SequenceId,omitempty"`
	DBANm      *string  `json:"DBANm,omitempty"`
	DBARef     *string  `json:"DBARef,omitempty"`
	DBAID      *string  `json:"DBAId,omitempty"`
	Address    *Address `json:"Address,omitempty"`
}

type GetBusinessQuery struct {
	BusinessID string
	TinType    string
	TIN        string
	PayerRef   string
}

type ListBusinessQuery struct {
	Last4Digit string
	PayerName  string
	FromDate   string
	ToDate     string
	Page       int
	PageSize   int
	IsActive   *bool
}

type DeleteBusinessQuery struct {
	BusinessIDs   string
	PayerRefs     string
	IsForceDelete *bool
}

type ActivationQuery struct {
	BusinessIDs string
	PayerRefs   string
}

type AddDBARequest struct {
	BusinessID *string     `json:"BusinessId,omitempty"`
	PayerRef   *string     `json:"PayerRef,omitempty"`
	DBADetails []DBADetail `json:"DBADetails,omitempty"`
}

type ListDBAQuery struct {
	BusinessID string
	PayerRef   string
	Page       string
	PageSize   string
}

type DeleteDBAQuery struct {
	BusinessID string
	PayerRef   string
	DBAIDs     string
	DBARefs    string
}
