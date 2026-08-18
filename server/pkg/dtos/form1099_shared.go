package dtos

// SubmissionManifest, ReturnHeader and ReturnManifest are shared across the
// Form1099NEC and Form1099MISC request/response contracts.

type SubmissionManifest struct {
	SubmissionId     *string         `json:"SubmissionId"`
	TaxYear          *string         `json:"TaxYear"`
	IsScheduleFiling bool            `json:"IsScheduleFiling"`
	ScheduleFiling   *ScheduleFiling `json:"ScheduleFiling"`
}

type ScheduleFiling struct {
	EfileDate *string `json:"EfileDate"`
}

type ReturnHeader struct {
	Business *Business `json:"Business"`
}

type ReturnManifest struct {
	IsPostal            bool                 `json:"IsPostal"`
	IsFederal           bool                 `json:"IsFederal"`
	IsState             bool                 `json:"IsState"`
	IsDistribution      bool                 `json:"IsDistribution"`
	DistributionDetails *DistributionDetails `json:"DistributionDetails"`
	IsForced            bool                 `json:"IsForced"`
}

type DistributionDetails struct {
	DistributionType *string `json:"DistributionType"`
	PostalType       *string `json:"PostalType"`
}

// FormValidateFormResponse is shared by the NEC and MISC validateform endpoints.

type FormValidateFormResponse struct {
	ErrorRecords []ValidateFormErrorRecord `json:"ErrorRecords"`
	Errors       []ErrorV3                 `json:"Errors"`
}

type ValidateFormErrorRecord struct {
	SequenceId *string   `json:"SequenceId"`
	RecordId   *string   `json:"RecordId"`
	Errors     []ErrorV3 `json:"Errors"`
}
