package service

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/dtos"
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

	response, err := s.callAPI(ctx, method, endpoint, token, params, payload)
	if err != nil {
		return nil, err
	}

	return &dtos.ProxyResult{StatusCode: response.StatusCode, Payload: response.Data}, nil
}

func (s *recipientService) callAPI(ctx context.Context, method, endpoint,
	token string,
	query url.Values,
	payload any,
) (*dtos.UpstreamResponse, error) {

	var bodyBytes []byte
	var err error

	if payload != nil {
		bodyBytes, err = json.Marshal(payload)
		if err != nil {
			return nil, err
		}
	}

	makeRequest := func(authToken string) (*http.Response, error) {
		requestURL, err := url.Parse(s.baseURL + endpoint)
		if err != nil {
			return nil, err
		}

		if query != nil {
			requestURL.RawQuery = query.Encode()
		}

		request, err := http.NewRequestWithContext(
			ctx,
			method,
			requestURL.String(),
			bytes.NewReader(bodyBytes),
		)
		if err != nil {
			return nil, err
		}

		request.Header.Set("Authorization", authToken)
		request.Header.Set("Content-Type", "application/json")

		return s.client.Do(request)
	}

	// First API Call
	response, err := makeRequest(token)
	if err != nil {
		return nil, err
	}

	// Retry once if unauthorized
	if response.StatusCode == http.StatusUnauthorized {
		response.Body.Close()

		newToken, err := s.authService.GetJWT(ctx, "", nil, true)
		if err != nil {
			return nil, err
		}

		response, err = makeRequest(newToken)
		if err != nil {
			return nil, err
		}
	}

	defer response.Body.Close()

	responsePayload, err := decodeResponseBody(response.Body)
	if err != nil {
		return nil, err
	}

	status := response.StatusCode

	if status == http.StatusOK ||
		(status >= 300 && status <= 399) ||
		status == http.StatusBadRequest ||
		status == http.StatusNotFound {
		return &dtos.UpstreamResponse{
			StatusCode: status,
			Data:       responsePayload,
		}, nil
	}

	if status == http.StatusMethodNotAllowed ||
		status == http.StatusInternalServerError ||
		status == http.StatusBadGateway ||
		status == http.StatusServiceUnavailable {
		return nil, &dtos.CriticalAPIError{
			Status:  status,
			Data:    responsePayload,
			Message: "API failed with critical error",
		}
	}

	return &dtos.UpstreamResponse{
		StatusCode: status,
		Data:       responsePayload,
	}, nil
}
