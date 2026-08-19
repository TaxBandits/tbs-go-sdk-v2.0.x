// Package pdfretriever fetches PDF files directly from S3 using SSE-C.
package pdfretriever

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"path"
	"strings"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// File is the result of fetching a PDF file directly from S3 using SSE-C.
type File struct {
	Bytes       []byte
	ContentType string
	FileName    string
}

// Retriever fetches PDF files from S3 using SSE-C.
type Retriever interface {
	Fetch(ctx context.Context, pdfURL string) (*File, error)
}

type pdfRetriever struct {
	cfg    config.S3Config
	client *s3.Client
}

// New builds a Retriever using the S3 credentials and bucket described by cfg.
func New(cfg config.S3Config) Retriever {
	awsCfg, _ := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithRegion(cfg.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKey, cfg.SecretKey, "")),
	)

	return &pdfRetriever{
		cfg:    cfg,
		client: s3.NewFromConfig(awsCfg),
	}
}

func (s *pdfRetriever) Fetch(ctx context.Context, pdfURL string) (*File, error) {
	if strings.TrimSpace(pdfURL) == "" {
		return nil, fmt.Errorf("pdf URL is required")
	}

	key := pdfURL
	if parsed, err := url.Parse(pdfURL); err == nil && parsed.IsAbs() {
		key = strings.TrimPrefix(parsed.Path, "/")
	}

	// The .NET reference (Utility.WebStorageConnection) passes this config value
	// straight through as ServerSideEncryptionCustomerProvidedKey without decoding
	// it first — the AWS SDK there accepts the customer key already base64-encoded.
	// aws-sdk-go-v2's SSECustomerKey field is placed directly into the
	// x-amz-server-side-encryption-customer-key header (already expected to be
	// base64), so it must NOT be decoded to raw bytes here — decoding produced
	// invalid (non-ASCII) header bytes and every request failed before hitting S3.
	sseKey := s.cfg.Base64Key
	sseAlgorithm := "AES256"

	output, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket:               &s.cfg.BucketName,
		Key:                  &key,
		SSECustomerAlgorithm: &sseAlgorithm,
		SSECustomerKey:       &sseKey,
	})
	if err != nil {
		return nil, err
	}
	defer output.Body.Close()

	data, err := io.ReadAll(output.Body)
	if err != nil {
		return nil, err
	}

	fileExtension := ""
	if idx := strings.LastIndex(pdfURL, "."); idx != -1 {
		fileExtension = strings.ToLower(pdfURL[idx+1:])
	}

	return &File{
		Bytes:       data,
		ContentType: contentTypeByExtension(fileExtension),
		FileName:    path.Base(pdfURL),
	}, nil
}

func contentTypeByExtension(extension string) string {
	switch extension {
	case "pdf":
		return "application/pdf"
	case "htm", "html":
		return "text/html"
	case "txt":
		return "text/plain"
	case "png":
		return "image/png"
	case "jpg", "jpeg":
		return "image/jpeg"
	default:
		return "application/octet-stream"
	}
}
