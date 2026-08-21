package httphelper

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
)

func TestCallWithRetryRetriesUnauthorizedRequest(t *testing.T) {
	calls, refreshes := 0, 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		if calls == 1 {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if calls == 2 && r.Header.Get("Authorization") != "refreshed" {
			t.Fatalf("retry token = %q", r.Header.Get("Authorization"))
		}
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	response, err := CallWithRetry(context.Background(), server.Client(), func(context.Context) (string, error) {
		refreshes++
		return "refreshed", nil
	}, server.URL, http.MethodGet, "/", "initial", url.Values{"page": {"1"}}, nil)
	if err != nil || response.StatusCode != http.StatusOK || refreshes != 1 || calls != 2 {
		t.Fatalf("response=%#v err=%v refreshes=%d calls=%d", response, err, refreshes, calls)
	}
}

func TestCallWithRetryReturnsRefreshError(t *testing.T) {
	unauthorized := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
	}))
	defer unauthorized.Close()

	_, err := CallWithRetry(context.Background(), unauthorized.Client(), func(context.Context) (string, error) {
		return "", errors.New("refresh failed")
	}, unauthorized.URL, http.MethodGet, "/", "initial", nil, nil)
	if err == nil {
		t.Fatal("expected refresh failure")
	}
}

func TestCallWithRetryPassesThroughNonCriticalStatuses(t *testing.T) {
	tests := []struct {
		status int
	}{
		{http.StatusOK},
		{http.StatusMovedPermanently},
		{http.StatusBadRequest},
		{http.StatusNotFound},
		{http.StatusMultiStatus},
	}

	for _, tc := range tests {
		t.Run(http.StatusText(tc.status), func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(tc.status)
				_, _ = w.Write([]byte(`{"Errors":[]}`))
			}))
			defer server.Close()

			response, err := CallWithRetry(context.Background(), server.Client(), func(context.Context) (string, error) {
				return "refreshed", nil
			}, server.URL, http.MethodGet, "/", "token", nil, nil)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if response.StatusCode != tc.status {
				t.Errorf("StatusCode = %d, want %d", response.StatusCode, tc.status)
			}
		})
	}
}

func TestCallWithRetryClassifiesCriticalStatuses(t *testing.T) {
	tests := []struct {
		status int
	}{
		{http.StatusMethodNotAllowed},
		{http.StatusInternalServerError},
		{http.StatusBadGateway},
		{http.StatusServiceUnavailable},
	}

	for _, tc := range tests {
		t.Run(http.StatusText(tc.status), func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(tc.status)
				_, _ = w.Write([]byte(`{"Message":"upstream unavailable"}`))
			}))
			defer server.Close()

			_, err := CallWithRetry(context.Background(), server.Client(), func(context.Context) (string, error) {
				return "refreshed", nil
			}, server.URL, http.MethodGet, "/", "token", nil, nil)
			var critical *dtos.CriticalAPIError
			if !errors.As(err, &critical) || critical.Status != tc.status {
				t.Fatalf("error = %T %v; want CriticalAPIError %d", err, err, tc.status)
			}
		})
	}
}

func TestCallWithRetrySendsJSONBodyAndContentType(t *testing.T) {
	var gotBody, gotContentType string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		buf := make([]byte, r.ContentLength)
		_, _ = r.Body.Read(buf)
		gotBody, gotContentType = string(buf), r.Header.Get("Content-Type")
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	_, err := CallWithRetry(context.Background(), server.Client(), func(context.Context) (string, error) {
		return "", nil
	}, server.URL, http.MethodPost, "/", "token", nil, map[string]any{"Name": "value"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(gotBody, `"Name":"value"`) {
		t.Errorf("body = %q, want the JSON-encoded payload", gotBody)
	}
	if gotContentType != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", gotContentType)
	}
}

func TestDecodeResponseBody(t *testing.T) {
	payload, err := DecodeResponseBody(strings.NewReader("plain response"))
	if err != nil || payload != "plain response" {
		t.Fatalf("plain payload = %#v, %v", payload, err)
	}

	payload, err = DecodeResponseBody(strings.NewReader("  "))
	if err != nil || len(payload.(map[string]any)) != 0 {
		t.Fatalf("empty payload = %#v, %v", payload, err)
	}

	payload, err = DecodeResponseBody(strings.NewReader(`{"Message":"ok"}`))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	decoded, ok := payload.(map[string]any)
	if !ok || decoded["Message"] != "ok" {
		t.Errorf("decoded payload = %#v, want {Message: ok}", payload)
	}
}

func TestDefaultClientHasBoundedTimeout(t *testing.T) {
	client := DefaultClient()
	if client.Timeout != DefaultTimeout {
		t.Errorf("DefaultClient().Timeout = %v, want %v", client.Timeout, DefaultTimeout)
	}
}
