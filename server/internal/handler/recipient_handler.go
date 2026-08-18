package handler

import (
	"github.com/gin-gonic/gin"
	"tbs-sdk-go-v2.0.x-server/internal/dtos"
	"tbs-sdk-go-v2.0.x-server/internal/service"
	"tbs-sdk-go-v2.0.x-server/internal/utils"
)

type RecipientHandler interface {
	List(c *gin.Context)
	Get(c *gin.Context)
	Create(c *gin.Context)
	Update(c *gin.Context)
	Remove(c *gin.Context)
	Reactivate(c *gin.Context)
	Deactivate(c *gin.Context)
	AssignRecipients(c *gin.Context)
	UnassignRecipients(c *gin.Context)
	AddDBA(c *gin.Context)
	UpdateDBA(c *gin.Context)
	ListDBA(c *gin.Context)
	DeleteDBA(c *gin.Context)
}

type recipientHandler struct {
	service service.RecipientService
}

func NewRecipientHandler(service service.RecipientService) RecipientHandler {
	return &recipientHandler{service: service}
}

func (h *recipientHandler) List(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.ListRecipientQuery{
		BusinessID: utils.GetCaseInsensitive(queryValues, "BusinessId"),
		PayerRef:   utils.GetCaseInsensitive(queryValues, "PayerRef"),
		Page:       utils.GetCaseInsensitive(queryValues, "Page"),
		PageSize:   utils.GetCaseInsensitive(queryValues, "PageSize"),
		FromDate:   utils.GetCaseInsensitive(queryValues, "FromDate"),
		ToDate:     utils.GetCaseInsensitive(queryValues, "ToDate"),
		IsActive:   utils.GetCaseInsensitive(queryValues, "IsActive"),
	}

	response, err := h.service.List(c.Request.Context(), query)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) Get(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.GetRecipientQuery{
		RecipientID: utils.GetCaseInsensitive(queryValues, "RecipientId"),
	}

	response, err := h.service.Get(c.Request.Context(), query)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) Create(c *gin.Context) {
	var request dtos.RecipientsRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.Create(c.Request.Context(), request)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) Update(c *gin.Context) {
	var request dtos.RecipientsRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.Update(c.Request.Context(), request)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) Remove(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.DeleteRecipientQuery{
		RecipientID: utils.GetCaseInsensitive(queryValues, "RecipientId"),
	}

	response, err := h.service.Remove(c.Request.Context(), query)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) Reactivate(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.RecipientActivationQuery{
		RecipientIDs: utils.GetCaseInsensitive(queryValues, "RecipientIds"),
	}

	response, err := h.service.Reactivate(c.Request.Context(), query)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) Deactivate(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.RecipientActivationQuery{
		RecipientIDs: utils.GetCaseInsensitive(queryValues, "RecipientIds"),
	}

	response, err := h.service.Deactivate(c.Request.Context(), query)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) AssignRecipients(c *gin.Context) {
	var request dtos.AssignRecipientsRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.AssignRecipients(c.Request.Context(), request)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) UnassignRecipients(c *gin.Context) {
	var request dtos.UnAssignRecipientsRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.UnassignRecipients(c.Request.Context(), request)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) AddDBA(c *gin.Context) {
	var request dtos.RecipientAddDBARequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.AddDBA(c.Request.Context(), request)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) UpdateDBA(c *gin.Context) {
	var request dtos.RecipientAddDBARequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.UpdateDBA(c.Request.Context(), request)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) ListDBA(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.ListRecipientDBAQuery{
		RecipientID: utils.GetCaseInsensitive(queryValues, "RecipientId"),
		PayeeRef:    utils.GetCaseInsensitive(queryValues, "PayeeRef"),
		Page:        utils.GetCaseInsensitive(queryValues, "Page"),
		PageSize:    utils.GetCaseInsensitive(queryValues, "PageSize"),
	}

	response, err := h.service.ListDBA(c.Request.Context(), query)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}

func (h *recipientHandler) DeleteDBA(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.DeleteRecipientDBAQuery{
		RecipientID:    utils.GetCaseInsensitive(queryValues, "RecipientId"),
		PayeeRef:       utils.GetCaseInsensitive(queryValues, "PayeeRef"),
		DBAID:          utils.GetCaseInsensitive(queryValues, "DBAId"),
		DBARef:         utils.GetCaseInsensitive(queryValues, "DBARef"),
		IsForcedDelete: utils.GetCaseInsensitive(queryValues, "IsForcedDelete"),
	}

	response, err := h.service.DeleteDBA(c.Request.Context(), query)
	if err != nil {
		utils.WriteInternalError(c, err)
		return
	}

	utils.WriteProxyResponse(c, response)
}
