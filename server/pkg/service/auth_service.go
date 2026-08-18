package service

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	model "github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
)

type AuthService interface {
	GetJWT(ctx context.Context, scope string, forms []string, isUnauthorised bool) (string, error)
}

type cachedToken struct {
	Token  string
	Expiry time.Time
	Scope  string
	Forms  []string
}

type authService struct {
	client     *http.Client
	cfg        config.OAuthConfig
	mu         sync.RWMutex
	tokenCache map[string]cachedToken
	scope      string
	forms      []string
}

func NewAuthService(client *http.Client, cfg config.OAuthConfig) AuthService {
	return &authService{
		client:     client,
		cfg:        cfg,
		tokenCache: make(map[string]cachedToken),
		scope:      cfg.DefaultScope,
		forms:      cfg.DefaultForms,
	}
}

func (s *authService) GetJWT(ctx context.Context, scope string, forms []string, isUnauthorised bool) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Use previous values if request values are empty
	if isUnauthorised {
		scope = "FullAccess"
		value := "All"
		forms = append([]string(nil), value)
	} else {
		if scope == "" {
			scope = s.scope
		}
		if len(forms) == 0 {
			value := s.forms
			forms = append([]string(nil), value...)
		}
	}

	if scope == "" || len(forms) == 0 {
		scope = "FullAccess"
		forms = []string{"All"}
	}

	key := fmt.Sprintf("%s::%s", scope, strings.Join(forms, ","))

	// Return cached token if valid
	if cached, ok := s.tokenCache[key]; ok {
		if time.Now().Before(cached.Expiry) {
			return cached.Token, nil
		}
	}

	// Validate config
	if s.cfg.ClientID == "" || s.cfg.ClientSecret == "" || s.cfg.UserToken == "" {
		return "", errors.New("oauth credentials are not configured")
	}

	// Generate JWS
	jwsToken, err := s.createJWS(scope, forms)
	if err != nil {
		return "", err
	}

	// Request JWT
	token, err := s.requestToken(ctx, jwsToken)
	if err != nil {
		return "", err
	}

	// Save latest scope/forms
	s.scope = scope
	s.forms = append([]string(nil), forms...)

	// Cache token
	s.tokenCache[key] = cachedToken{
		Token:  token,
		Expiry: time.Now().Add(50 * time.Minute),
		Scope:  scope,
		Forms:  append([]string(nil), forms...),
	}

	return token, nil
}
func (s *authService) createJWS(scope string, forms []string) (string, error) {
	claims := jwt.MapClaims{
		"iss":        s.cfg.ClientID,
		"sub":        s.cfg.ClientID,
		"aud":        s.cfg.UserToken,
		"iat":        time.Now().Unix() - 45,
		"scope":      scope,
		"categories": forms,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token.Header["typ"] = "JWT"

	return token.SignedString([]byte(s.cfg.ClientSecret))
}

func (s *authService) requestToken(ctx context.Context, jwsToken string) (string, error) {
	endpoint := strings.TrimRight(s.cfg.URL, "/") + s.cfg.TokenPath
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return "", err
	}

	request.Header.Set("Authentication", jwsToken)

	response, err := s.client.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()

	payload, err := decodeResponseBody(response.Body)
	if err != nil {
		return "", err
	}

	if response.StatusCode < http.StatusOK || response.StatusCode > http.StatusMultipleChoices-1 {
		return "", &model.PayloadError{Payload: payload}
	}

	body, ok := payload.(map[string]any)
	if !ok {
		return "", fmt.Errorf("unexpected oauth response")
	}

	token, _ := body["AccessToken"].(string)
	if token == "" {
		return "", fmt.Errorf("oauth response does not contain AccessToken")
	}

	return token, nil
}
