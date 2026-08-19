package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/utils"
)

// Form1099NecHandler handles create, get, update, and validation routes
// for Form 1099-NEC under /form1099nec.
type Form1099NecHandler interface {
	Create(c *gin.Context)
	Get(c *gin.Context)
	Update(c *gin.Context)
	ValidateForm(c *gin.Context)
}

type form1099NecHandler struct {
	service service.Form1099NecService
}

// NewForm1099NecHandler builds a Form1099NecHandler backed by the given
// Form1099NecService.
func NewForm1099NecHandler(service service.Form1099NecService) Form1099NecHandler {
	return &form1099NecHandler{service: service}
}

func (h *form1099NecHandler) Create(c *gin.Context) {
	var request dtos.Form1099NecCreateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.Create(c.Request.Context(), request)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099NecHandler) Get(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.GetForm1099NecQuery{
		RecordIds: utils.GetCaseInsensitive(queryValues, "RecordIds"),
	}

	response, err := h.service.Get(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099NecHandler) Update(c *gin.Context) {
	var request dtos.Form1099NecCreateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.Update(c.Request.Context(), request)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099NecHandler) ValidateForm(c *gin.Context) {
	var request dtos.Form1099NecCreateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.ValidateForm(c.Request.Context(), request)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}
