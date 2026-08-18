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

type Form1099MiscService interface {
	Create(ctx context.Context, request dtos.Form1099MiscCreateRequest) (*dtos.ProxyResult, error)
	Update(ctx context.Context, request dtos.Form1099MiscCreateRequest) (*dtos.ProxyResult, error)
	Get(ctx context.Context, query dtos.GetForm1099MiscQuery) (*dtos.ProxyResult, error)
	ValidateForm(ctx context.Context, request dtos.Form1099MiscCreateRequest) (*dtos.ProxyResult, error)
}

type form1099MiscService struct {
	authService AuthService
	client      *http.Client
	baseURL     string
}

func NewForm1099MiscService(authService AuthService, client *http.Client, cfg config.APIConfig) Form1099MiscService {
	return &form1099MiscService{
		authService: authService,
		client:      client,
		baseURL:     strings.TrimRight(cfg.URL, "/"),
	}
}

func (s *form1099MiscService) Create(ctx context.Context, request dtos.Form1099MiscCreateRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.Form1099MiscCreateEndpoint, nil, utils.MapJSON(request))
}

func (s *form1099MiscService) Update(ctx context.Context, request dtos.Form1099MiscCreateRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPut, utils.Form1099MiscUpdateEndpoint, nil, utils.MapJSON(request))
}

func (s *form1099MiscService) Get(ctx context.Context, query dtos.GetForm1099MiscQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecordIds", query.RecordIds)

	result, err := s.proxy(ctx, http.MethodGet, utils.Form1099MiscGetEndpoint, params, nil)
	if err != nil {
		return nil, err
	}

	normalizeMiscFormDataKey(result.Payload)

	return result, nil
}

// normalizeMiscFormDataKey renames the "MiscFormData" key returned by the
// upstream API to "MISCFormData" in place, since the Go proxy relays the
// decoded JSON payload verbatim and the frontend only reads "MISCFormData".
func normalizeMiscFormDataKey(payload any) {
	root, ok := payload.(map[string]any)
	if !ok {
		return
	}
	records, ok := root["Form1099Records"].([]any)
	if !ok {
		return
	}
	for _, record := range records {
		recordMap, ok := record.(map[string]any)
		if !ok {
			continue
		}
		returnData, ok := recordMap["ReturnData"].([]any)
		if !ok {
			continue
		}
		for _, rd := range returnData {
			rdMap, ok := rd.(map[string]any)
			if !ok {
				continue
			}
			if misc, exists := rdMap["MiscFormData"]; exists {
				rdMap["MISCFormData"] = misc
				delete(rdMap, "MiscFormData")
			}
		}
	}
}

func (s *form1099MiscService) ValidateForm(ctx context.Context, request dtos.Form1099MiscCreateRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.Form1099MiscValidateFormEndpoint, nil, utils.MapJSON(request))
}

func (s *form1099MiscService) proxy(ctx context.Context, method, endpoint string, params url.Values, payload any) (*dtos.ProxyResult, error) {
	token, err := s.authService.GetJWT(ctx, "", nil, false)
	if err != nil {
		return nil, err
	}

	response, err := callAPIWithRetry(ctx, s.client, s.authService, s.baseURL, method, endpoint, token, params, payload)
	if err != nil {
		return nil, err
	}

	return &dtos.ProxyResult{StatusCode: response.StatusCode, Payload: response.Data}, nil
}
