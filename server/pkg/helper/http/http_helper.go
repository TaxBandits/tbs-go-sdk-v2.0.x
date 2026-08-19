// Package httphelper provides the reusable HTTP transport used by SDK services.
package httphelper

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
)

// DecodeResponseBody reads an upstream response body, decoding JSON when possible.
func DecodeResponseBody(body io.Reader) (any, error) {
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

// DefaultTimeout is used when an SDK constructor receives a nil HTTP client.
const DefaultTimeout = 30 * time.Second

// DefaultClient returns a client with the SDK's bounded default timeout.
func DefaultClient() *http.Client {
	return &http.Client{Timeout: DefaultTimeout}
}

// CallWithRetry sends an authenticated JSON request, refreshing the token and
// retrying once if the upstream API returns 401. It decodes JSON responses and
// classifies critical upstream errors consistently for all SDK services.
func CallWithRetry(
	ctx context.Context,
	client *http.Client,
	refreshToken func(context.Context) (string, error),
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

		newToken, err := refreshToken(ctx)
		if err != nil {
			return nil, err
		}

		response, err = makeRequest(newToken)
		if err != nil {
			return nil, err
		}
	}

	defer response.Body.Close()

	responsePayload, err := DecodeResponseBody(response.Body)
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
