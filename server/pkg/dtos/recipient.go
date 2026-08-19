package dtos

// RecipientsRequest is the request payload for creating or updating one or more Recipient records.
type RecipientsRequest struct {
	Recipients []Recipient `json:"Recipients,omitempty"`
}

// Recipient represents a payee entity, including its TIN, name, address, and form-specific tax details.
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

// RecipientTIN holds a recipient's taxpayer identification number, its format, and TIN match status.
type RecipientTIN struct {
	TINType        *string `json:"TINType,omitempty"`
	TIN            *string `json:"TIN,omitempty"`
	Format         *string `json:"Format,omitempty"`
	TINToken       *string `json:"TINToken,omitempty"`
	EncryptedTIN   *string `json:"EncryptedTIN,omitempty"`
	Last4Digit     *string `json:"Last4Digit,omitempty"`
	TINMatchStatus *string `json:"TINMatchStatus,omitempty"`
}

// RecipientW9 holds Form W-9 specific tax classification and backup withholding details for a recipient.
type RecipientW9 struct {
	FedTaxClassification *string `json:"FedTaxClassification,omitempty"`
	ExemptPayeeCd        *string `json:"ExemptPayeeCd,omitempty"`
	FATCACode            *string `json:"FATCACode,omitempty"`
	IsBackupWth          *bool   `json:"IsBackupWth,omitempty"`
}

// RecipientW8Ben holds Form W-8BEN specific foreign taxpayer details for a recipient.
type RecipientW8Ben struct {
	CitizenOfCountry         *string `json:"CitizenOfCountry,omitempty"`
	FTIN                     *string `json:"FTIN,omitempty"`
	IsFTINNotLegallyRequired *bool   `json:"IsFTINNotLegallyRequired,omitempty"`
}

// RecipientForm1042S holds Form 1042-S specific chapter codes and GIIN for a recipient.
type RecipientForm1042S struct {
	Ch3Cd   *string `json:"Ch3Cd,omitempty"`
	Ch4Cd   *string `json:"Ch4Cd,omitempty"`
	GIIN    *string `json:"GIIN,omitempty"`
	LOBCode *string `json:"LOBCode,omitempty"`
}

// GetRecipientQuery holds the identifier for looking up a single recipient.
type GetRecipientQuery struct {
	RecipientID string
}

// ListRecipientQuery holds the filter and pagination parameters for listing recipients.
type ListRecipientQuery struct {
	BusinessID string
	PayerRef   string
	Page       string
	PageSize   string
	FromDate   string
	ToDate     string
	IsActive   string
}

// DeleteRecipientQuery holds the identifier of the recipient to delete.
type DeleteRecipientQuery struct {
	RecipientID string
}

// RecipientActivationQuery holds the identifiers of the recipients to activate or deactivate.
type RecipientActivationQuery struct {
	RecipientIDs string
}

// AssignRecipientsRequest is the request payload for assigning recipients to a business.
type AssignRecipientsRequest struct {
	BusinessID       *string               `json:"BusinessId,omitempty"`
	PayerRef         *string               `json:"PayerRef,omitempty"`
	AssignRecipients []RecipientAssignment `json:"AssignRecipients,omitempty"`
}

// UnAssignRecipientsRequest is the request payload for unassigning recipients from a business.
type UnAssignRecipientsRequest struct {
	BusinessID         *string               `json:"BusinessId,omitempty"`
	PayerRef           *string               `json:"PayerRef,omitempty"`
	UnAssignRecipients []RecipientAssignment `json:"UnAssignRecipients,omitempty"`
}

// RecipientAssignment identifies a recipient to assign or unassign, by sequence, ID, or payee reference.
type RecipientAssignment struct {
	SequenceID  *string `json:"SequenceId,omitempty"`
	RecipientID *string `json:"RecipientId,omitempty"`
	PayeeRef    *string `json:"PayeeRef,omitempty"`
}

// RecipientAddDBARequest is the request payload for adding one or more DBA names to a recipient.
type RecipientAddDBARequest struct {
	RecipientID *string              `json:"RecipientId,omitempty"`
	PayeeRef    *string              `json:"PayeeRef,omitempty"`
	DBADetails  []RecipientDBADetail `json:"DBADetails,omitempty"`
}

// RecipientDBADetail represents a "doing business as" name and address associated with a recipient.
type RecipientDBADetail struct {
	SequenceID *string  `json:"SequenceId,omitempty"`
	DBANm      *string  `json:"DBANm,omitempty"`
	DBARef     *string  `json:"DBARef,omitempty"`
	DBAID      *string  `json:"DBAId,omitempty"`
	Address    *Address `json:"Address,omitempty"`
}

// ListRecipientDBAQuery holds the filter and pagination parameters for listing a recipient's DBA names.
type ListRecipientDBAQuery struct {
	RecipientID string
	PayeeRef    string
	Page        string
	PageSize    string
}

// DeleteRecipientDBAQuery holds the identifiers of the DBA names to delete from a recipient.
type DeleteRecipientDBAQuery struct {
	RecipientID    string
	PayeeRef       string
	DBAID          string
	DBARef         string
	IsForcedDelete string
}
