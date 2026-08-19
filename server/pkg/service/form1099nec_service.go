package service

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/helper/http"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/utils"
)

// Form1099NecService proxies create, get, update, and validation
// operations for Form 1099-NEC to the TaxBandits public API.
type Form1099NecService interface {
	Create(ctx context.Context, request dtos.Form1099NecCreateRequest) (*dtos.ProxyResult, error)
	Get(ctx context.Context, query dtos.GetForm1099NecQuery) (*dtos.ProxyResult, error)
	Update(ctx context.Context, request dtos.Form1099NecCreateRequest) (*dtos.ProxyResult, error)
	ValidateForm(ctx context.Context, request dtos.Form1099NecCreateRequest) (*dtos.ProxyResult, error)
}

type form1099NecService struct {
	authService AuthService
	client      *http.Client
	baseURL     string
}

// NewForm1099NecService builds a Form1099NecService that authenticates
// via authService and calls the TaxBandits API described by cfg. A nil
// client defaults to a 30-second-timeout *http.Client.
func NewForm1099NecService(authService AuthService, client *http.Client, cfg config.APIConfig) Form1099NecService {
	if client == nil {
		client = httphelper.DefaultClient()
	}
	return &form1099NecService{
		authService: authService,
		client:      client,
		baseURL:     strings.TrimRight(cfg.URL, "/"),
	}
}

func (s *form1099NecService) Create(ctx context.Context, request dtos.Form1099NecCreateRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.Form1099NecCreateEndpoint, nil, utils.MapJSON(request))
}

func (s *form1099NecService) Get(ctx context.Context, query dtos.GetForm1099NecQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecordIds", query.RecordIds)

	return s.proxy(ctx, http.MethodGet, utils.Form1099NecGetEndpoint, params, nil)
}

func (s *form1099NecService) Update(ctx context.Context, request dtos.Form1099NecCreateRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPut, utils.Form1099NecUpdateEndpoint, nil, utils.MapJSON(request))
}

func (s *form1099NecService) ValidateForm(ctx context.Context, request dtos.Form1099NecCreateRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.Form1099NecValidateFormEndpoint, nil, utils.MapJSON(request))
}

func (s *form1099NecService) proxy(ctx context.Context, method, endpoint string, params url.Values, payload any) (*dtos.ProxyResult, error) {
	token, err := s.authService.GetJWT(ctx, "", nil, false)
	if err != nil {
		return nil, err
	}

	response, err := httphelper.CallWithRetry(ctx, s.client, func(ctx context.Context) (string, error) {
		return s.authService.GetJWT(ctx, "", nil, true)
	}, s.baseURL, method, endpoint, token, params, payload)
	if err != nil {
		return nil, err
	}

	return &dtos.ProxyResult{StatusCode: response.StatusCode, Payload: response.Data}, nil
}
