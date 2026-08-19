package dtos

// Form1099NecCreateRequest is the request payload for creating or updating one or more Form 1099-NEC records.
type Form1099NecCreateRequest struct {
	SubmissionManifest *SubmissionManifest `json:"SubmissionManifest"`
	ReturnHeader       *ReturnHeader       `json:"ReturnHeader"`
	ReturnData         []NecReturnData     `json:"ReturnData"`
}

// NecReturnData holds a single Form 1099-NEC return, linking its recipient and form data to the submission.
type NecReturnData struct {
	SequenceId     *string         `json:"SequenceId"`
	ReturnManifest *ReturnManifest `json:"ReturnManifest"`
	RecordId       *string         `json:"RecordId"`
	Recipient      *Recipient      `json:"Recipient"`
	NECFormData    *NecFormData    `json:"NECFormData"`
}

// NecFormData holds the Form 1099-NEC compensation, withholding, and state amounts for a single return.
type NecFormData struct {
	NEC           float64           `json:"NEC"`
	CashTips      float64           `json:"CashTips"`
	TTOC1         *string           `json:"TTOC1"`
	TTOC2         *string           `json:"TTOC2"`
	OvertimeComp  float64           `json:"OvertimeComp"`
	IsDirectSales bool              `json:"IsDirectSales"`
	EPP           float64           `json:"EPP"`
	FedTaxWH      float64           `json:"FedTaxWH"`
	Is2ndTINnot   bool              `json:"Is2ndTINnot"`
	AccountNum    *string           `json:"AccountNum"`
	States        []NecStateDetails `json:"States"`
}

// NecStateDetails holds the state withholding and income details reported on a Form 1099-NEC return.
type NecStateDetails struct {
	StateCd     *string `json:"StateCd"`
	StateIdNum  *string `json:"StateIdNum"`
	StateWH     float64 `json:"StateWH"`
	StateIncome float64 `json:"StateIncome"`
}

// Create/Update response

// Form1099NecCreateResponse is the response returned after creating or updating Form 1099-NEC records.
type Form1099NecCreateResponse struct {
	SubmissionId    *string                    `json:"SubmissionId"`
	ScheduleFiling  *string                    `json:"ScheduleFiling"`
	BusinessId      *string                    `json:"BusinessId"`
	PayerRef        *string                    `json:"PayerRef"`
	DBARef          *string                    `json:"DBARef"`
	DBAId           *string                    `json:"DBAId"`
	Form1099Type    *string                    `json:"Form1099Type"`
	Form1099Records *Form1099NecRecordsWrapper `json:"Form1099Records"`
	Errors          []ErrorV3                  `json:"Errors"`
}

// Form1099NecRecordsWrapper separates the successfully created Form 1099-NEC records from those that errored.
type Form1099NecRecordsWrapper struct {
	SuccessRecords []Form1099NecCreatedRecord     `json:"SuccessRecords"`
	ErrorRecords   []Form1099NecCreateErrorRecord `json:"ErrorRecords"`
}

// Form1099NecCreatedRecord identifies a Form 1099-NEC record that was created successfully.
type Form1099NecCreatedRecord struct {
	SequenceId  *string `json:"SequenceId"`
	RecordId    *string `json:"RecordId"`
	RecipientId *string `json:"RecipientId"`
	PayeeRef    *string `json:"PayeeRef"`
}

// Form1099NecCreateErrorRecord lists the validation errors for a Form 1099-NEC record that failed to be created.
type Form1099NecCreateErrorRecord struct {
	SequenceId *string   `json:"SequenceId"`
	RecordId   *string   `json:"RecordId"`
	Errors     []ErrorV3 `json:"Errors"`
}

// Get response

// GetForm1099NecResponse is the response returned when fetching one or more Form 1099-NEC records.
type GetForm1099NecResponse struct {
	Form1099Records []Form1099NecRecord `json:"Form1099Records"`
	Errors          []ErrorV3           `json:"Errors"`
}

// Form1099NecRecord represents a previously filed Form 1099-NEC submission and its return data.
type Form1099NecRecord struct {
	SubmissionManifest *SubmissionManifest   `json:"SubmissionManifest"`
	ReturnHeader       *ReturnHeader         `json:"ReturnHeader"`
	ReturnData         []NecReturnGetDetails `json:"ReturnData"`
	StateReconData     any                   `json:"StateReconData"`
}

// NecReturnGetDetails holds a single Form 1099-NEC return as returned by the get endpoint.
type NecReturnGetDetails struct {
	SequenceId     *string            `json:"SequenceId"`
	RecordId       *string            `json:"RecordId"`
	ReturnManifest *ReturnManifest    `json:"ReturnManifest"`
	Recipient      *Recipient         `json:"Recipient"`
	NECFormData    *NecFormGetDetails `json:"NECFormData"`
}

// NecFormGetDetails holds the Form 1099-NEC compensation, withholding, and state amounts as returned by the get endpoint.
type NecFormGetDetails struct {
	NEC           *float64          `json:"NEC"`
	CashTips      *float64          `json:"CashTips"`
	TTOC1         *string           `json:"TTOC1"`
	TTOC2         *string           `json:"TTOC2"`
	OvertimeComp  *float64          `json:"OvertimeComp"`
	IsDirectSales bool              `json:"IsDirectSales"`
	EPP           *float64          `json:"EPP"`
	FedTaxWH      *float64          `json:"FedTaxWH"`
	Is2ndTINnot   bool              `json:"Is2ndTINnot"`
	AccountNum    *string           `json:"AccountNum"`
	States        []NecStateDetails `json:"States"`
}

// Get query

// GetForm1099NecQuery holds the record identifiers for fetching Form 1099-NEC records.
type GetForm1099NecQuery struct {
	RecordIds string
}
