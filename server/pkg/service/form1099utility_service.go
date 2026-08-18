package service

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/utils"
)

type Form1099UtilityService interface {
	List(ctx context.Context, request dtos.List1099UtilityRequest) (*dtos.ProxyResult, error)
	Status(ctx context.Context, query dtos.Form1099UtilityStatusQuery) (*dtos.ProxyResult, error)
	RequestDraftPdfUrl(ctx context.Context, query dtos.RequestDraftPdfUrlQuery) (*dtos.ProxyResult, error)
	RequestPdfUrls(ctx context.Context, query dtos.RequestPdfUrlsQuery) (*dtos.ProxyResult, error)
	Delete(ctx context.Context, query dtos.Delete1099UtilityQuery) (*dtos.ProxyResult, error)
	Transmit(ctx context.Context, request dtos.TransmitRequest) (*dtos.ProxyResult, error)
	StatusLog(ctx context.Context, query dtos.StatusLogQuery) (*dtos.ProxyResult, error)
}

type form1099UtilityService struct {
	authService AuthService
	client      *http.Client
	baseURL     string
}

func NewForm1099UtilityService(authService AuthService, client *http.Client, cfg config.APIConfig) Form1099UtilityService {
	if client == nil {
		client = &http.Client{Timeout: defaultHTTPTimeout}
	}
	return &form1099UtilityService{
		authService: authService,
		client:      client,
		baseURL:     strings.TrimRight(cfg.URL, "/"),
	}
}

func (s *form1099UtilityService) List(ctx context.Context, request dtos.List1099UtilityRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.Form1099UtilityListEndpoint, nil, utils.MapJSON(request))
}

func (s *form1099UtilityService) Status(ctx context.Context, query dtos.Form1099UtilityStatusQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "SubmissionId", query.SubmissionId)
	addIfNotEmpty(params, "RecordIds", query.RecordIds)

	return s.proxy(ctx, http.MethodGet, utils.Form1099UtilityStatusEndpoint, params, nil)
}

func (s *form1099UtilityService) RequestDraftPdfUrl(ctx context.Context, query dtos.RequestDraftPdfUrlQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecordId", query.RecordId)

	return s.proxy(ctx, http.MethodGet, utils.Form1099UtilityRequestDraftPdfUrlEndpoint, params, nil)
}

func (s *form1099UtilityService) RequestPdfUrls(ctx context.Context, query dtos.RequestPdfUrlsQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "SubmissionId", query.SubmissionId)
	addIfNotEmpty(params, "RecordId", query.RecordId)

	return s.proxy(ctx, http.MethodGet, utils.Form1099UtilityRequestPdfUrlsEndpoint, params, nil)
}

func (s *form1099UtilityService) Delete(ctx context.Context, query dtos.Delete1099UtilityQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "SubmissionId", query.SubmissionId)
	addIfNotEmpty(params, "RecordIds", query.RecordIds)

	return s.proxy(ctx, http.MethodDelete, utils.Form1099UtilityDeleteEndpoint, params, nil)
}

func (s *form1099UtilityService) Transmit(ctx context.Context, request dtos.TransmitRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.Form1099UtilityTransmitEndpoint, nil, utils.MapJSON(request))
}

func (s *form1099UtilityService) StatusLog(ctx context.Context, query dtos.StatusLogQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecordId", query.RecordId)

	return s.proxy(ctx, http.MethodGet, utils.Form1099UtilityStatusLogEndpoint, params, nil)
}

func (s *form1099UtilityService) proxy(ctx context.Context, method, endpoint string, params url.Values, payload any) (*dtos.ProxyResult, error) {
	token, err := s.authService.GetJWT(ctx, "", nil, false)
	if err != nil {
		return nil, err
	}

	response, err := s.callAPI(ctx, method, endpoint, token, params, payload)
	if err != nil {
		return nil, err
	}

	return &dtos.ProxyResult{StatusCode: response.StatusCode, Payload: response.Data}, nil
}

func (s *form1099UtilityService) callAPI(ctx context.Context, method, endpoint,
	token string,
	query url.Values,
	payload any,
) (*dtos.UpstreamResponse, error) {
	return callAPIWithRetry(ctx, s.client, s.authService, s.baseURL, method, endpoint, token, query, payload)
}
