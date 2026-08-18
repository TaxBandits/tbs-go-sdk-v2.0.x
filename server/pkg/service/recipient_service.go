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

type RecipientService interface {
	List(ctx context.Context, query dtos.ListRecipientQuery) (*dtos.ProxyResult, error)
	Get(ctx context.Context, query dtos.GetRecipientQuery) (*dtos.ProxyResult, error)
	Create(ctx context.Context, request dtos.RecipientsRequest) (*dtos.ProxyResult, error)
	Update(ctx context.Context, request dtos.RecipientsRequest) (*dtos.ProxyResult, error)
	Remove(ctx context.Context, query dtos.DeleteRecipientQuery) (*dtos.ProxyResult, error)
	Reactivate(ctx context.Context, query dtos.RecipientActivationQuery) (*dtos.ProxyResult, error)
	Deactivate(ctx context.Context, query dtos.RecipientActivationQuery) (*dtos.ProxyResult, error)
	AssignRecipients(ctx context.Context, request dtos.AssignRecipientsRequest) (*dtos.ProxyResult, error)
	UnassignRecipients(ctx context.Context, request dtos.UnAssignRecipientsRequest) (*dtos.ProxyResult, error)
	AddDBA(ctx context.Context, request dtos.RecipientAddDBARequest) (*dtos.ProxyResult, error)
	UpdateDBA(ctx context.Context, request dtos.RecipientAddDBARequest) (*dtos.ProxyResult, error)
	ListDBA(ctx context.Context, query dtos.ListRecipientDBAQuery) (*dtos.ProxyResult, error)
	DeleteDBA(ctx context.Context, query dtos.DeleteRecipientDBAQuery) (*dtos.ProxyResult, error)
}

type recipientService struct {
	authService AuthService
	client      *http.Client
	baseURL     string
}

func NewRecipientService(authService AuthService, client *http.Client, cfg config.APIConfig) RecipientService {
	if client == nil {
		client = &http.Client{Timeout: defaultHTTPTimeout}
	}
	return &recipientService{
		authService: authService,
		client:      client,
		baseURL:     strings.TrimRight(cfg.URL, "/"),
	}
}

func (s *recipientService) List(ctx context.Context, query dtos.ListRecipientQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "BusinessId", query.BusinessID)
	addIfNotEmpty(params, "PayerRef", query.PayerRef)
	addIfNotEmpty(params, "Page", query.Page)
	addIfNotEmpty(params, "PageSize", query.PageSize)
	addIfNotEmpty(params, "FromDate", query.FromDate)
	addIfNotEmpty(params, "ToDate", query.ToDate)
	addIfNotEmpty(params, "IsActive", query.IsActive)

	return s.proxy(ctx, http.MethodGet, utils.RecipientListEndpoint, params, nil)
}

func (s *recipientService) Get(ctx context.Context, query dtos.GetRecipientQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecipientId", query.RecipientID)

	return s.proxy(ctx, http.MethodGet, utils.RecipientGetEndpoint, params, nil)
}

func (s *recipientService) Create(ctx context.Context, request dtos.RecipientsRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.RecipientCreateEndpoint, nil, utils.MapRecipientsRequest(request))
}

func (s *recipientService) Update(ctx context.Context, request dtos.RecipientsRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPut, utils.RecipientUpdateEndpoint, nil, utils.MapRecipientsRequest(request))
}

func (s *recipientService) Remove(ctx context.Context, query dtos.DeleteRecipientQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecipientId", query.RecipientID)

	return s.proxy(ctx, http.MethodDelete, utils.RecipientDeleteEndpoint, params, nil)
}

func (s *recipientService) Reactivate(ctx context.Context, query dtos.RecipientActivationQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecipientIds", query.RecipientIDs)

	return s.proxy(ctx, http.MethodGet, utils.RecipientReactivateEndpoint, params, nil)
}

func (s *recipientService) Deactivate(ctx context.Context, query dtos.RecipientActivationQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecipientIds", query.RecipientIDs)

	return s.proxy(ctx, http.MethodGet, utils.RecipientDeactivateEndpoint, params, nil)
}

func (s *recipientService) AssignRecipients(ctx context.Context, request dtos.AssignRecipientsRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.RecipientAssignEndpoint, nil, utils.MapJSON(request))
}

func (s *recipientService) UnassignRecipients(ctx context.Context, request dtos.UnAssignRecipientsRequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.RecipientUnassignEndpoint, nil, utils.MapJSON(request))
}

func (s *recipientService) AddDBA(ctx context.Context, request dtos.RecipientAddDBARequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPost, utils.RecipientAddDBAEndpoint, nil, utils.MapJSON(request))
}

func (s *recipientService) UpdateDBA(ctx context.Context, request dtos.RecipientAddDBARequest) (*dtos.ProxyResult, error) {
	return s.proxy(ctx, http.MethodPut, utils.RecipientUpdateDBAEndpoint, nil, utils.MapJSON(request))
}

func (s *recipientService) ListDBA(ctx context.Context, query dtos.ListRecipientDBAQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecipientId", query.RecipientID)
	addIfNotEmpty(params, "PayeeRef", query.PayeeRef)
	addIfNotEmpty(params, "Page", query.Page)
	addIfNotEmpty(params, "PageSize", query.PageSize)

	return s.proxy(ctx, http.MethodGet, utils.RecipientListDBAEndpoint, params, nil)
}

func (s *recipientService) DeleteDBA(ctx context.Context, query dtos.DeleteRecipientDBAQuery) (*dtos.ProxyResult, error) {
	params := url.Values{}
	addIfNotEmpty(params, "RecipientId", query.RecipientID)
	addIfNotEmpty(params, "PayeeRef", query.PayeeRef)
	addIfNotEmpty(params, "DBAId", query.DBAID)
	addIfNotEmpty(params, "DBARef", query.DBARef)
	addIfNotEmpty(params, "IsForcedDelete", query.IsForcedDelete)

	return s.proxy(ctx, http.MethodDelete, utils.RecipientDeleteDBAEndpoint, params, nil)
}

func (s *recipientService) proxy(ctx context.Context, method, endpoint string, params url.Values, payload any) (*dtos.ProxyResult, error) {
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

