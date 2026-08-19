package dtos

// Form1099MiscCreateRequest is the request payload for creating or updating one or more Form 1099-MISC records.
type Form1099MiscCreateRequest struct {
	SubmissionManifest *SubmissionManifest `json:"SubmissionManifest"`
	ReturnHeader       *ReturnHeader       `json:"ReturnHeader"`
	ReturnData         []MiscReturnData    `json:"ReturnData"`
}

// MiscReturnData holds a single Form 1099-MISC return, linking its recipient and form data to the submission.
type MiscReturnData struct {
	SequenceId     *string         `json:"SequenceId"`
	ReturnManifest *ReturnManifest `json:"ReturnManifest"`
	Recipient      *Recipient      `json:"Recipient"`
	RecordId       *string         `json:"RecordId"`
	MISCFormData   *MiscFormData   `json:"MISCFormData"`
}

// MiscFormData holds the Form 1099-MISC income, withholding, and state amounts for a single return.
type MiscFormData struct {
	Rents               float64            `json:"Rents"`
	Royalties           float64            `json:"Royalties"`
	OtherIncome         float64            `json:"OtherIncome"`
	FedIncomeTaxWH      float64            `json:"FedIncomeTaxWH"`
	FishingBoatProceeds float64            `json:"FishingBoatProceeds"`
	MedHealthcarePymts  float64            `json:"MedHealthcarePymts"`
	IsDirectSale        bool               `json:"IsDirectSale"`
	SubstitutePymts     float64            `json:"SubstitutePymts"`
	CropInsurance       float64            `json:"CropInsurance"`
	GrossProceeds       float64            `json:"GrossProceeds"`
	FishPurForResale    float64            `json:"FishPurForResale"`
	Sec409ADeferrals    float64            `json:"Sec409ADeferrals"`
	CashTips            float64            `json:"CashTips"`
	TTOC1               *string            `json:"TTOC1"`
	TTOC2               *string            `json:"TTOC2"`
	OvertimeComp        float64            `json:"OvertimeComp"`
	IsFATCA             bool               `json:"IsFATCA"`
	EPP                 float64            `json:"EPP"`
	NonQualDefComp      float64            `json:"NonQualDefComp"`
	AccountNum          *string            `json:"AccountNum"`
	Is2ndTINnot         bool               `json:"Is2ndTINnot"`
	States              []MiscStateDetails `json:"States"`
}

// MiscStateDetails holds the state withholding and income details reported on a Form 1099-MISC return.
type MiscStateDetails struct {
	StateCd     *string `json:"StateCd"`
	StateWH     float64 `json:"StateWH"`
	StateIdNum  *string `json:"StateIdNum"`
	StateIncome float64 `json:"StateIncome"`
}

// Create/Update response

// Form1099MiscCreateResponse is the response returned after creating or updating Form 1099-MISC records.
type Form1099MiscCreateResponse struct {
	SubmissionId    *string                     `json:"SubmissionId"`
	ScheduleFiling  *string                     `json:"ScheduleFiling"`
	BusinessId      *string                     `json:"BusinessId"`
	PayerRef        *string                     `json:"PayerRef"`
	DBARef          *string                     `json:"DBARef"`
	DBAId           *string                     `json:"DBAId"`
	Form1099Type    *string                     `json:"Form1099Type"`
	Form1099Records *Form1099MiscRecordsWrapper `json:"Form1099Records"`
	Errors          []ErrorV3                   `json:"Errors"`
}

// Form1099MiscRecordsWrapper separates the successfully created Form 1099-MISC records from those that errored.
type Form1099MiscRecordsWrapper struct {
	SuccessRecords []Form1099MiscCreatedRecord     `json:"SuccessRecords"`
	ErrorRecords   []Form1099MiscCreateErrorRecord `json:"ErrorRecords"`
}

// Form1099MiscCreatedRecord identifies a Form 1099-MISC record that was created successfully.
type Form1099MiscCreatedRecord struct {
	SequenceId  *string `json:"SequenceId"`
	RecordId    *string `json:"RecordId"`
	RecipientId *string `json:"RecipientId"`
	PayeeRef    *string `json:"PayeeRef"`
}

// Form1099MiscCreateErrorRecord lists the validation errors for a Form 1099-MISC record that failed to be created.
type Form1099MiscCreateErrorRecord struct {
	SequenceId *string   `json:"SequenceId"`
	RecordId   *string   `json:"RecordId"`
	Errors     []ErrorV3 `json:"Errors"`
}

// Get response

// GetForm1099MiscResponse is the response returned when fetching one or more Form 1099-MISC records.
type GetForm1099MiscResponse struct {
	Form1099Records []Form1099MiscRecord `json:"Form1099Records"`
	Errors          []ErrorV3            `json:"Errors"`
}

// Form1099MiscRecord represents a previously filed Form 1099-MISC submission and its return data.
type Form1099MiscRecord struct {
	SubmissionManifest *SubmissionManifest    `json:"SubmissionManifest"`
	ReturnHeader       *ReturnHeader          `json:"ReturnHeader"`
	ReturnData         []MiscReturnGetDetails `json:"ReturnData"`
	StateReconData     any                    `json:"StateReconData"`
}

// MiscReturnGetDetails holds a single Form 1099-MISC return as returned by the get endpoint.
type MiscReturnGetDetails struct {
	SequenceId     *string             `json:"SequenceId"`
	RecordId       *string             `json:"RecordId"`
	ReturnManifest *ReturnManifest     `json:"ReturnManifest"`
	Recipient      *Recipient          `json:"Recipient"`
	MISCFormData   *MiscFormGetDetails `json:"MISCFormData"`
}

// MiscFormGetDetails holds the Form 1099-MISC income, withholding, and state amounts as returned by the get endpoint.
type MiscFormGetDetails struct {
	Rents               *float64           `json:"Rents"`
	Royalties           *float64           `json:"Royalties"`
	OtherIncome         *float64           `json:"OtherIncome"`
	FedIncomeTaxWH      *float64           `json:"FedIncomeTaxWH"`
	FishingBoatProceeds *float64           `json:"FishingBoatProceeds"`
	MedHealthcarePymts  *float64           `json:"MedHealthcarePymts"`
	IsDirectSale        bool               `json:"IsDirectSale"`
	SubstitutePymts     *float64           `json:"SubstitutePymts"`
	CropInsurance       *float64           `json:"CropInsurance"`
	GrossProceeds       *float64           `json:"GrossProceeds"`
	FishPurForResale    *float64           `json:"FishPurForResale"`
	Sec409ADeferrals    *float64           `json:"Sec409ADeferrals"`
	CashTips            *float64           `json:"CashTips"`
	TTOC1               *string            `json:"TTOC1"`
	TTOC2               *string            `json:"TTOC2"`
	OvertimeComp        *float64           `json:"OvertimeComp"`
	IsFATCA             bool               `json:"IsFATCA"`
	EPP                 *float64           `json:"EPP"`
	NonQualDefComp      *float64           `json:"NonQualDefComp"`
	AccountNum          *string            `json:"AccountNum"`
	Is2ndTINnot         bool               `json:"Is2ndTINnot"`
	States              []MiscStateDetails `json:"States"`
}

// Get query

// GetForm1099MiscQuery holds the record identifiers for fetching Form 1099-MISC records.
type GetForm1099MiscQuery struct {
	RecordIds string
}
