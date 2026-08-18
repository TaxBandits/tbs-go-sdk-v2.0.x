package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
)

type AuthHandler interface {
	GetJWTToken(c *gin.Context)
}

type authHandler struct {
	service service.AuthService
}

func NewAuthHandler(service service.AuthService) AuthHandler {
	return &authHandler{service: service}
}

func (h *authHandler) GetJWTToken(c *gin.Context) {
	var request dtos.AuthTokenRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		WriteValidationError(c, "scope and forms are required")
		return
	}

	token, err := h.service.GetJWT(c.Request.Context(), request.Scope, request.Forms, false)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"Response": token})
}
