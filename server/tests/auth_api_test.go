package tests

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	model "github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	. "github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
)

func testOAuthConfig(serverURL string) config.OAuthConfig {
	return config.OAuthConfig{
		URL:          serverURL,
		TokenPath:    "/token",
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		UserToken:    "test-user-token",
		DefaultScope: "FullAccess",
		DefaultForms: []string{"All"},
	}
}

func TestGetJWT_MissingCredentialsReturnsErrorWithoutCallingUpstream(t *testing.T) {
	requests := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests++
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	cfg := config.OAuthConfig{URL: server.URL, TokenPath: "/token"}
	svc := NewAuthService(server.Client(), cfg)

	if _, err := svc.GetJWT(context.Background(), "", nil, false); err == nil {
		t.Fatal("expected an error when OAuth credentials are not configured")
	}
	if requests != 0 {
		t.Fatalf("expected no upstream requests, got %d", requests)
	}
}

func TestGetJWT_FetchesAndCachesToken(t *testing.T) {
	requests := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests++
		_ = json.NewEncoder(w).Encode(map[string]string{"AccessToken": fmt.Sprintf("token-%d", requests)})
	}))
	defer server.Close()

	svc := NewAuthService(server.Client(), testOAuthConfig(server.URL))

	first, err := svc.GetJWT(context.Background(), "", nil, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if first != "token-1" {
		t.Fatalf("expected token-1, got %q", first)
	}
	if requests != 1 {
		t.Fatalf("expected 1 upstream request, got %d", requests)
	}

	second, err := svc.GetJWT(context.Background(), "", nil, false)
	if err != nil {
		t.Fatalf("unexpected error on cached call: %v", err)
	}
	if second != first {
		t.Fatalf("expected cached token %q, got %q", first, second)
	}
	if requests != 1 {
		t.Fatalf("expected cache hit to avoid a new upstream request, got %d requests", requests)
	}
}

func TestGetJWT_DifferentScopeUsesSeparateCacheKey(t *testing.T) {
	requests := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests++
		_ = json.NewEncoder(w).Encode(map[string]string{"AccessToken": fmt.Sprintf("token-%d", requests)})
	}))
	defer server.Close()

	svc := NewAuthService(server.Client(), testOAuthConfig(server.URL))

	if _, err := svc.GetJWT(context.Background(), "FullAccess", []string{"All"}, false); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, err := svc.GetJWT(context.Background(), "ReadOnly", []string{"Business"}, false); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if requests != 2 {
		t.Fatalf("expected a distinct scope/forms pair to bypass the cache and issue a new request, got %d requests", requests)
	}
}

func TestGetJWT_ForcedRefreshFetchesNewToken(t *testing.T) {
	requests := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests++
		_ = json.NewEncoder(w).Encode(map[string]string{"AccessToken": fmt.Sprintf("token-%d", requests)})
	}))
	defer server.Close()

	svc := NewAuthService(server.Client(), testOAuthConfig(server.URL))

	first, err := svc.GetJWT(context.Background(), "", nil, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	second, err := svc.GetJWT(context.Background(), "", nil, true)
	if err != nil {
		t.Fatalf("unexpected error after cache expiry: %v", err)
	}
	if second == first {
		t.Fatal("expected a forced refresh to trigger a fresh token fetch")
	}
	if requests != 2 {
		t.Fatalf("expected 2 upstream requests after forced refresh, got %d", requests)
	}
}

func TestGetJWT_UpstreamErrorReturnsPayloadError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"Message": "invalid client"})
	}))
	defer server.Close()

	svc := NewAuthService(server.Client(), testOAuthConfig(server.URL))

	_, err := svc.GetJWT(context.Background(), "FullAccess", []string{"All"}, false)
	if err == nil {
		t.Fatal("expected an error for a non-2xx OAuth response")
	}
	var payloadErr *model.PayloadError
	if !errors.As(err, &payloadErr) {
		t.Fatalf("expected a *dtos.PayloadError, got %T: %v", err, err)
	}
}

func TestGetJWT_ResponseMissingAccessTokenReturnsError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]string{"Foo": "bar"})
	}))
	defer server.Close()

	svc := NewAuthService(server.Client(), testOAuthConfig(server.URL))

	if _, err := svc.GetJWT(context.Background(), "FullAccess", []string{"All"}, false); err == nil {
		t.Fatal("expected an error when the OAuth response has no AccessToken")
	}
}

func TestGetJWT_IsUnauthorisedSignsFullAccessAllClaims(t *testing.T) {
	const secret = "test-client-secret"

	var gotClaims jwt.MapClaims
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw := r.Header.Get("Authentication")
		parsed, err := jwt.ParseWithClaims(raw, jwt.MapClaims{}, func(*jwt.Token) (any, error) {
			return []byte(secret), nil
		})
		if err != nil {
			t.Errorf("failed to parse signed request JWS: %v", err)
			return
		}
		claims, ok := parsed.Claims.(jwt.MapClaims)
		if !ok {
			t.Error("expected jwt.MapClaims on parsed token")
			return
		}
		gotClaims = claims
		_ = json.NewEncoder(w).Encode(map[string]string{"AccessToken": "token"})
	}))
	defer server.Close()

	svc := NewAuthService(server.Client(), testOAuthConfig(server.URL))

	if _, err := svc.GetJWT(context.Background(), "ReadOnly", []string{"Business"}, true); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if gotClaims["scope"] != "FullAccess" {
		t.Fatalf("expected scope claim %q when isUnauthorised is true, got %v", "FullAccess", gotClaims["scope"])
	}

	categories, ok := gotClaims["categories"].([]any)
	if !ok || len(categories) != 1 || categories[0] != "All" {
		t.Fatalf("expected categories claim [\"All\"] when isUnauthorised is true, got %v", gotClaims["categories"])
	}
}

func TestNewAuthService_NilClientDefaultsToTimeoutClient(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]string{"AccessToken": "token"})
	}))
	defer server.Close()

	svc := NewAuthService(nil, testOAuthConfig(server.URL))
	if token, err := svc.GetJWT(context.Background(), "", nil, false); err != nil || token != "token" {
		t.Fatalf("nil-client service did not use a working default client: token=%q err=%v", token, err)
	}
}
