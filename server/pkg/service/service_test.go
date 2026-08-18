package service

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
)

// stubAuth stands in for the OAuth exchange. It records how many tokens were minted and whether the
// caller asked for the unauthorised (escalated) variant, which is what the 401 retry does.
type stubAuth struct {
	calls  int
	escala int
	token  string
	err    error
}

func (s *stubAuth) GetJWT(_ context.Context, _ string, _ []string, isUnauthorised bool) (string, error) {
	s.calls++
	if isUnauthorised {
		s.escala++
		return s.token + "-escalated", s.err
	}
	return s.token, s.err
}

// capture records what the SDK actually put on the wire.
type capture struct {
	method string
	path   string
	query  url.Values
	auth   string
	body   string
}

// newServer returns a server that records the request and replies with status/body. The handler is
// replaced per test rather than parameterised, so a test can change the reply mid-flight.
func newServer(t *testing.T, handler http.HandlerFunc) (*httptest.Server, *capture) {
	t.Helper()
	got := &capture{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		buf := make([]byte, r.ContentLength)
		if r.ContentLength > 0 {
			_, _ = r.Body.Read(buf)
		}
		got.method, got.path, got.query = r.Method, r.URL.Path, r.URL.Query()
		got.auth, got.body = r.Header.Get("Authorization"), string(buf)
		handler(w, r)
	}))
	t.Cleanup(srv.Close)
	return srv, got
}

