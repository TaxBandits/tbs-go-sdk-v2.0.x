package config

import "testing"

func TestLoadReadsEnvironmentVariables(t *testing.T) {
	t.Setenv("SERVER_PORT", "9090")
	t.Setenv("SERVER_READ_TIMEOUT_SEC", "20")
	t.Setenv("OAUTH_URL", "https://oauth.example.com")
	t.Setenv("OAUTH_TOKEN_PATH", "/custom-token")
	t.Setenv("PUBLIC_API_URL", "https://api.example.com")
	t.Setenv("AWS_ACCESS_KEY", "access-key")

	cfg := Load()

	if cfg.Server.Port != "9090" {
		t.Errorf("Server.Port = %q, want %q", cfg.Server.Port, "9090")
	}
	if cfg.Server.ReadTimeoutSec != 20 {
		t.Errorf("Server.ReadTimeoutSec = %d, want 20", cfg.Server.ReadTimeoutSec)
	}
	if cfg.OAuth.URL != "https://oauth.example.com" {
		t.Errorf("OAuth.URL = %q, want %q", cfg.OAuth.URL, "https://oauth.example.com")
	}
	if cfg.OAuth.TokenPath != "/custom-token" {
		t.Errorf("OAuth.TokenPath = %q, want %q", cfg.OAuth.TokenPath, "/custom-token")
	}
	if cfg.PublicAPI.URL != "https://api.example.com" {
		t.Errorf("PublicAPI.URL = %q, want %q", cfg.PublicAPI.URL, "https://api.example.com")
	}
	if cfg.S3.AccessKey != "access-key" {
		t.Errorf("S3.AccessKey = %q, want %q", cfg.S3.AccessKey, "access-key")
	}
	if cfg.S3.Region != "us-east-1" {
		t.Errorf("S3.Region = %q, want the fixed region us-east-1", cfg.S3.Region)
	}
}

func TestLoadFallsBackWhenIntEnvIsEmpty(t *testing.T) {
	t.Setenv("SERVER_READ_TIMEOUT_SEC", "")

	cfg := Load()

	if cfg.Server.ReadTimeoutSec != 15 {
		t.Errorf("Server.ReadTimeoutSec = %d, want fallback 15", cfg.Server.ReadTimeoutSec)
	}
}

func TestGetEnvAsIntFallsBackOnInvalidValue(t *testing.T) {
	t.Setenv("SOME_INT_ENV", "not-a-number")

	if got := getEnvAsInt("SOME_INT_ENV", 42); got != 42 {
		t.Errorf("getEnvAsInt(invalid) = %d, want fallback 42", got)
	}
}

func TestGetEnvFallsBackWhenUnset(t *testing.T) {
	if got := getEnv("DEFINITELY_UNSET_ENV_VAR", "fallback"); got != "fallback" {
		t.Errorf("getEnv(unset) = %q, want %q", got, "fallback")
	}
}
