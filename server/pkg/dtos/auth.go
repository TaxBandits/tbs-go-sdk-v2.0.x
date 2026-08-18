package dtos

type AuthTokenRequest struct {
	Scope string   `json:"scope" binding:"required"`
	Forms []string `json:"forms" binding:"required"`
}
