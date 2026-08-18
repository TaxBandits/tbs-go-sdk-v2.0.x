package service

import (
	"context"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/utils"
)

type BusinessService interface {
	Create(ctx context.Context, request dtos.BusinessesRequest) (*dtos.ProxyResult, error)
	Get(ctx context.Context, query dtos.GetBusinessQuery) (*dtos.ProxyResult, error)
	Update(ctx context.Context, request dtos.BusinessesRequest) (*dtos.ProxyResult, error)
	List(ctx context.Context, query dtos.ListBusinessQuery) (*dtos.ProxyResult, error)
	Remove(ctx context.Context, query dtos.DeleteBusinessQuery) (*dtos.ProxyResult, error)
	Reactivate(ctx context.Context, query dtos.ActivationQuery) (*dtos.ProxyResult, error)
	Deactivate(ctx context.Context, query dtos.ActivationQuery) (*dtos.ProxyResult, error)
	AddDBA(ctx context.Context, request dtos.AddDBARequest) (*dtos.ProxyResult, error)
	UpdateDBA(ctx context.Context, request dtos.AddDBARequest) (*dtos.ProxyResult, error)
	ListDBA(ctx context.Context, query dtos.ListDBAQuery) (*dtos.ProxyResult, error)
	DeleteDBA(ctx context.Context, query dtos.DeleteDBAQuery) (*dtos.ProxyResult, error)
}

type businessService struct {
	authService AuthService
	client      *http.Client
	baseURL     string
}

func NewBusinessService(authService AuthService, client *http.Client, cfg config.APIConfig) BusinessService {
	if client == nil {
		client = &http.Client{Timeout: defaultHTTPTimeout}
	}
	return &businessService{
		authService: authService,
		client:      client,
		baseURL:     strings.TrimRight(cfg.URL, "/"),
	}
}

func (s *businessService) Create(ctx context.Context, request dtos.BusinessesRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.BusinessCreateEndpoint, nil, utils.MapBusinessRequest(request))
}

func (s *businessService) Get(ctx context.Context, query dtos.GetBusinessQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "BusinessId", query.BusinessID)
	addIfNotEmpty(params, "TINType", query.TinType)
	addIfNotEmpty(params, "TIN", query.TIN)
	addIfNotEmpty(params, "PayerRef", query.PayerRef)

	return s.proxy(ctx, http.MethodGet, utils.BusinessGetEndpoint, params, nil)
}

func (s *businessService) Update(ctx context.Context, request dtos.BusinessesRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPut, utils.BusinessUpdateEndpoint, nil, utils.MapBusinessRequest(request))
}

func (s *businessService) List(ctx context.Context, query dtos.ListBusinessQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "Last4Digit", query.Last4Digit)
	addIfNotEmpty(params, "PayerName", query.PayerName)
	addIfNotEmpty(params, "FromDate", query.FromDate)
	addIfNotEmpty(params, "ToDate", query.ToDate)
	params.Set("Page", strconv.Itoa(query.Page))
	params.Set("PageSize", strconv.Itoa(query.PageSize))
	if query.IsActive != nil {
		if *query.IsActive {
			params.Set("IsActive", "1")
		} else {
			params.Set("IsActive", "0")
		}
	}

	return s.proxy(ctx, http.MethodGet, utils.BusinessListEndpoint, params, nil)
}

func (s *businessService) Remove(ctx context.Context, query dtos.DeleteBusinessQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "BusinessIds", query.BusinessIDs)
	addIfNotEmpty(params, "PayerRefs", query.PayerRefs)
	if query.IsForceDelete != nil && *query.IsForceDelete {
		params.Set("IsForceDelete", "1")
	}

	return s.proxy(ctx, http.MethodDelete, utils.BusinessDeleteEndpoint, params, nil)
}

func (s *businessService) Reactivate(ctx context.Context, query dtos.ActivationQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "BusinessIds", query.BusinessIDs)
	addIfNotEmpty(params, "PayerRefs", query.PayerRefs)

	return s.proxy(ctx, http.MethodGet, utils.BusinessReactivateEndpoint, params, nil)
}

func (s *businessService) Deactivate(ctx context.Context, query dtos.ActivationQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "BusinessIds", query.BusinessIDs)
	addIfNotEmpty(params, "PayerRefs", query.PayerRefs)

	return s.proxy(ctx, http.MethodGet, utils.BusinessDeactivateEndpoint, params, nil)
}

func (s *businessService) AddDBA(ctx context.Context, request dtos.AddDBARequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.BusinessAddDBAEndpoint, nil, utils.MapAddDBARequest(request))
}

func (s *businessService) UpdateDBA(ctx context.Context, request dtos.AddDBARequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPut, utils.BusinessUpdateDBAEndpoint, nil, utils.MapAddDBARequest(request))
}

func (s *businessService) ListDBA(ctx context.Context, query dtos.ListDBAQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "BusinessId", query.BusinessID)
	addIfNotEmpty(params, "PayerRef", query.PayerRef)
	addIfNotEmpty(params, "Page", query.Page)
	addIfNotEmpty(params, "PageSize", query.PageSize)

	return s.proxy(ctx, http.MethodGet, utils.BusinessListDBAEndpoint, params, nil)
}

func (s *businessService) DeleteDBA(ctx context.Context, query dtos.DeleteDBAQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "BusinessId", query.BusinessID)
	addIfNotEmpty(params, "PayerRef", query.PayerRef)
	addIfNotEmpty(params, "DBAIds", query.DBAIDs)
	addIfNotEmpty(params, "DBARefs", query.DBARefs)

	return s.proxy(ctx, http.MethodDelete, utils.BusinessDeleteDBAEndpoint, params, nil)
}

func (s *businessService) proxy(ctx context.Context, method, endpoint string, params url.Values, payload any) (*dtos.ProxyResult, error) {
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

func addIfNotEmpty(values url.Values, key, value string) {
	if value != "" {
		values.Set(key, value)
	}
}

