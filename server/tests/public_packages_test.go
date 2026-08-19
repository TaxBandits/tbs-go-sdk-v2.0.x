package tests

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/helper/http"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/helper/pdfretriever"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/utils"
)

type testAuth struct{ token string }

func (a testAuth) GetJWT(context.Context, string, []string, bool) (string, error) {
	return a.token, nil
}

func TestPublicPackagesAreUsableOutsideTheSDK(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/business/get" || r.Header.Get("Authorization") != "token" {
			t.Fatalf("unexpected request: %s %q", r.URL.Path, r.Header.Get("Authorization"))
		}
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	svc := service.NewBusinessService(testAuth{token: "token"}, server.Client(), config.APIConfig{URL: server.URL})
	result, err := svc.Get(context.Background(), dtos.GetBusinessQuery{BusinessID: "B-1"})
	if err != nil || result.StatusCode != http.StatusOK {
		t.Fatalf("Get() = %#v, %v; want 200 result", result, err)
	}

	if got := utils.MapBusinessRequest(dtos.BusinessesRequest{}); got["Businesses"] == nil {
		t.Fatal("MapBusinessRequest must include an empty Businesses array")
	}
	if _, err := pdfretriever.New(config.S3Config{}).Fetch(context.Background(), ""); err == nil {
		t.Fatal("Fetch with an empty PDF URL must fail before calling AWS")
	}
}

func TestHTTPHelperRetriesUnauthorizedRequest(t *testing.T) {
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

	response, err := httphelper.CallWithRetry(context.Background(), server.Client(), func(context.Context) (string, error) {
		refreshes++
		return "refreshed", nil
	}, server.URL, http.MethodGet, "/", "initial", url.Values{"page": {"1"}}, nil)
	if err != nil || response.StatusCode != http.StatusOK || refreshes != 1 || calls != 2 {
		t.Fatalf("response=%#v err=%v refreshes=%d calls=%d", response, err, refreshes, calls)
	}

	unauthorized := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
	}))
	defer unauthorized.Close()
	_, err = httphelper.CallWithRetry(context.Background(), unauthorized.Client(), func(context.Context) (string, error) {
		return "", errors.New("refresh failed")
	}, unauthorized.URL, http.MethodGet, "/", "initial", nil, nil)
	if err == nil {
		t.Fatal("expected refresh failure")
	}
}

func TestHTTPHelperDecodesAndClassifiesResponses(t *testing.T) {
	payload, err := httphelper.DecodeResponseBody(strings.NewReader("plain response"))
	if err != nil || payload != "plain response" {
		t.Fatalf("plain payload = %#v, %v", payload, err)
	}
	payload, err = httphelper.DecodeResponseBody(strings.NewReader("  "))
	if err != nil || len(payload.(map[string]any)) != 0 {
		t.Fatalf("empty payload = %#v, %v", payload, err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte(`{"Message":"upstream unavailable"}`))
	}))
	defer server.Close()
	_, err = httphelper.CallWithRetry(context.Background(), server.Client(), func(context.Context) (string, error) {
		return "refreshed", nil
	}, server.URL, http.MethodGet, "/", "token", nil, nil)
	var critical *dtos.CriticalAPIError
	if !errors.As(err, &critical) || critical.Status != http.StatusBadGateway {
		t.Fatalf("error = %T %v; want CriticalAPIError 502", err, err)
	}
}

func TestPublicResultAndErrorTypes(t *testing.T) {
	result := dtos.ProxyResult{StatusCode: http.StatusBadRequest, Payload: map[string]any{"Message": "invalid input"}}
	if result.StatusCode != http.StatusBadRequest || result.Payload.(map[string]any)["Message"] != "invalid input" {
		t.Fatalf("unexpected result: %#v", result)
	}
	if (&dtos.CriticalAPIError{Message: "upstream failure"}).Error() != "upstream failure" {
		t.Fatal("CriticalAPIError.Error must expose its message")
	}
	if (&dtos.PayloadError{}).Error() != "request failed" {
		t.Fatal("PayloadError.Error must be stable")
	}
}
