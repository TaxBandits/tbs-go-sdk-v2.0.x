package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/utils"
)

// BusinessHandler handles business (payer) CRUD, activation, and DBA
// routes under /business.
type BusinessHandler interface {
	Create(c *gin.Context)
	Get(c *gin.Context)
	Update(c *gin.Context)
	List(c *gin.Context)
	Remove(c *gin.Context)
	Reactivate(c *gin.Context)
	Deactivate(c *gin.Context)
	AddDBA(c *gin.Context)
	UpdateDBA(c *gin.Context)
	ListDBA(c *gin.Context)
	DeleteDBA(c *gin.Context)
}

type businessHandler struct {
	service service.BusinessService
}

// NewBusinessHandler builds a BusinessHandler backed by the given
// BusinessService.
func NewBusinessHandler(service service.BusinessService) BusinessHandler {
	return &businessHandler{service: service}
}

func (h *businessHandler) Create(c *gin.Context) {
	var request dtos.BusinessesRequest
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

func (h *businessHandler) Get(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.GetBusinessQuery{
		BusinessID: utils.GetCaseInsensitive(queryValues, "BusinessId"),
		TinType:    utils.GetCaseInsensitive(queryValues, "TinType"),
		TIN:        utils.GetCaseInsensitive(queryValues, "Tin"),
		PayerRef:   utils.GetCaseInsensitive(queryValues, "PayerRef"),
	}

	response, err := h.service.Get(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *businessHandler) Update(c *gin.Context) {
	var request dtos.BusinessesRequest
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

func (h *businessHandler) List(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.ListBusinessQuery{
		Last4Digit: utils.GetCaseInsensitive(queryValues, "Last4Digit"),
		PayerName:  utils.GetCaseInsensitive(queryValues, "PayerName"),
		FromDate:   utils.GetCaseInsensitive(queryValues, "FromDate"),
		ToDate:     utils.GetCaseInsensitive(queryValues, "ToDate"),
		Page:       utils.GetIntCaseInsensitive(queryValues, "Page", 0),
		PageSize:   utils.GetIntCaseInsensitive(queryValues, "PageSize", 0),
		IsActive:   utils.GetBoolPointerCaseInsensitive(queryValues, "IsActive"),
	}

	response, err := h.service.List(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *businessHandler) Remove(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.DeleteBusinessQuery{
		BusinessIDs:   utils.GetCaseInsensitive(queryValues, "businessids"),
		PayerRefs:     utils.GetCaseInsensitive(queryValues, "payerRefs"),
		IsForceDelete: utils.GetBoolPointerCaseInsensitive(queryValues, "IsForceDelete"),
	}

	response, err := h.service.Remove(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *businessHandler) Reactivate(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.ActivationQuery{
		BusinessIDs: utils.GetCaseInsensitive(queryValues, "BusinessIds"),
		PayerRefs:   utils.GetCaseInsensitive(queryValues, "PayerRefs"),
	}

	response, err := h.service.Reactivate(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *businessHandler) Deactivate(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.ActivationQuery{
		BusinessIDs: utils.GetCaseInsensitive(queryValues, "BusinessIds"),
		PayerRefs:   utils.GetCaseInsensitive(queryValues, "PayerRefs"),
	}

	response, err := h.service.Deactivate(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *businessHandler) AddDBA(c *gin.Context) {
	var request dtos.AddDBARequest
	if err := c.ShouldBindJSON(&request); err != nil {
		WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.AddDBA(c.Request.Context(), request)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *businessHandler) UpdateDBA(c *gin.Context) {
	var request dtos.AddDBARequest
	if err := c.ShouldBindJSON(&request); err != nil {
		WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.UpdateDBA(c.Request.Context(), request)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *businessHandler) ListDBA(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.ListDBAQuery{
		BusinessID: utils.GetCaseInsensitive(queryValues, "BusinessId"),
		PayerRef:   utils.GetCaseInsensitive(queryValues, "PayerRef"),
		Page:       utils.GetCaseInsensitive(queryValues, "Page"),
		PageSize:   utils.GetCaseInsensitive(queryValues, "PageSize"),
	}

	response, err := h.service.ListDBA(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *businessHandler) DeleteDBA(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.DeleteDBAQuery{
		BusinessID: utils.GetCaseInsensitive(queryValues, "BusinessId"),
		PayerRef:   utils.GetCaseInsensitive(queryValues, "PayerRef"),
		DBAIDs:     utils.GetCaseInsensitive(queryValues, "DBAIds"),
		DBARefs:    utils.GetCaseInsensitive(queryValues, "DBARefs"),
	}

	response, err := h.service.DeleteDBA(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}
