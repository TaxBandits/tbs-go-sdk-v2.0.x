// Package config loads server configuration from environment variables
// (via a local .env file, if present) into typed structs.
package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config is the fully-resolved server configuration, grouping settings by
// the subsystem that consumes them.
type Config struct {
	Server    ServerConfig
	OAuth     OAuthConfig
	PublicAPI APIConfig
	S3        S3Config
}

// ServerConfig holds the HTTP server's listen port and timeout settings.
type ServerConfig struct {
	Port               string
	ReadTimeoutSec     int
	WriteTimeoutSec    int
	ShutdownTimeoutSec int
}

// OAuthConfig holds the credentials and endpoint used to obtain TaxBandits
// OAuth 2.0 access tokens.
type OAuthConfig struct {
	URL          string
	TokenPath    string
	ClientID     string
	ClientSecret string
	UserToken    string
	DefaultScope string
	DefaultForms []string
}

// APIConfig holds the base URL of the TaxBandits public API.
type APIConfig struct {
	URL string
}

// S3Config holds the AWS credentials and bucket details used to proxy
// SSE-C encrypted draft PDFs from S3.
type S3Config struct {
	AccessKey  string
	SecretKey  string
	BucketName string
	Base64Key  string
	Region     string
}

// Load reads configuration from environment variables (loading a local
// .env file first, if one exists) and returns the resolved Config.
func Load() Config {
	_ = godotenv.Load(".env")

	return Config{
		Server: ServerConfig{
			Port:               getEnv("SERVER_PORT", ""),
			ReadTimeoutSec:     getEnvAsInt("SERVER_READ_TIMEOUT_SEC", 15),
			WriteTimeoutSec:    getEnvAsInt("SERVER_WRITE_TIMEOUT_SEC", 15),
			ShutdownTimeoutSec: getEnvAsInt("SERVER_SHUTDOWN_TIMEOUT_SEC", 10),
		},
		OAuth: OAuthConfig{
			URL:          getEnv("OAUTH_URL", ""),
			TokenPath:    getEnv("OAUTH_TOKEN_PATH", "/token"),
			ClientID:     getEnv("OAUTH_CLIENT_ID", ""),
			ClientSecret: getEnv("OAUTH_CLIENT_SECRET", ""),
			UserToken:    getEnv("OAUTH_USER_TOKEN", ""),
		},
		PublicAPI: APIConfig{
			URL: getEnv("PUBLIC_API_URL", ""),
		},
		S3: S3Config{
			AccessKey:  getEnv("AWS_ACCESS_KEY", ""),
			SecretKey:  getEnv("AWS_SECRET_KEY", ""),
			BucketName: getEnv("BUCKET_NAME", ""),
			Base64Key:  getEnv("BASE_64_KEY", ""),
			Region:     "us-east-1",
		},
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvAsInt(key string, fallback int) int {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}
