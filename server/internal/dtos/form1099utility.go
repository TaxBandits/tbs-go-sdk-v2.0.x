package dtos

// ErrorV3 matches .NET Models.Base.Error {Id, Name, Message}
type ErrorV3 struct {
	Id      string `json:"Id"`
	Name    string `json:"Name"`
	Message string `json:"Message"`
}

// List1099UtilityRequest is the request body for /form1099utility/list.
type List1099UtilityRequest struct {
	TaxYear       *string              `json:"TaxYear,omitempty"`
	FormTypes     *[]string            `json:"FormTypes,omitempty"`
	Business      *ListBusinessReq     `json:"Business,omitempty"`
	Recipient     *ListRecipientReq    `json:"Recipient,omitempty"`
	SubmissionId  *string              `json:"SubmissionId,omitempty"`
	FederalStatus []string             `json:"FederalStatus,omitempty"`
	State         *ListStateReq        `json:"State,omitempty"`
	Distribution  *ListDistributionReq `json:"Distribution,omitempty"`
	FromDate      *string              `json:"FromDate,omitempty"`
	ToDate        *string              `json:"ToDate,omitempty"`
	Page          *int                 `json:"Page,omitempty"`
	PageSize      *int                 `json:"PageSize,omitempty"`
	Employee      *ListEmployeeReq     `json:"Employee,omitempty"`
}

type ListBusinessReq struct {
	BusinessId *string `json:"BusinessId,omitempty"`
	PayerRef   *string `json:"PayerRef,omitempty"`
	BusinessNm *string `json:"BusinessNm,omitempty"`
	PayerTIN   *string `json:"PayerTIN,omitempty"`
	TINType    *string `json:"TINType,omitempty"`
}

type ListRecipientReq struct {
	RecipientId  *string `json:"RecipientId,omitempty"`
	PayeeRef     *string `json:"PayeeRef,omitempty"`
	RecipientNm  *string `json:"RecipientNm,omitempty"`
	RecipientTIN *string `json:"RecipientTIN,omitempty"`
	TINType      *string `json:"TINType,omitempty"`
}

type ListStateReq struct {
	StateCd []string `json:"StateCd,omitempty"`
	Status  []string `json:"Status,omitempty"`
}

type ListDistributionReq struct {
	OAStatus     []string `json:"OAStatus,omitempty"`
	PostalStatus []string `json:"PostalStatus,omitempty"`
}

type ListEmployeeReq struct {
	EmployeeId      *string `json:"EmployeeId,omitempty"`
	EmployeeRef     *string `json:"EmployeeRef,omitempty"`
	EmployeeNm      *string `json:"EmployeeNm,omitempty"`
	EmployeeTIN     *string `json:"EmployeeTIN,omitempty"`
	EmployeeTINType *string `json:"EmployeeTINType,omitempty"`
}

// StatusQuery / query DTOs

type Form1099UtilityStatusQuery struct {
	SubmissionId string
	RecordIds    string
}

type RequestDraftPdfUrlQuery struct {
	RecordId string
}

type RequestPdfUrlsQuery struct {
	SubmissionId string
	RecordId     string
}

type Delete1099UtilityQuery struct {
	SubmissionId string
	RecordIds    string
}

type StatusLogQuery struct {
	RecordId string
}

type DraftPdfFileQuery struct {
	DraftPdfUrl string
}

// TransmitRequest / TransmitResponse family

type TransmitRequest struct {
	SubmissionId *string  `json:"SubmissionId,omitempty"`
	RecordIds    []string `json:"RecordIds,omitempty"`
}

type TransmitResponse struct {
	Form1099Records []TransmitRecord `json:"Form1099Records"`
	FormW2Records   []TransmitRecord `json:"FormW2Records,omitempty"`
	Errors          []ErrorV3        `json:"Errors"`
}

type TransmitRecord struct {
	FormType      *string               `json:"FormType"`
	BusinessId    *string               `json:"BusinessId"`
	SubmissionId  *string               `json:"SubmissionId"`
	RecordId      *string               `json:"RecordId"`
	FederalStatus *TransmitStatus       `json:"FederalStatus"`
	StatesStatus  []TransmitStateStatus `json:"StatesStatus"`
	Distribution  *TransmitDistribution `json:"Distribution"`
	Errors        []ErrorV3             `json:"Errors"`
}

type TransmitStatus struct {
	Code       *string `json:"Code"`
	Name       *string `json:"Name"`
	Message    *string `json:"Message"`
	Ts         string  `json:"Ts"`
	WebhookRef *string `json:"WebhookRef"`
}

type TransmitStateStatus struct {
	StateCd    *string `json:"StateCd"`
	Code       *string `json:"Code"`
	Name       *string `json:"Name"`
	Message    *string `json:"Message"`
	Ts         string  `json:"Ts"`
	WebhookRef *string `json:"WebhookRef"`
}

type TransmitDistribution struct {
	DistributionType   *string         `json:"DistributionType"`
	PostalStatus       *TransmitStatus `json:"PostalStatus"`
	OnlineAccessStatus *TransmitStatus `json:"OnlineAccessStatus"`
}

// Delete1099UtilityResponse family

type Delete1099UtilityResponse struct {
	SubmissionId    *string                   `json:"SubmissionId"`
	Form1099Records *Form1099UtilityDeleteResponse `json:"Form1099Records"`
	FormW2Records   *Form1099UtilityDeleteResponse `json:"FormW2Records,omitempty"`
	Errors          []ErrorV3                 `json:"Errors"`
}

type Form1099UtilityDeleteResponse struct {
	SuccessRecords []Form1099UtilityDeleteSuccessRecord `json:"SuccessRecords"`
	ErrorRecords   []ErrorV3                       `json:"ErrorRecords"`
}

type Form1099UtilityDeleteSuccessRecord struct {
	SequenceId string `json:"SequenceId"`
	FormType   string `json:"FormType"`
	RecordId   string `json:"RecordId"`
	Status     string `json:"Status"`
	StatusTs   string `json:"StatusTs"`
}

// StatusLogResponse family

type StatusLogResponse struct {
	SubmissionId          *string                 `json:"SubmissionId"`
	RecordId              *string                 `json:"RecordId"`
	FormType              *string                 `json:"FormType"`
	FederalStatusLog      []FederalStatusLog      `json:"FederalStatusLog"`
	StateStatusLog        []StateStatusLog        `json:"StateStatusLog"`
	OnlineAccessStatusLog []OnlineAccessStatusLog `json:"OnlineAccessStatusLog"`
	PostalStatusLog       []PostalStatusLog       `json:"PostalStatusLog"`
	Errors                []ErrorV3               `json:"Errors"`
}

type FederalStatusLog struct {
	Code     *string `json:"Code"`
	Status   *string `json:"Status"`
	Message  *string `json:"Message"`
	StatusTs string  `json:"StatusTs"`
}

type StateStatusLog struct {
	StateCd  *string `json:"StateCd"`
	Code     *string `json:"Code"`
	Status   *string `json:"Status"`
	Message  *string `json:"Message"`
	StatusTs string  `json:"StatusTs"`
}

type OnlineAccessStatusLog struct {
	Email    *string `json:"Email"`
	Code     *string `json:"Code"`
	Status   *string `json:"Status"`
	Message  *string `json:"Message"`
	StatusTs string  `json:"StatusTs"`
}

type PostalStatusLog struct {
	PostalType *string `json:"PostalType"`
	Code       *string `json:"Code"`
	Status     *string `json:"Status"`
	Message    *string `json:"Message"`
	StatusTs   string  `json:"StatusTs"`
}
