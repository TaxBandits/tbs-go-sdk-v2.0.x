package dtos

// SubmissionManifest, ReturnHeader and ReturnManifest are shared across the
// Form1099NEC and Form1099MISC request/response contracts.

// SubmissionManifest describes a filing submission's identifiers, tax year, and optional schedule-filing date.
type SubmissionManifest struct {
	SubmissionId     *string         `json:"SubmissionId"`
	TaxYear          *string         `json:"TaxYear"`
	IsScheduleFiling bool            `json:"IsScheduleFiling"`
	ScheduleFiling   *ScheduleFiling `json:"ScheduleFiling"`
}

// ScheduleFiling holds the requested e-file date for a scheduled (future-dated) submission.
type ScheduleFiling struct {
	EfileDate *string `json:"EfileDate"`
}

// ReturnHeader wraps the payer Business record attached to a Form 1099 return.
type ReturnHeader struct {
	Business *Business `json:"Business"`
}

// ReturnManifest describes which filing channels (postal, federal, state, distribution) apply to a return.
type ReturnManifest struct {
	IsPostal            bool                 `json:"IsPostal"`
	IsFederal           bool                 `json:"IsFederal"`
	IsState             bool                 `json:"IsState"`
	IsDistribution      bool                 `json:"IsDistribution"`
	DistributionDetails *DistributionDetails `json:"DistributionDetails"`
	IsForced            bool                 `json:"IsForced"`
}

// DistributionDetails specifies how a recipient copy should be distributed, such as postal mail or online access.
type DistributionDetails struct {
	DistributionType *DistributionType `json:"DistributionType"`
	PostalType       *PostalType       `json:"PostalType"`
}

// DistributionType identifies how a recipient copy is delivered, per API validation rule C00-000053.
type DistributionType string

const (
	DistributionTypePostalOnly      DistributionType = "POSTAL_ONLY"
	DistributionTypeOnlineAccess    DistributionType = "ONLINE_ACCESS"
	DistributionTypePostalAndOnline DistributionType = "POSTAL_AND_ONLINE"
)

// PostalType identifies the mail class used for a postal distribution, per API validation rule C00-000056.
type PostalType string

const (
	PostalTypeUSPSFirstClass PostalType = "USPS_FIRST_CLASS"
)

// FormValidateFormResponse is shared by the NEC and MISC validateform endpoints.

// FormValidateFormResponse is the response returned by the NEC/MISC validate-form endpoints, listing any validation errors found.
type FormValidateFormResponse struct {
	ErrorRecords []ValidateFormErrorRecord `json:"ErrorRecords"`
	Errors       []ErrorV3                 `json:"Errors"`
}

// ValidateFormErrorRecord lists the validation errors found for a single record during form validation.
type ValidateFormErrorRecord struct {
	SequenceId *string   `json:"SequenceId"`
	RecordId   *string   `json:"RecordId"`
	Errors     []ErrorV3 `json:"Errors"`
}
