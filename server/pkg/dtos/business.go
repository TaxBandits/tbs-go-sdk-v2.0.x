package dtos

// BusinessesRequest is the request payload for creating or updating one or more Business records.
type BusinessesRequest struct {
	Businesses []Business `json:"Businesses,omitempty"`
}

// Business represents a payer/filer business entity, including its TIN, name, address, contact details, and form-specific settings.
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

// TINDetails holds a taxpayer identification number along with its format and type.
type TINDetails struct {
	Format  *string `json:"Format,omitempty"`
	TINType *string `json:"TINType,omitempty"`
	TIN     *string `json:"TIN,omitempty"`
}

// PersonName holds the components of an individual's name.
type PersonName struct {
	FirstNm  *string `json:"FirstNm,omitempty"`
	MiddleNm *string `json:"MiddleNm,omitempty"`
	LastNm   *string `json:"LastNm,omitempty"`
	Suffix   *string `json:"Suffix,omitempty"`
}

// Address holds a postal mailing address.
type Address struct {
	Address1        *string `json:"Address1,omitempty"`
	Address2        *string `json:"Address2,omitempty"`
	City            *string `json:"City,omitempty"`
	ProvinceOrState *string `json:"ProvinceOrState,omitempty"`
	ZipCd           *string `json:"ZipCd,omitempty"`
	Country         *string `json:"Country,omitempty"`
}

// ContactDetails holds a contact person's name, phone, fax, and email address.
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

// W2Specific holds Form W-2 specific business attributes, such as employer and payer kind.
type W2Specific struct {
	KindOfEmployer *string `json:"KindOfEmployer,omitempty"`
	KindOfPayer    *string `json:"KindOfPayer,omitempty"`
}

// Form1042SSpecific holds Form 1042-S specific withholding agent attributes for a business.
type Form1042SSpecific struct {
	WHAgtCh3Cd *string `json:"WHAgtCh3Cd,omitempty"`
	WHAgtCh4Cd *string `json:"WHAgtCh4Cd,omitempty"`
	WHAgtGIIN  *string `json:"WHAgtGIIN,omitempty"`
	FTIN       *string `json:"FTIN,omitempty"`
	Country    *string `json:"Country,omitempty"`
}

// ACASpecific holds ACA-specific flags indicating whether a business is an insurer or a governmental unit.
type ACASpecific struct {
	IsInsurer          *bool `json:"IsInsurer,omitempty"`
	IsGovernmentalUnit *bool `json:"IsGovernmentalUnit,omitempty"`
}

// Form480Specific holds Form 480 specific taxpayer type information for Puerto Rico filings.
type Form480Specific struct {
	TaxPayerType *string `json:"TaxPayerType,omitempty"`
}

// SigningAuthority identifies the individual authorized to sign returns on behalf of a business.
type SigningAuthority struct {
	FirstNm            *string `json:"FirstNm,omitempty"`
	MiddleNm           *string `json:"MiddleNm,omitempty"`
	LastNm             *string `json:"LastNm,omitempty"`
	Suffix             *string `json:"Suffix,omitempty"`
	Phone              *string `json:"Phone,omitempty"`
	PhoneExtn          *string `json:"PhoneExtn,omitempty"`
	BusinessMemberType *string `json:"BusinessMemberType,omitempty"`
}

// DBADetail represents a "doing business as" name and address associated with a business.
type DBADetail struct {
	SequenceID *string  `json:"SequenceId,omitempty"`
	DBANm      *string  `json:"DBANm,omitempty"`
	DBARef     *string  `json:"DBARef,omitempty"`
	DBAID      *string  `json:"DBAId,omitempty"`
	Address    *Address `json:"Address,omitempty"`
}

// GetBusinessQuery holds the parameters for looking up a single business by ID, TIN, or payer reference.
type GetBusinessQuery struct {
	BusinessID string
	TinType    string
	TIN        string
	PayerRef   string
}

// ListBusinessQuery holds the filter and pagination parameters for listing businesses.
type ListBusinessQuery struct {
	Last4Digit string
	PayerName  string
	FromDate   string
	ToDate     string
	Page       int
	PageSize   int
	IsActive   *bool
}

// DeleteBusinessQuery holds the identifiers of the businesses to delete.
type DeleteBusinessQuery struct {
	BusinessIDs   string
	PayerRefs     string
	IsForceDelete *bool
}

// ActivationQuery holds the identifiers of the businesses to activate or deactivate.
type ActivationQuery struct {
	BusinessIDs string
	PayerRefs   string
}

// AddDBARequest is the request payload for adding one or more DBA names to a business.
type AddDBARequest struct {
	BusinessID *string     `json:"BusinessId,omitempty"`
	PayerRef   *string     `json:"PayerRef,omitempty"`
	DBADetails []DBADetail `json:"DBADetails,omitempty"`
}

// ListDBAQuery holds the filter and pagination parameters for listing a business's DBA names.
type ListDBAQuery struct {
	BusinessID string
	PayerRef   string
	Page       string
	PageSize   string
}

// DeleteDBAQuery holds the identifiers of the DBA names to delete from a business.
type DeleteDBAQuery struct {
	BusinessID string
	PayerRef   string
	DBAIDs     string
	DBARefs    string
}
