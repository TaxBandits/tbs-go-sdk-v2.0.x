## Overview

The **TaxBandits Server** is a Go + [Gin](https://github.com/gin-gonic/gin) middleware layer that sits between your client application and the TaxBandits API. It handles:

- 🔐 **OAuth 2.0 Authentication** — Automatic JWS signing, JWT fetching, token caching (50 min TTL), and 401 auto-refresh
- 🚦 **API Routing** — RESTful endpoints for Business, Recipient, 1099-NEC, 1099-MISC, and cross-form utilities
- 🔁 **Request/Response Mapping** — Structured data transformation between client and TaxBandits schemas
- 📁 **AWS S3 SSE-C Proxy** — Direct draft PDF download from S3 using server-side encryption with customer-provided keys
- ⚠️ **Error Handling** — Standardized HTTP status handling (200, 3xx, 400, 404, 405, 5xx)

---

## Use it as a Go module

The packages under `pkg/` are importable, so the services can be used directly without running this
server. `internal/` holds the Gin handlers, router and the S3 draft-PDF proxy — none of which comes
along with the import, so neither Gin nor the AWS SDK ends up in your dependency graph.

```bash
go get github.com/TaxBandits/tbs-go-sdk-v2.0.x/server
```

```go
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
)

func main() {
	httpClient := &http.Client{Timeout: 30 * time.Second}

	// One AuthService is shared by every other service: it signs the JWS, exchanges it for a JWT,
	// and caches the token for 50 minutes. Passing nil for the client is fine — it defaults.
	auth := service.NewAuthService(httpClient, config.OAuthConfig{
		ClientID:     "YOUR_CLIENT_ID",
		ClientSecret: "YOUR_CLIENT_SECRET",
		UserToken:    "YOUR_USER_TOKEN",
		URL:          "https://testoauth.expressauth.net/v2",
		TokenPath:    "/token",
		DefaultScope: "Read_Write",
		DefaultForms: []string{"All"},
	})

	api := config.APIConfig{URL: "https://testapi.taxbandits.com/v2.0.0"}
	misc := service.NewForm1099MiscService(auth, httpClient, api)

	// Validate before creating: validateform accepts the same body as create and returns the
	// provider's findings without creating a submission.
	result, err := misc.ValidateForm(context.Background(), dtos.Form1099MiscCreateRequest{
		// SubmissionManifest, ReturnHeader and ReturnData go here.
	})
	if err != nil {
		log.Fatal(err) // transport failure, or a 405/5xx, which arrives as *dtos.CriticalAPIError
	}

	// A 400 is not an error here — it carries the per-record validation findings.
	fmt.Println(result.StatusCode, result.Payload)
}
```

### What you get back

Every service method returns `*dtos.ProxyResult`:

```go
type ProxyResult struct {
	StatusCode int // the upstream status, verbatim
	Payload    any // the decoded upstream JSON body
}
```

`200`, `3xx`, `400` and `404` are returned as a `ProxyResult` — a `400` carries the per-record
errors, so it is a result and not a failure. `405` and `5xx` are returned as `*dtos.CriticalAPIError`.
A `401` is retried once with a freshly minted token before either applies.

---

## Getting Started

### Prerequisites

- **Go** >= 1.24 (module declares `go 1.26.1`)
- **TaxBandits API Credentials** — Obtain from [TaxBandits Developer Console](https://sandbox.taxbandits.com/):
  - Client ID
  - Client Secret
  - User Token
- **AWS S3 Credentials** (optional, for draft PDF proxy only)
  - Access Key / Secret Key
  - Bucket name
  - Base64 SSE-C encryption key

### 1. Fetch dependencies

```bash
cd server
go mod download
```

### 2. Configure environment

Create a `server/.env` file (no template is checked into the repo) with your TaxBandits and AWS values — see [Environment Variables](#environment-variables) below. It's loaded automatically at startup via [godotenv](https://github.com/joho/godotenv) and is already gitignored.

### 3. Run in development

```bash
go run .
```

The server starts on `http://localhost:$SERVER_PORT` with CORS enabled for all origins. Since there's no hot-reload built in, use a tool like [air](https://github.com/air-verse/air) if you want auto-restart on file changes.

### 4. Build & run in production

```bash
go build -o tbs-server .
./tbs-server
```

For production deployments, put the binary behind a reverse proxy (Nginx, Caddy, ALB) with HTTPS.

---

## Environment Variables

All variables are loaded from `server/.env` via `godotenv` at startup (see [internal/config/config.go](./pkg/config/config.go)).

| Variable                      | Required | Example                                 | Description                                                            |
| ----------------------------- | -------- | --------------------------------------- | ---------------------------------------------------------------------- |
| `SERVER_PORT`                 | ✅       | `8080`                                  | Port the Gin server listens on (no default — required)                 |
| `SERVER_READ_TIMEOUT_SEC`     | ⚠️       | `15`                                    | Read header timeout in seconds (default `15`)                          |
| `SERVER_WRITE_TIMEOUT_SEC`    | ⚠️       | `15`                                    | Write timeout in seconds (default `15`)                                |
| `SERVER_SHUTDOWN_TIMEOUT_SEC` | ⚠️       | `10`                                    | Graceful shutdown timeout in seconds (default `10`)                    |
| `PUBLIC_API_URL`              | ✅       | `https://testapi.taxbandits.com/v2.0.0` | TaxBandits 2.0.0 API base URL                                          |
| `OAUTH_URL`                   | ✅       | `https://testoauth.expressauth.net/v2`  | OAuth 2.0 base URL                                                     |
| `OAUTH_TOKEN_PATH`            | ⚠️       | `/token`                                | Path appended to `OAUTH_URL` for the token endpoint (default `/token`) |
| `OAUTH_CLIENT_ID`             | ✅       | `<your-taxbandits-client-id>`           | Your TaxBandits Client ID                                              |
| `OAUTH_CLIENT_SECRET`         | ✅       | `<your-taxbandits-client-secret>`       | Your TaxBandits Client Secret                                          |
| `OAUTH_USER_TOKEN`            | ✅       | `<your-taxbandits-user-token>`          | Your TaxBandits User Token                                             |
| `AWS_ACCESS_KEY`              | ⚠️       | `<your-aws-access-key>`                 | AWS Access Key (required for draft PDF download proxy)                 |
| `AWS_SECRET_KEY`              | ⚠️       | `<your-aws-secret-key>`                 | AWS Secret Key                                                         |
| `BUCKET_NAME`                 | ⚠️       | `<your-s3-bucket-name>`                 | S3 bucket holding draft PDFs                                           |
| `BASE_64_KEY`                 | ⚠️       | `<your-base64-sse-c-key>`               | Base64 SSE-C customer-provided encryption key                          |

> ⚠️ **Placeholders only** — the `Example` column above is illustrative, not real credentials. Never paste actual secrets into README/docs/commit history; they belong only in your local, gitignored `.env`.

> ℹ️ The AWS region is currently hardcoded to `us-east-1` in `config.go`.

> 🔒 **Security Note**: Never commit `.env` to version control. It is listed in `.gitignore`.

---

## API Routes

All routes are registered in [internal/router/router.go](./internal/router/router.go) and return JSON by default.

### 🔐 Authentication — `/auth/*`

| Method | Route            | Handler                                               | Description                                   |
| ------ | ---------------- | ----------------------------------------------------- | --------------------------------------------- |
| POST   | `/auth/gettoken` | [auth_handler.go](./internal/handler/auth_handler.go) | Manually fetch a fresh OAuth JWT access token |

---

### 🏢 Business (Payer) — `/business/*`

Handler: [business_handler.go](./internal/handler/business_handler.go) · Service: [business_service.go](./pkg/service/business_service.go)

| Method | Route                  | Description                                                                                       |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------- |
| POST   | `/business/create`     | Create new business(es). Returns `BusinessId` for future references.                              |
| GET    | `/business/get`        | Get a business by `?BusinessId=` or `?PayerRef=`                                                  |
| PUT    | `/business/update`     | Update existing business details                                                                  |
| GET    | `/business/list`       | Paginated list. Query params: `Page`, `PageSize`, `FromDate`, `ToDate`, `PayerName`, `Last4Digit` |
| DELETE | `/business/delete`     | Delete business(es) by `?businessids=` (comma-separated)                                          |
| GET    | `/business/deactivate` | Soft-deactivate by `?BusinessIds=`                                                                |
| GET    | `/business/reactivate` | Reactivate deactivated businesses                                                                 |
| POST   | `/business/adddba`     | Add DBA (Doing Business As) name(s)                                                               |
| PUT    | `/business/updatedba`  | Update a DBA's name or address                                                                    |
| GET    | `/business/listdba`    | List DBAs for a business by `?BusinessId=`                                                        |
| DELETE | `/business/deletedba`  | Delete a DBA by `?BusinessId=` + `?DBAIds=`                                                       |

> 📘 Reference: [Business Endpoints in TaxBandits Docs](https://developer.taxbandits.com/docs/2.0.0/Business/Overview)

---

### 👥 Recipient — `/recipient/*`

Handler: [recipient_handler.go](./internal/handler/recipient_handler.go) · Service: [recipient_service.go](./pkg/service/recipient_service.go)

| Method | Route                           | Description                                                                                           |
| ------ | ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GET    | `/recipient/list`               | Paginated list. Query: `BusinessId`, `PayerRef`, `Page`, `PageSize`, `FromDate`, `ToDate`, `IsActive` |
| GET    | `/recipient/get`                | Get single recipient by `?RecipientId=`                                                               |
| POST   | `/recipient/create`             | Create one or more recipients                                                                         |
| PUT    | `/recipient/update`             | Update recipient data                                                                                 |
| DELETE | `/recipient/delete`             | Delete recipient by `?RecipientId=`                                                                   |
| GET    | `/recipient/deactivate`         | Soft-deactivate by `?RecipientIds=`                                                                   |
| GET    | `/recipient/reactivate`         | Reactivate recipient(s)                                                                               |
| POST   | `/recipient/assignrecipients`   | Bulk-assign recipients to a business                                                                  |
| POST   | `/recipient/unassignrecipients` | Unassign recipients from a business                                                                   |
| POST   | `/recipient/adddba`             | Add recipient-level DBA names                                                                         |
| PUT    | `/recipient/updatedba`          | Update recipient DBA                                                                                  |
| GET    | `/recipient/listdba`            | List DBAs for a recipient                                                                             |
| DELETE | `/recipient/deletedba`          | Delete recipient DBA                                                                                  |

---

### 📄 Form 1099-NEC — `/form1099nec/*`

Handler: [form1099nec_handler.go](./internal/handler/form1099nec_handler.go) · Service: [form1099nec_service.go](./pkg/service/form1099nec_service.go)

| Method | Route                       | Description                                                    |
| ------ | --------------------------- | -------------------------------------------------------------- |
| POST   | `/form1099nec/create`       | Create one or more 1099-NEC returns (Nonemployee Compensation) |
| PUT    | `/form1099nec/update`       | Update saved 1099-NEC records before transmission              |
| GET    | `/form1099nec/get`          | Retrieve return data by `?RecordIds=` (comma-separated)        |
| POST   | `/form1099nec/validateform` | Validate form payload **without** saving to TaxBandits         |

---

### 🧾 Form 1099-MISC — `/form1099misc/*`

Handler: [form1099misc_handler.go](./internal/handler/form1099misc_handler.go) · Service: [form1099misc_service.go](./pkg/service/form1099misc_service.go)

| Method | Route                        | Description                                                            |
| ------ | ---------------------------- | ---------------------------------------------------------------------- |
| POST   | `/form1099misc/create`       | Create one or more 1099-MISC returns (Rents, Royalties, Medical, etc.) |
| PUT    | `/form1099misc/update`       | Update saved 1099-MISC records                                         |
| GET    | `/form1099misc/get`          | Retrieve by `?RecordIds=`                                              |
| POST   | `/form1099misc/validateform` | Validate payload without persisting                                    |

---

### 🛠️ Form Utilities — `/form1099utility/*`

Handler: [form1099utility_handler.go](./internal/handler/form1099utility_handler.go) · Service: [form1099utility_service.go](./pkg/service/form1099utility_service.go)

**Note**: Despite the route prefix, these utilities work for **both 1099 forms and W-2 forms**.

| Method | Route                                 | Description                                                                                                                                  |
| ------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/form1099utility/list`               | Paginated cross-form list. Filter by `TaxYear`, `FormTypes`, `Business`, `Recipient`, `SubmissionId`, status, date range, `Page`, `PageSize` |
| GET    | `/form1099utility/status`             | Real-time federal + state + distribution status. Query: `SubmissionId`, `RecordIds`                                                          |
| GET    | `/form1099utility/requestdraftpdfurl` | Generate a pre-transmission draft PDF. Query: `RecordId` → returns signed S3 URL                                                             |
| GET    | `/form1099utility/draftpdffile`       | **Proxied download** — fetches and streams draft PDF from S3 using SSE-C. Query: `draftPdfUrl`                                               |
| GET    | `/form1099utility/requestpdfurls`     | Post-transmission PDF URLs (Copy B, C, 1, 2, D). Query: `SubmissionId`, `RecordId`                                                           |
| DELETE | `/form1099utility/delete`             | Remove saved (untransmitted) records. Query: `SubmissionId`, `RecordIds`                                                                     |
| POST   | `/form1099utility/transmit`           | E-file to IRS/SSA + state agencies. Body: `SubmissionId`, `RecordIds[]`                                                                      |
| GET    | `/form1099utility/statuslog`          | Full audit trail of all status transitions. Query: `RecordId`                                                                                |

---

## Architecture

### Layered Structure

```
server/
├── main.go                         # Entrypoint: wires config → services → handlers → router
├── pkg/                             # Importable: the SDK surface
│   ├── config/
│   │   └── config.go                # godotenv loader → typed Config struct
│   ├── dtos/                        # Request/response/query models
│   │   ├── auth.go
│   │   ├── business.go
│   │   ├── common.go                 # ProxyResult, UpstreamResponse, error types
│   │   ├── form1099_shared.go
│   │   ├── form1099misc.go
│   │   ├── form1099nec.go
│   │   ├── form1099utility.go
│   │   └── recipient.go
│   └── service/                     # Business logic + upstream HTTP calls
│   │   ├── auth_service.go           # JWS signing → JWT fetching + 50-min cache
│   │   ├── business_service.go
│   │   ├── recipient_service.go
│   │   ├── form1099nec_service.go
│   │   ├── form1099misc_service.go
│   │   ├── form1099utility_service.go
│       └── http_helpers.go           # Shared proxy/retry-on-401 helper
├── internal/                        # Not importable: this server's own wiring
│   ├── draftpdf/
│   │   └── draftpdf.go               # AWS S3 GetObject with SSE-C (AES256)
│   ├── handler/                     # Per-route Gin handlers (thin layer)
│   │   ├── auth_handler.go
│   │   ├── business_handler.go
│   │   ├── recipient_handler.go
│   │   ├── form1099nec_handler.go
│   │   ├── form1099misc_handler.go
│   │   └── form1099utility_handler.go
│   ├── middleware/
│   │   ├── cors.go
│   │   ├── logger.go
│   │   └── recovery.go
│   ├── router/
│   │   └── router.go                 # Gin route registration
│   └── utils/
│       ├── constants.go              # Upstream TaxBandits endpoint paths
│       ├── mapper.go                 # DTO → upstream JSON payload shaping
│       └── query.go                  # Case-insensitive query param helpers
├── go.mod
├── go.sum
└── .env                              # Your local secrets (gitignored)
```

### Request Flow

```
 Client (React SPA)
      │ HTTP request
      ▼
 Gin Router (internal/router/router.go)
      │
      ▼
 Handler (internal/handler/*_handler.go)
      │ 1. Binds/validates input (ShouldBindJSON or query params)
      │ 2. Calls the matching service
      ▼
 Service (pkg/service/*_service.go)
      │ 1. Gets JWT from auth_service (cache hit → skip)
      │ 2. Adds Authorization header
      │ 3. Hits TaxBandits API via net/http
      │ 4. On 401 → re-fetches JWT (force refresh) + retries
      ▼
 TaxBandits 2.0.0 API
      │ response
      ▼
 Handler writes JSON back to client via utils.WriteProxyResponse
```

### OAuth Flow (see [auth_service.go](./pkg/service/auth_service.go))

1. **JWS Signing** — Builds a JWT payload with `iss`/`sub` (Client ID), `aud` (User Token), `iat`, `scope` (default: `FullAccess`), `categories` (default: `["All"]`), then signs with `HS256` using the Client Secret.
2. **Token Exchange** — Calls `GET {OAUTH_URL}{OAUTH_TOKEN_PATH}` with an `Authentication: <jws>` header → receives `AccessToken`.
3. **Caching** — Tokens are stored in-process, keyed by `scope::forms`, with a 50-minute TTL (slightly under TaxBandits' 60-min expiry for safety).
4. **Auto-Refresh** — The shared proxy helper (`callAPIWithRetry` / per-service `callAPI`) catches HTTP 401 from TaxBandits → calls `GetJWT(ctx, "", nil, true)` to force a `FullAccess`/`All` token refresh and retries the original request once.

### Draft PDF Proxy (see [draftpdf.go](./internal/draftpdf/draftpdf.go))

The `/form1099utility/draftpdffile` endpoint avoids exposing S3 credentials or SSE-C keys to the browser:

1. Client calls `requestdraftpdfurl` first → receives a signed S3 path
2. Client passes that URL to `draftpdffile?draftPdfUrl=...`
3. Server parses the S3 key from the URL
4. Server calls the AWS SDK for Go v2 `GetObject` with:
   - `SSECustomerAlgorithm: "AES256"`
   - `SSECustomerKey: <base64 from BASE_64_KEY>` (passed through as-is, not decoded)
5. Server streams the decrypted bytes back with a `Content-Type` derived from the file extension

---

## Port & CORS

- **Port**: Set via `SERVER_PORT` in `.env` (no hardcoded default)
- **CORS**: Enabled for all origins via [internal/middleware/cors.go](./internal/middleware/cors.go) (no restrictions). Tighten in production with origin whitelisting.
- **Timeouts**: `ReadHeaderTimeout` / `WriteTimeout` are configurable via `SERVER_READ_TIMEOUT_SEC` / `SERVER_WRITE_TIMEOUT_SEC`

---

## Commands

| Command                                    | Use Case                                    |
| ------------------------------------------ | ------------------------------------------- |
| `go run .`                                 | Development — compiles and runs in one step |
| `go build -o tbs-server . && ./tbs-server` | Production — build once, run the binary     |
| `go vet ./...`                             | Static analysis / catch compile-time issues |

---

## Troubleshooting

### Authentication 401

- Double-check `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, `OAUTH_USER_TOKEN`
- Tokens are cached in-memory — restart the server to force a cache reset

### Draft PDF 403 / Access Denied

- Verify AWS credentials, bucket name, and `BASE_64_KEY` match TaxBandits' SSE-C key
- Check that the IAM user has `s3:GetObject` permission on the target bucket/prefix

### Request Timeout

- The shared `http.Client` used by all services has a 30-second timeout (see [main.go](./main.go))
- For production, consider increasing this behind a load balancer

### CORS Errors in Browser

- Ensure the server is reachable at the `VITE_API_BASE_URL` defined in the client
- Confirm the server process is running on the port set in `SERVER_PORT`

### "no required module provides package ..." on build

- A file is importing a path other than the one declared in `go.mod` (`github.com/TaxBandits/tbs-go-sdk-v2.0.x/server`), e.g. `.../server/pkg/dtos`. Run `go build ./...` to catch any stragglers.

---

## Tech Stack Summary

| Component     | Library                           |
| ------------- | --------------------------------- |
| Web Framework | Gin                               |
| HTTP Client   | net/http (standard library)       |
| Environment   | godotenv                          |
| Auth / JWS    | golang-jwt/jwt/v5 (HS256)         |
| AWS SDK       | aws-sdk-go-v2 (S3, config, creds) |

---

## Next Steps

1. Create `.env` with your TaxBandits credentials
2. Start server: `go run .`
3. Verify with a quick sanity test:
   ```bash
   curl -X POST http://localhost:$SERVER_PORT/auth/gettoken \
     -H "Content-Type: application/json" \
     -d '{"scope":"FullAccess","forms":["All"]}'
   ```
4. Start the frontend client (see [../client/README.md](../client/README.md))
5. Extend handlers/services to add custom business logic or new TaxBandits endpoints

---

📚 **Related Documentation**

- [Root SDK README](../README.md) — Full SDK overview, module summary, typical workflow
- [Client README](../client/README.md) — React dashboard setup & component library
- [Official TaxBandits API 2.0.0 Docs](https://developer.taxbandits.com/docs/2.0.0/Business/Overview)
  - [Business Overview](https://developer.taxbandits.com/docs/2.0.0/Business/Overview)
  - [Business Create](https://developer.taxbandits.com/docs/2.0.0/Business/Create)