func ok(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"StatusCode":200}`))
}

// TestServicesPutTheRightRequestOnTheWire is the table that matters most: an endpoint reached with
// the wrong verb, or a query key spelled differently from what the API expects, fails silently. The
// API ignores an unknown filter rather than rejecting it — form1099misc/get returns the WHOLE
// submission when RecordIds is misspelled — so nothing surfaces until the data is wrong.
func TestServicesPutTheRightRequestOnTheWire(t *testing.T) {
	tests := []struct {
		name       string
		call       func(context.Context, *httptest.Server, AuthService) (*dtos.ProxyResult, error)
		wantMethod string
		wantPath   string
		wantQuery  map[string]string
	}{
		{
			name: "business get",
			call: func(ctx context.Context, s *httptest.Server, a AuthService) (*dtos.ProxyResult, error) {
				return NewBusinessService(a, s.Client(), config.APIConfig{URL: s.URL}).
					Get(ctx, dtos.GetBusinessQuery{BusinessID: "B-1", TIN: "123456789"})
			},
			wantMethod: http.MethodGet,
			wantPath:   "/business/get",
			wantQuery:  map[string]string{"BusinessId": "B-1", "TIN": "123456789"},
		},
		{
			name: "business update is PUT, not POST",
			call: func(ctx context.Context, s *httptest.Server, a AuthService) (*dtos.ProxyResult, error) {
				return NewBusinessService(a, s.Client(), config.APIConfig{URL: s.URL}).
					Update(ctx, dtos.BusinessesRequest{})
			},
			wantMethod: http.MethodPut,
			wantPath:   "/business/update",
		},
		{
			name: "recipient get",
			call: func(ctx context.Context, s *httptest.Server, a AuthService) (*dtos.ProxyResult, error) {
				return NewRecipientService(a, s.Client(), config.APIConfig{URL: s.URL}).
					Get(ctx, dtos.GetRecipientQuery{RecipientID: "R-1"})
			},
			wantMethod: http.MethodGet,
			wantPath:   "/recipient/get",
		},
		{
			name: "1099-MISC create",
			call: func(ctx context.Context, s *httptest.Server, a AuthService) (*dtos.ProxyResult, error) {
				return NewForm1099MiscService(a, s.Client(), config.APIConfig{URL: s.URL}).
					Create(ctx, dtos.Form1099MiscCreateRequest{})
			},
			wantMethod: http.MethodPost,
			wantPath:   "/form1099misc/create",
		},
		{
			name: "1099-MISC update is PUT",
			call: func(ctx context.Context, s *httptest.Server, a AuthService) (*dtos.ProxyResult, error) {
				return NewForm1099MiscService(a, s.Client(), config.APIConfig{URL: s.URL}).
					Update(ctx, dtos.Form1099MiscCreateRequest{})
			},
			wantMethod: http.MethodPut,
			wantPath:   "/form1099misc/update",
		},
		{
			name: "1099-NEC validateform",
			call: func(ctx context.Context, s *httptest.Server, a AuthService) (*dtos.ProxyResult, error) {
				return NewForm1099NecService(a, s.Client(), config.APIConfig{URL: s.URL}).
					ValidateForm(ctx, dtos.Form1099NecCreateRequest{})
			},
			wantMethod: http.MethodPost,
			wantPath:   "/form1099nec/validateform",
		},
		{
			name: "utility status carries SubmissionId and RecordIds",
			call: func(ctx context.Context, s *httptest.Server, a AuthService) (*dtos.ProxyResult, error) {
				return NewForm1099UtilityService(a, s.Client(), config.APIConfig{URL: s.URL}).
					Status(ctx, dtos.Form1099UtilityStatusQuery{SubmissionId: "S-1", RecordIds: "R-1,R-2"})
			},
			wantMethod: http.MethodGet,
			wantPath:   "/form1099/status",
			wantQuery:  map[string]string{"SubmissionId": "S-1", "RecordIds": "R-1,R-2"},
		},
		{
			name: "utility delete is DELETE",
			call: func(ctx context.Context, s *httptest.Server, a AuthService) (*dtos.ProxyResult, error) {
				return NewForm1099UtilityService(a, s.Client(), config.APIConfig{URL: s.URL}).
					Delete(ctx, dtos.Delete1099UtilityQuery{SubmissionId: "S-1"})
			},
			wantMethod: http.MethodDelete,
			wantPath:   "/form1099/delete",
			wantQuery:  map[string]string{"SubmissionId": "S-1"},
		},
		{
			name: "utility transmit",
			call: func(ctx context.Context, s *httptest.Server, a AuthService) (*dtos.ProxyResult, error) {
				return NewForm1099UtilityService(a, s.Client(), config.APIConfig{URL: s.URL}).
					Transmit(ctx, dtos.TransmitRequest{})
			},
			wantMethod: http.MethodPost,
			wantPath:   "/form1099/transmit",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			srv, got := newServer(t, ok)
			auth := &stubAuth{token: "tok"}

			if _, err := tc.call(context.Background(), srv, auth); err != nil {
				t.Fatalf("call returned an error: %v", err)
			}
			if got.method != tc.wantMethod {
				t.Errorf("method = %s, want %s", got.method, tc.wantMethod)
			}
			if got.path != tc.wantPath {
				t.Errorf("path = %s, want %s", got.path, tc.wantPath)
			}
			for k, want := range tc.wantQuery {
				if v := got.query.Get(k); v != want {
					t.Errorf("query %q = %q, want %q", k, v, want)
				}
			}
			if got.auth != "tok" {
				t.Errorf("Authorization = %q, want the minted token verbatim (no Bearer prefix)", got.auth)
			}
		})
	}
}

// TestStatusClassification pins which upstream statuses are returned to the caller and which become
// a CriticalAPIError. A 400 carries the provider's per-record findings, so treating it as a failure
// would discard exactly the information the caller needs.
func TestStatusClassification(t *testing.T) {
	tests := []struct {
		status       int
		wantCritical bool
	}{
		{http.StatusOK, false},
		{http.StatusMovedPermanently, false},
		{http.StatusBadRequest, false},
		{http.StatusNotFound, false},
		{http.StatusMultiStatus, false},
		{http.StatusMethodNotAllowed, true},
		{http.StatusInternalServerError, true},
		{http.StatusBadGateway, true},
		{http.StatusServiceUnavailable, true},
	}

	for _, tc := range tests {
		t.Run(http.StatusText(tc.status), func(t *testing.T) {
			srv, _ := newServer(t, func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(tc.status)
				_, _ = w.Write([]byte(`{"Errors":[]}`))
			})
			svc := NewBusinessService(&stubAuth{token: "tok"}, srv.Client(), config.APIConfig{URL: srv.URL})

			result, err := svc.Get(context.Background(), dtos.GetBusinessQuery{BusinessID: "B-1"})

			var critical *dtos.CriticalAPIError
			switch {
			case tc.wantCritical:
				if !errors.As(err, &critical) {
					t.Fatalf("status %d: want CriticalAPIError, got err=%v result=%+v", tc.status, err, result)
				}
				if critical.Status != tc.status {
					t.Errorf("CriticalAPIError.Status = %d, want %d", critical.Status, tc.status)
				}
			default:
				if err != nil {
					t.Fatalf("status %d: unexpected error %v", tc.status, err)
				}
				if result.StatusCode != tc.status {
					t.Errorf("ProxyResult.StatusCode = %d, want %d", result.StatusCode, tc.status)
				}
			}
		})
	}
}

// TestUnauthorizedIsRetriedOnceWithAFreshToken covers the one piece of control flow in the request
// path. It must retry exactly once — a loop here would hammer the OAuth endpoint on a bad credential.
func TestUnauthorizedIsRetriedOnceWithAFreshToken(t *testing.T) {
	var attempts int
	var seen []string
	srv, _ := newServer(t, func(w http.ResponseWriter, r *http.Request) {
		attempts++
		seen = append(seen, r.Header.Get("Authorization"))
		if attempts == 1 {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		ok(w, r)
	})

	auth := &stubAuth{token: "tok"}
	svc := NewBusinessService(auth, srv.Client(), config.APIConfig{URL: srv.URL})

	result, err := svc.Get(context.Background(), dtos.GetBusinessQuery{BusinessID: "B-1"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if attempts != 2 {
		t.Fatalf("attempts = %d, want exactly 2 (one retry)", attempts)
	}
	if auth.escala != 1 {
		t.Errorf("escalated token requests = %d, want 1", auth.escala)
	}
	if seen[0] == seen[1] {
		t.Errorf("the retry reused the rejected token %q — it must mint a fresh one", seen[0])
	}
	if result.StatusCode != http.StatusOK {
		t.Errorf("StatusCode = %d, want 200", result.StatusCode)
	}
}

// TestPersistentUnauthorizedIsReturnedNotRetriedForever guards the other half: if the second attempt
// is also refused, the caller gets the 401 rather than the request path spinning.
func TestPersistentUnauthorizedIsReturnedNotRetriedForever(t *testing.T) {
	var attempts int
	srv, _ := newServer(t, func(w http.ResponseWriter, _ *http.Request) {
		attempts++
		w.WriteHeader(http.StatusUnauthorized)
	})

	svc := NewBusinessService(&stubAuth{token: "tok"}, srv.Client(), config.APIConfig{URL: srv.URL})
	result, err := svc.Get(context.Background(), dtos.GetBusinessQuery{BusinessID: "B-1"})

	if attempts != 2 {
		t.Fatalf("attempts = %d, want 2", attempts)
	}
	if err != nil {
		t.Fatalf("a persistent 401 should be reported to the caller, not raised: %v", err)
	}
	if result.StatusCode != http.StatusUnauthorized {
		t.Errorf("StatusCode = %d, want 401", result.StatusCode)
	}
}

// TestAuthFailureIsNotSwallowed — if no token can be minted, the call must fail before it reaches
// the network rather than being sent unauthenticated.
func TestAuthFailureIsNotSwallowed(t *testing.T) {
	var reached bool
	srv, _ := newServer(t, func(w http.ResponseWriter, r *http.Request) { reached = true; ok(w, r) })

	auth := &stubAuth{token: "", err: errors.New("credentials rejected")}
	svc := NewBusinessService(auth, srv.Client(), config.APIConfig{URL: srv.URL})

	if _, err := svc.Get(context.Background(), dtos.GetBusinessQuery{BusinessID: "B-1"}); err == nil {
		t.Fatal("want the auth error, got nil")
	}
	if reached {
		t.Error("the request was sent even though no token could be minted")
	}
}

// TestNilClientIsDefaulted — every constructor takes *http.Client and used to store nil unchecked,
// which panics on the first request rather than at the call that caused it.
func TestNilClientIsDefaulted(t *testing.T) {
	srv, _ := newServer(t, ok)
	auth := &stubAuth{token: "tok"}

	constructors := map[string]func() (*dtos.ProxyResult, error){
		"business": func() (*dtos.ProxyResult, error) {
			return NewBusinessService(auth, nil, config.APIConfig{URL: srv.URL}).
				Get(context.Background(), dtos.GetBusinessQuery{BusinessID: "B-1"})
		},
		"recipient": func() (*dtos.ProxyResult, error) {
			return NewRecipientService(auth, nil, config.APIConfig{URL: srv.URL}).
				Get(context.Background(), dtos.GetRecipientQuery{RecipientID: "R-1"})
		},
		"form1099misc": func() (*dtos.ProxyResult, error) {
			return NewForm1099MiscService(auth, nil, config.APIConfig{URL: srv.URL}).
				Create(context.Background(), dtos.Form1099MiscCreateRequest{})
		},
		"form1099nec": func() (*dtos.ProxyResult, error) {
			return NewForm1099NecService(auth, nil, config.APIConfig{URL: srv.URL}).
				Create(context.Background(), dtos.Form1099NecCreateRequest{})
		},
		"form1099utility": func() (*dtos.ProxyResult, error) {
			return NewForm1099UtilityService(auth, nil, config.APIConfig{URL: srv.URL}).
				Status(context.Background(), dtos.Form1099UtilityStatusQuery{SubmissionId: "S-1"})
		},
	}

	for name, call := range constructors {
		t.Run(name, func(t *testing.T) {
			defer func() {
				if r := recover(); r != nil {
					t.Fatalf("nil *http.Client panicked instead of being defaulted: %v", r)
				}
			}()
			if _, err := call(); err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
		})
	}
}

// TestTrailingSlashInBaseURLDoesNotDoubleUp — the constructors TrimRight the configured URL, and a
// trailing slash in an env var is the most likely way this is misconfigured.
func TestTrailingSlashInBaseURLDoesNotDoubleUp(t *testing.T) {
	srv, got := newServer(t, ok)

	svc := NewBusinessService(&stubAuth{token: "tok"}, srv.Client(), config.APIConfig{URL: srv.URL + "/"})
	if _, err := svc.Get(context.Background(), dtos.GetBusinessQuery{BusinessID: "B-1"}); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.path != "/business/get" {
		t.Errorf("path = %q, want %q", got.path, "/business/get")
	}
}

// TestEmptyResponseBodyDecodesToAnEmptyObject — a 200 with no body is a legitimate reply for the
// delete endpoints, and decoding it must not fail the call.
func TestEmptyResponseBodyDecodesToAnEmptyObject(t *testing.T) {
	srv, _ := newServer(t, func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })

	svc := NewForm1099UtilityService(&stubAuth{token: "tok"}, srv.Client(), config.APIConfig{URL: srv.URL})
	result, err := svc.Delete(context.Background(), dtos.Delete1099UtilityQuery{SubmissionId: "S-1"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	payload, isObject := result.Payload.(map[string]any)
	if !isObject || len(payload) != 0 {
		t.Errorf("Payload = %#v, want an empty object", result.Payload)
	}
}

// TestRequestBodyIsJSONEncoded — the payload the caller passes must arrive as the JSON body.
func TestRequestBodyIsJSONEncoded(t *testing.T) {
	srv, got := newServer(t, ok)

	svc := NewBusinessService(&stubAuth{token: "tok"}, srv.Client(), config.APIConfig{URL: srv.URL})
	ref := "PAYER-1"
	req := dtos.BusinessesRequest{Businesses: []dtos.Business{{PayerRef: &ref}}}
	if _, err := svc.Create(context.Background(), req); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var sent map[string]any
	if err := json.Unmarshal([]byte(got.body), &sent); err != nil {
		t.Fatalf("body was not JSON: %q (%v)", got.body, err)
	}
	if _, present := sent["Businesses"]; !present {
		t.Errorf("body = %s, want a Businesses array", got.body)
	}
}
