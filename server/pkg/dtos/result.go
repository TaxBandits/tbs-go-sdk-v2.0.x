package dtos

// ProxyResult carries the HTTP status code and payload returned by an upstream request.
type ProxyResult struct {
	StatusCode int
	Payload    any
}

// UpstreamResponse carries the HTTP status code and decoded data returned by an upstream API call.
type UpstreamResponse struct {
	StatusCode int
	Data       any
}
