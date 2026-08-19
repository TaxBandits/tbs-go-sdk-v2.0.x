package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/utils"
)

// Form1099MiscHandler handles create, get, update, and validation routes
// for Form 1099-MISC under /form1099misc.
type Form1099MiscHandler interface {
	Create(c *gin.Context)
	Update(c *gin.Context)
	Get(c *gin.Context)
	ValidateForm(c *gin.Context)
}

type form1099MiscHandler struct {
	service service.Form1099MiscService
}

// NewForm1099MiscHandler builds a Form1099MiscHandler backed by the given
// Form1099MiscService.
func NewForm1099MiscHandler(service service.Form1099MiscService) Form1099MiscHandler {
	return &form1099MiscHandler{service: service}
}

func (h *form1099MiscHandler) Create(c *gin.Context) {
	var request dtos.Form1099MiscCreateRequest
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

func (h *form1099MiscHandler) Update(c *gin.Context) {
	var request dtos.Form1099MiscCreateRequest
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

func (h *form1099MiscHandler) Get(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.GetForm1099MiscQuery{
		RecordIds: utils.GetCaseInsensitive(queryValues, "RecordIds"),
	}

	response, err := h.service.Get(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099MiscHandler) ValidateForm(c *gin.Context) {
	var request dtos.Form1099MiscCreateRequest
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
