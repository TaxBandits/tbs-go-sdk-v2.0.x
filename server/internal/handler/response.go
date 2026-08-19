package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	model "github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
)

// WriteValidationError writes a 400 response with the given message,
// used when request binding/validation fails before a service is called.
func WriteValidationError(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, gin.H{"message": message})
}

// WriteProxyResponse writes the upstream TaxBandits status code and
// payload straight through to the client.
func WriteProxyResponse(c *gin.Context, result *model.ProxyResult) {
	c.JSON(result.StatusCode, gin.H{"Response": result.Payload})
}

// WriteInternalError writes a 500 response for a service-layer error,
// unwrapping CriticalAPIError/PayloadError to surface the upstream
// payload when available.
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
