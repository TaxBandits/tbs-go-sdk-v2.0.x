package dtos

type Form1099NecCreateRequest struct {
	SubmissionManifest *SubmissionManifest `json:"SubmissionManifest"`
	ReturnHeader       *ReturnHeader       `json:"ReturnHeader"`
	ReturnData         []NecReturnData     `json:"ReturnData"`
}

type NecReturnData struct {
	SequenceId     *string         `json:"SequenceId"`
	ReturnManifest *ReturnManifest `json:"ReturnManifest"`
	RecordId       *string         `json:"RecordId"`
	Recipient      *Recipient      `json:"Recipient"`
	NECFormData    *NecFormData    `json:"NECFormData"`
}

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

type NecStateDetails struct {
	StateCd     *string `json:"StateCd"`
	StateIdNum  *string `json:"StateIdNum"`
	StateWH     float64 `json:"StateWH"`
	StateIncome float64 `json:"StateIncome"`
}

// Create/Update response

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

type Form1099NecRecordsWrapper struct {
	SuccessRecords []Form1099NecCreatedRecord     `json:"SuccessRecords"`
	ErrorRecords   []Form1099NecCreateErrorRecord `json:"ErrorRecords"`
}

type Form1099NecCreatedRecord struct {
	SequenceId  *string `json:"SequenceId"`
	RecordId    *string `json:"RecordId"`
	RecipientId *string `json:"RecipientId"`
	PayeeRef    *string `json:"PayeeRef"`
}

type Form1099NecCreateErrorRecord struct {
	SequenceId *string   `json:"SequenceId"`
	RecordId   *string   `json:"RecordId"`
	Errors     []ErrorV3 `json:"Errors"`
}

// Get response

type GetForm1099NecResponse struct {
	Form1099Records []Form1099NecRecord `json:"Form1099Records"`
	Errors          []ErrorV3           `json:"Errors"`
}

type Form1099NecRecord struct {
	SubmissionManifest *SubmissionManifest   `json:"SubmissionManifest"`
	ReturnHeader       *ReturnHeader         `json:"ReturnHeader"`
	ReturnData         []NecReturnGetDetails `json:"ReturnData"`
	StateReconData     any                   `json:"StateReconData"`
}

type NecReturnGetDetails struct {
	SequenceId     *string            `json:"SequenceId"`
	RecordId       *string            `json:"RecordId"`
	ReturnManifest *ReturnManifest    `json:"ReturnManifest"`
	Recipient      *Recipient         `json:"Recipient"`
	NECFormData    *NecFormGetDetails `json:"NECFormData"`
}

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

type GetForm1099NecQuery struct {
	RecordIds string
}
