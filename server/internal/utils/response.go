package utils

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	model "tbs-sdk-go-v2.0.x-server/internal/dtos"
)

func WriteValidationError(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, gin.H{"message": message})
}

func WriteProxyResponse(c *gin.Context, result *model.ProxyResult) {
	c.JSON(result.StatusCode, gin.H{"Response": result.Payload})
}

func WriteInternalError(c *gin.Context, err error) {
	var criticalErr *model.CriticalAPIError
	if errors.As(err, &criticalErr) {
		c.JSON(http.StatusInternalServerError, gin.H{"Response": criticalErr})
		return
	}

	var payloadErr *model.PayloadError
	if errors.As(err, &payloadErr) {
		c.JSON(http.StatusInternalServerError, gin.H{"Response": payloadErr.Payload})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"Response": err.Error()})
}
