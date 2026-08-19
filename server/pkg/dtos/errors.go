package dtos

// CriticalAPIError represents an unrecoverable error returned by the upstream API.
type CriticalAPIError struct {
	Status  int    `json:"status"`
	Data    any    `json:"data"`
	Message string `json:"message"`
}

func (e *CriticalAPIError) Error() string { return e.Message }

// PayloadError wraps a failed request's response payload.
type PayloadError struct{ Payload any }

func (e *PayloadError) Error() string { return "request failed" }
