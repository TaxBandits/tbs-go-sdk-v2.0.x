package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/draftpdf"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/utils"
)

type Form1099UtilityHandler interface {
	List(c *gin.Context)
	Status(c *gin.Context)
	RequestDraftPdfUrl(c *gin.Context)
	DraftPdfFile(c *gin.Context)
	RequestPdfUrls(c *gin.Context)
	Delete(c *gin.Context)
	Transmit(c *gin.Context)
	StatusLog(c *gin.Context)
}

type form1099UtilityHandler struct {
	service         service.Form1099UtilityService
	draftPdfService draftpdf.DraftPdfService
}

func NewForm1099UtilityHandler(service service.Form1099UtilityService, draftPdfService draftpdf.DraftPdfService) Form1099UtilityHandler {
	return &form1099UtilityHandler{service: service, draftPdfService: draftPdfService}
}

func (h *form1099UtilityHandler) List(c *gin.Context) {
	var request dtos.List1099UtilityRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.List(c.Request.Context(), request)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099UtilityHandler) Status(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.Form1099UtilityStatusQuery{
		SubmissionId: utils.GetCaseInsensitive(queryValues, "SubmissionId"),
		RecordIds:    utils.GetCaseInsensitive(queryValues, "RecordIds"),
	}

	response, err := h.service.Status(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099UtilityHandler) RequestDraftPdfUrl(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.RequestDraftPdfUrlQuery{
		RecordId: utils.GetCaseInsensitive(queryValues, "RecordId"),
	}

	response, err := h.service.RequestDraftPdfUrl(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099UtilityHandler) DraftPdfFile(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	draftPdfUrl := utils.GetCaseInsensitive(queryValues, "draftPdfUrl")
	if draftPdfUrl == "" {
		c.Status(http.StatusNotFound)
		return
	}

	file, err := h.draftPdfService.Fetch(c.Request.Context(), draftPdfUrl)
	if err != nil {
		log.Printf("draft pdf fetch failed for %q: %v", draftPdfUrl, err)
		c.Status(http.StatusNotFound)
		return
	}
	if file == nil || len(file.Bytes) == 0 {
		c.Status(http.StatusNotFound)
		return
	}

	c.Header("Content-Disposition", "inline; filename="+file.FileName)
	c.Data(http.StatusOK, file.ContentType, file.Bytes)
}

func (h *form1099UtilityHandler) RequestPdfUrls(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.RequestPdfUrlsQuery{
		SubmissionId: utils.GetCaseInsensitive(queryValues, "SubmissionId"),
		RecordId:     utils.GetCaseInsensitive(queryValues, "RecordId"),
	}

	response, err := h.service.RequestPdfUrls(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099UtilityHandler) Delete(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.Delete1099UtilityQuery{
		SubmissionId: utils.GetCaseInsensitive(queryValues, "SubmissionId"),
		RecordIds:    utils.GetCaseInsensitive(queryValues, "RecordIds"),
	}

	response, err := h.service.Delete(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099UtilityHandler) Transmit(c *gin.Context) {
	var request dtos.TransmitRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		WriteValidationError(c, "invalid request body")
		return
	}

	response, err := h.service.Transmit(c.Request.Context(), request)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}

func (h *form1099UtilityHandler) StatusLog(c *gin.Context) {
	queryValues := c.Request.URL.Query()
	query := dtos.StatusLogQuery{
		RecordId: utils.GetCaseInsensitive(queryValues, "RecordId"),
	}

	response, err := h.service.StatusLog(c.Request.Context(), query)
	if err != nil {
		WriteInternalError(c, err)
		return
	}

	WriteProxyResponse(c, response)
}
