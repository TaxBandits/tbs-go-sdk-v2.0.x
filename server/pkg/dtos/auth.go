package dtos

// AuthTokenRequest is the request payload for obtaining an access token scoped to a set of forms.
type AuthTokenRequest struct {
	Scope string   `json:"scope" binding:"required"`
	Forms []string `json:"forms" binding:"required"`
}
