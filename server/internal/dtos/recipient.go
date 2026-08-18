package dtos

type RecipientsRequest struct {
	Recipients []Recipient `json:"Recipients,omitempty"`
}

type Recipient struct {
	SequenceID   *string             `json:"SequenceId,omitempty"`
	RecipientID  *string             `json:"RecipientId,omitempty"`
	PayeeRef     *string             `json:"PayeeRef,omitempty"`
	TINDetails   *RecipientTIN       `json:"TINDetails,omitempty"`
	IndividualNm *PersonName         `json:"IndividualNm,omitempty"`
	BusinessNm   *string             `json:"BusinessNm,omitempty"`
	NameCtrl     *string             `json:"NameCtrl,omitempty"`
	DBADetails   *DBADetail          `json:"DBADetails,omitempty"`
	Address      *Address            `json:"Address,omitempty"`
	DOB          *string             `json:"DOB,omitempty"`
	Email        *string             `json:"Email,omitempty"`
	Fax          *string             `json:"Fax,omitempty"`
	Phone        *string             `json:"Phone,omitempty"`
	W9Details    *RecipientW9        `json:"W9Details,omitempty"`
	W8BenDetails *RecipientW8Ben     `json:"W8BenDetails,omitempty"`
	Form1042S    *RecipientForm1042S `json:"Form1042SDetails,omitempty"`
}

type RecipientTIN struct {
	TINType        *string `json:"TINType,omitempty"`
	TIN            *string `json:"TIN,omitempty"`
	Format         *string `json:"Format,omitempty"`
	TINToken       *string `json:"TINToken,omitempty"`
	EncryptedTIN   *string `json:"EncryptedTIN,omitempty"`
	Last4Digit     *string `json:"Last4Digit,omitempty"`
	TINMatchStatus *string `json:"TINMatchStatus,omitempty"`
}

type RecipientW9 struct {
	FedTaxClassification *string `json:"FedTaxClassification,omitempty"`
	ExemptPayeeCd        *string `json:"ExemptPayeeCd,omitempty"`
	FATCACode            *string `json:"FATCACode,omitempty"`
	IsBackupWth          *bool   `json:"IsBackupWth,omitempty"`
}

type RecipientW8Ben struct {
	CitizenOfCountry         *string `json:"CitizenOfCountry,omitempty"`
	FTIN                     *string `json:"FTIN,omitempty"`
	IsFTINNotLegallyRequired *bool   `json:"IsFTINNotLegallyRequired,omitempty"`
}

type RecipientForm1042S struct {
	Ch3Cd   *string `json:"Ch3Cd,omitempty"`
	Ch4Cd   *string `json:"Ch4Cd,omitempty"`
	GIIN    *string `json:"GIIN,omitempty"`
	LOBCode *string `json:"LOBCode,omitempty"`
}

type GetRecipientQuery struct {
	RecipientID string
}

type ListRecipientQuery struct {
	BusinessID string
	PayerRef   string
	Page       string
	PageSize   string
	FromDate   string
	ToDate     string
	IsActive   string
}

type DeleteRecipientQuery struct {
	RecipientID string
}

type RecipientActivationQuery struct {
	RecipientIDs string
}

type AssignRecipientsRequest struct {
	BusinessID       *string               `json:"BusinessId,omitempty"`
	PayerRef         *string               `json:"PayerRef,omitempty"`
	AssignRecipients []RecipientAssignment `json:"AssignRecipients,omitempty"`
}

type UnAssignRecipientsRequest struct {
	BusinessID         *string               `json:"BusinessId,omitempty"`
	PayerRef           *string               `json:"PayerRef,omitempty"`
	UnAssignRecipients []RecipientAssignment `json:"UnAssignRecipients,omitempty"`
}

type RecipientAssignment struct {
	SequenceID  *string `json:"SequenceId,omitempty"`
	RecipientID *string `json:"RecipientId,omitempty"`
	PayeeRef    *string `json:"PayeeRef,omitempty"`
}

type RecipientAddDBARequest struct {
	RecipientID *string              `json:"RecipientId,omitempty"`
	PayeeRef    *string              `json:"PayeeRef,omitempty"`
	DBADetails  []RecipientDBADetail `json:"DBADetails,omitempty"`
}

type RecipientDBADetail struct {
	SequenceID *string  `json:"SequenceId,omitempty"`
	DBANm      *string  `json:"DBANm,omitempty"`
	DBARef     *string  `json:"DBARef,omitempty"`
	DBAID      *string  `json:"DBAId,omitempty"`
	Address    *Address `json:"Address,omitempty"`
}

type ListRecipientDBAQuery struct {
	RecipientID string
	PayeeRef    string
	Page        string
	PageSize    string
}

type DeleteRecipientDBAQuery struct {
	RecipientID    string
	PayeeRef       string
	DBAID          string
	DBARef         string
	IsForcedDelete string
}
