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

// ListBusinessReq filters a Form 1099 list request by business identifiers and TIN.
type ListBusinessReq struct {
	BusinessId *string `json:"BusinessId,omitempty"`
	PayerRef   *string `json:"PayerRef,omitempty"`
	BusinessNm *string `json:"BusinessNm,omitempty"`
	PayerTIN   *string `json:"PayerTIN,omitempty"`
	TINType    *string `json:"TINType,omitempty"`
}

// ListRecipientReq filters a Form 1099 list request by recipient identifiers and TIN.
type ListRecipientReq struct {
	RecipientId  *string `json:"RecipientId,omitempty"`
	PayeeRef     *string `json:"PayeeRef,omitempty"`
	RecipientNm  *string `json:"RecipientNm,omitempty"`
	RecipientTIN *string `json:"RecipientTIN,omitempty"`
	TINType      *string `json:"TINType,omitempty"`
}

// ListStateReq filters a Form 1099 list request by state code and state filing status.
type ListStateReq struct {
	StateCd []string `json:"StateCd,omitempty"`
	Status  []string `json:"Status,omitempty"`
}

// ListDistributionReq filters a Form 1099 list request by online-access and postal distribution status.
type ListDistributionReq struct {
	OAStatus     []string `json:"OAStatus,omitempty"`
	PostalStatus []string `json:"PostalStatus,omitempty"`
}

// ListEmployeeReq filters a Form 1099 list request by employee identifiers and TIN.
type ListEmployeeReq struct {
	EmployeeId      *string `json:"EmployeeId,omitempty"`
	EmployeeRef     *string `json:"EmployeeRef,omitempty"`
	EmployeeNm      *string `json:"EmployeeNm,omitempty"`
	EmployeeTIN     *string `json:"EmployeeTIN,omitempty"`
	EmployeeTINType *string `json:"EmployeeTINType,omitempty"`
}

// StatusQuery / query DTOs

// Form1099UtilityStatusQuery holds the submission and record identifiers for checking Form 1099 filing status.
type Form1099UtilityStatusQuery struct {
	SubmissionId string
	RecordIds    string
}

// RequestDraftPdfUrlQuery holds the record identifier for requesting a draft PDF URL.
type RequestDraftPdfUrlQuery struct {
	RecordId string
}

// RequestPdfUrlsQuery holds the submission and record identifiers for requesting filed PDF URLs.
type RequestPdfUrlsQuery struct {
	SubmissionId string
	RecordId     string
}

// Delete1099UtilityQuery holds the submission and record identifiers for deleting Form 1099 records.
type Delete1099UtilityQuery struct {
	SubmissionId string
	RecordIds    string
}

// StatusLogQuery holds the record identifier for fetching a Form 1099 record's status log.
type StatusLogQuery struct {
	RecordId string
}

// DraftPdfFileQuery holds the URL of a draft PDF to download.
type DraftPdfFileQuery struct {
	DraftPdfUrl string
}

// TransmitRequest / TransmitResponse family

// TransmitRequest is the request payload for transmitting Form 1099 records to the IRS and states.
type TransmitRequest struct {
	SubmissionId *string  `json:"SubmissionId,omitempty"`
	RecordIds    []string `json:"RecordIds,omitempty"`
}

// TransmitResponse is the response returned after transmitting Form 1099 and W-2 records.
type TransmitResponse struct {
	Form1099Records []TransmitRecord `json:"Form1099Records"`
	FormW2Records   []TransmitRecord `json:"FormW2Records,omitempty"`
	Errors          []ErrorV3        `json:"Errors"`
}

// TransmitRecord holds the transmission status and distribution details for a single filed record.
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

// TransmitStatus holds a status code, name, message, and timestamp for a federal filing status transition.
type TransmitStatus struct {
	Code       *string `json:"Code"`
	Name       *string `json:"Name"`
	Message    *string `json:"Message"`
	Ts         string  `json:"Ts"`
	WebhookRef *string `json:"WebhookRef"`
}

// TransmitStateStatus holds a state filing status code, name, message, and timestamp for a single state.
type TransmitStateStatus struct {
	StateCd    *string `json:"StateCd"`
	Code       *string `json:"Code"`
	Name       *string `json:"Name"`
	Message    *string `json:"Message"`
	Ts         string  `json:"Ts"`
	WebhookRef *string `json:"WebhookRef"`
}

// TransmitDistribution holds the postal and online-access distribution status for a transmitted record.
type TransmitDistribution struct {
	DistributionType   *DistributionType `json:"DistributionType"`
	PostalStatus       *TransmitStatus   `json:"PostalStatus"`
	OnlineAccessStatus *TransmitStatus   `json:"OnlineAccessStatus"`
}

// Delete1099UtilityResponse family

// Delete1099UtilityResponse is the response returned after deleting Form 1099 and W-2 records.
type Delete1099UtilityResponse struct {
	SubmissionId    *string                        `json:"SubmissionId"`
	Form1099Records *Form1099UtilityDeleteResponse `json:"Form1099Records"`
	FormW2Records   *Form1099UtilityDeleteResponse `json:"FormW2Records,omitempty"`
	Errors          []ErrorV3                      `json:"Errors"`
}

// Form1099UtilityDeleteResponse separates the successfully deleted records from those that errored.
type Form1099UtilityDeleteResponse struct {
	SuccessRecords []Form1099UtilityDeleteSuccessRecord `json:"SuccessRecords"`
	ErrorRecords   []ErrorV3                            `json:"ErrorRecords"`
}

// Form1099UtilityDeleteSuccessRecord identifies a record that was deleted successfully, along with its status.
type Form1099UtilityDeleteSuccessRecord struct {
	SequenceId string `json:"SequenceId"`
	FormType   string `json:"FormType"`
	RecordId   string `json:"RecordId"`
	Status     string `json:"Status"`
	StatusTs   string `json:"StatusTs"`
}

// StatusLogResponse family

// StatusLogResponse holds the federal, state, online-access, and postal status history for a filed record.
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

// FederalStatusLog holds a single federal filing status entry with its code, message, and timestamp.
type FederalStatusLog struct {
	Code     *string `json:"Code"`
	Status   *string `json:"Status"`
	Message  *string `json:"Message"`
	StatusTs string  `json:"StatusTs"`
}

// StateStatusLog holds a single state filing status entry with its state code, message, and timestamp.
type StateStatusLog struct {
	StateCd  *string `json:"StateCd"`
	Code     *string `json:"Code"`
	Status   *string `json:"Status"`
	Message  *string `json:"Message"`
	StatusTs string  `json:"StatusTs"`
}

// OnlineAccessStatusLog holds a single online-access distribution status entry for a recipient's email.
type OnlineAccessStatusLog struct {
	Email    *string `json:"Email"`
	Code     *string `json:"Code"`
	Status   *string `json:"Status"`
	Message  *string `json:"Message"`
	StatusTs string  `json:"StatusTs"`
}

// PostalStatusLog holds a single postal distribution status entry with its postal type and timestamp.
type PostalStatusLog struct {
	PostalType *PostalType `json:"PostalType"`
	Code       *string     `json:"Code"`
	Status     *string     `json:"Status"`
	Message    *string     `json:"Message"`
	StatusTs   string      `json:"StatusTs"`
}
