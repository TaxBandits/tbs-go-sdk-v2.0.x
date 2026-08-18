package dtos

type ProxyResult struct {
	StatusCode int
	Payload    any
}

type UpstreamResponse struct {
	StatusCode int
	Data       any
}

type CriticalAPIError struct {
	Status  int    `json:"status"`
	Data    any    `json:"data"`
	Message string `json:"message"`
}

func (e *CriticalAPIError) Error() string {
	return e.Message
}

type PayloadError struct {
	Payload any
}

func (e *PayloadError) Error() string {
	return "request failed"
}
