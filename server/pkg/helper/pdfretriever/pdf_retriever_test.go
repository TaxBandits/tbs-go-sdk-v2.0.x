package pdfretriever

import (
	"context"
	"testing"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
)

func TestFetchRejectsEmptyURL(t *testing.T) {
	if _, err := New(config.S3Config{}).Fetch(context.Background(), ""); err == nil {
		t.Fatal("Fetch with an empty PDF URL must fail before calling AWS")
	}
	if _, err := New(config.S3Config{}).Fetch(context.Background(), "   "); err == nil {
		t.Fatal("Fetch with a whitespace-only PDF URL must fail before calling AWS")
	}
}

func TestContentTypeByExtension(t *testing.T) {
	tests := []struct {
		extension string
		want      string
	}{
		{"pdf", "application/pdf"},
		{"htm", "text/html"},
		{"html", "text/html"},
		{"txt", "text/plain"},
		{"png", "image/png"},
		{"jpg", "image/jpeg"},
		{"jpeg", "image/jpeg"},
		{"exe", "application/octet-stream"},
		{"", "application/octet-stream"},
	}

	for _, tc := range tests {
		t.Run(tc.extension, func(t *testing.T) {
			if got := contentTypeByExtension(tc.extension); got != tc.want {
				t.Errorf("contentTypeByExtension(%q) = %q, want %q", tc.extension, got, tc.want)
			}
		})
	}
}
