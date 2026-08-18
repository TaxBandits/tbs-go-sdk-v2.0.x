package service

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"time"
	"strings"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
)

func decodeResponseBody(body io.Reader) (any, error) {
	data, err := io.ReadAll(body)
	if err != nil {
		return nil, err
	}

	if len(strings.TrimSpace(string(data))) == 0 {
		return map[string]any{}, nil
	}

	var payload any
	if err := json.Unmarshal(data, &payload); err != nil {
		return string(data), nil
	}

	return payload, nil
}

// defaultHTTPTimeout applies when a caller passes a nil *http.Client. An unset timeout
// waits on a stalled connection indefinitely; 30s matches what main.go already uses.
const defaultHTTPTimeout = 30 * time.Second

// callAPIWithRetry is a shared proxy helper used by newer services
// (Form1099Utility/Form1099NEC/Form1099MISC) so the request/retry-on-401/response
// classification logic isn't duplicated in every new service file. It mirrors
// the callAPI method already implemented individually on businessService and
// recipientService.
func callAPIWithRetry(
	ctx context.Context,
	client *http.Client,
	authService AuthService,
	baseURL, method, endpoint, token string,
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
		requestURL, err := url.Parse(baseURL + endpoint)
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

		return client.Do(request)
	}

	// First API Call
	response, err := makeRequest(token)
	if err != nil {
		return nil, err
	}

	// Retry once if unauthorized
	if response.StatusCode == http.StatusUnauthorized {
		response.Body.Close()

		newToken, err := authService.GetJWT(ctx, "", nil, true)
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
