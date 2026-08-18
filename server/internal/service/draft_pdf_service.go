package service

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"path"
	"strings"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/internal/config"
)

// DraftPdfFile is the result of fetching a draft PDF (or other file) directly
// from S3 using SSE-C, mirroring the .NET Utility.GetForm1099UtilityDraftPdfS3ByFileName
// + Form1099UtilityController.DraftPdfFile logic.
type DraftPdfFile struct {
	Bytes       []byte
	ContentType string
	FileName    string
}

type DraftPdfService interface {
	Fetch(ctx context.Context, draftPdfUrl string) (*DraftPdfFile, error)
}

type draftPdfService struct {
	cfg    config.S3Config
	client *s3.Client
}

func NewDraftPdfService(cfg config.S3Config) DraftPdfService {
	awsCfg, _ := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithRegion(cfg.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKey, cfg.SecretKey, "")),
	)

	return &draftPdfService{
		cfg:    cfg,
		client: s3.NewFromConfig(awsCfg),
	}
}

func (s *draftPdfService) Fetch(ctx context.Context, draftPdfUrl string) (*DraftPdfFile, error) {
	if strings.TrimSpace(draftPdfUrl) == "" {
		return nil, fmt.Errorf("draftPdfUrl is required")
	}

	key := draftPdfUrl
	if parsed, err := url.Parse(draftPdfUrl); err == nil && parsed.IsAbs() {
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
	if idx := strings.LastIndex(draftPdfUrl, "."); idx != -1 {
		fileExtension = strings.ToLower(draftPdfUrl[idx+1:])
	}

	return &DraftPdfFile{
		Bytes:       data,
		ContentType: contentTypeByExtension(fileExtension),
		FileName:    path.Base(draftPdfUrl),
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
