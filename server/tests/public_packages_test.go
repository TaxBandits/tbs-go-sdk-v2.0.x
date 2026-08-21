package tests

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
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
