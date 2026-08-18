## Overview

The **TaxBandits Go SDK 2.0.x** is a full-stack integration package for the TaxBandits API, enabling businesses to programmatically manage tax filings including 1099-NEC, 1099-MISC, Business (Payer) management, and Recipient management.

This SDK provides:

- **Go Backend Server** — Gin-based API wrapper that handles OAuth 2.0 authentication, request routing, and AWS S3 draft PDF proxying
- **React Frontend Client** — TypeScript + Vite dashboard with pre-built components for Business, Recipient, and Form management
- **Pre-built Modules** — Business (Payer), Recipient, Form 1099-NEC, Form 1099-MISC, and cross-form utility endpoints
- **Importable Go packages** — `server/pkg/` can be used as a dependency on its own, without running the sample server ([below](#use-it-as-a-go-module))

> 🔗 **Full API Reference**: [TaxBandits Developer Docs 2.0.0](https://developer.taxbandits.com/docs/2.0.0/Business/Overview)

---

## Use it as a Go module

The packages under `server/pkg/` are importable, so you can call the TaxBandits API from your own Go
code without running the sample server. Gin and the AWS SDK are used only by the server and live
under `internal/`, so neither ends up in your dependency graph.

```bash
go get github.com/TaxBandits/tbs-go-sdk-v2.0.x/server
```

```go
import (
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/config"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
	"github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/service"
)

auth := service.NewAuthService(httpClient, config.OAuthConfig{
	URL:          "https://testoauth.expressauth.net/v2",
	TokenPath:    "/token",
	ClientID:     clientID,
	ClientSecret: clientSecret,
	UserToken:    userToken,
	DefaultScope: "Read_Write",
	DefaultForms: []string{"All"},
})

misc := service.NewForm1099MiscService(auth, httpClient, config.APIConfig{
	URL: "https://testapi.taxbandits.com/v2.0.0",
})

result, err := misc.ValidateForm(ctx, dtos.Form1099MiscCreateRequest{})
```

One `AuthService` is shared across the form services — it signs the JWS, exchanges it for a JWT and
caches the token. See [server/README.md](./server/README.md#use-it-as-a-go-module) for the full
example and for which upstream statuses come back as a result rather than an error.

### Versioning

There are no release tags yet, so `go get` resolves to a pseudo-version pinned to a commit
(`v0.0.0-20260818143154-5c13e3252a00`). That works, but it can't be pinned to a meaningful
version. Tagging a release would fix that — note the module lives in `server/`, so the tag has to
carry that prefix:

```bash
git tag server/v0.1.0
git push origin server/v0.1.0
```

Consumers then pin it the usual way:

```bash
go get github.com/TaxBandits/tbs-go-sdk-v2.0.x/server@v0.1.0
```

---

## Project Structure

```
tbs-go-sdk-2.0.x/
├── client/                      # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── api/client.ts        # Axios HTTP client wrapper
│   │   ├── services/            # Business, Recipient, 1099 service layers
│   │   ├── components/          # Pre-built UI components
│   │   └── types/index.ts       # TypeScript interfaces
│   ├── .env.example             # Client env template
│   └── package.json
├── server/                      # Go + Gin backend
│   ├── pkg/                     # Importable: use these as a dependency
│   │   ├── config/              # Env-driven configuration loader
│   │   ├── dtos/                # Request/response/query models
│   │   └── service/             # OAuth + the TaxBandits API calls
│   ├── internal/                # The sample server's own wiring
│   │   ├── draftpdf/            # AWS S3 draft-PDF proxy (SSE-C)
│   │   ├── handler/             # Gin request handlers
│   │   ├── middleware/          # CORS, logging, panic recovery
│   │   ├── router/              # Route registration
│   │   └── utils/               # Endpoint paths, payload mapping
│   ├── main.go                  # Entrypoint: wires config → services → router
│   ├── .env                     # Your local secrets (gitignored)
│   └── go.mod
├── README.md                    # This file
```

---

## Available API Modules

### Authentication

| Method | Endpoint         | Description                           |
| ------ | ---------------- | -------------------------------------- |
| POST   | `/auth/gettoken` | Obtain JWT access token via OAuth 2.0 |

### Business Management

Manage payers/employers for whom you are filing tax forms.

| Method | Endpoint               | Description                                           |
| ------ | ---------------------- | ------------------------------------------------------ |
| POST   | `/business/create`     | Create a new business (returns `BusinessId`)          |
| GET    | `/business/get`        | Retrieve business by `BusinessId` or `PayerRef`       |
| PUT    | `/business/update`     | Update existing business details                      |
| GET    | `/business/list`       | Paginated list with filters (TIN, active, date range) |
| DELETE | `/business/delete`     | Delete business permanently                           |
| GET    | `/business/deactivate` | Temporarily deactivate a business                     |
| GET    | `/business/reactivate` | Reactivate a deactivated business                     |
| POST   | `/business/adddba`     | Add DBA (Doing Business As) names                     |
| PUT    | `/business/updatedba`  | Update DBA name/address                               |
| GET    | `/business/listdba`    | List all DBAs for a business                          |
| DELETE | `/business/deletedba`  | Remove a DBA from a business                          |

> 📘 **Read more**: [Business Endpoints Documentation](https://developer.taxbandits.com/docs/2.0.0/Business/Overview)

**Key Concepts:**

- **BusinessId** — Unique GUID generated on creation; use as primary reference
- **PayerRef** — Optional user-defined identifier (usable interchangeably with BusinessId)
- **TIN Format** — Supports PLAIN tax identification number formats
- **IsDefaultBusiness** — Auto-used flag when no specific business is referenced

### Recipient Management

Manage payees/recipients (contractors, vendors, etc.) for 1099 filings.

| Method | Endpoint                        | Description                                       |
| ------ | -------------------------------- | -------------------------------------------------- |
| POST   | `/recipient/create`             | Create a new recipient                            |
| GET    | `/recipient/get`                | Get recipient details by ID                       |
| PUT    | `/recipient/update`             | Update recipient information                      |
| GET    | `/recipient/list`               | Paginated list (filter by business, date, active) |
| DELETE | `/recipient/delete`             | Delete a recipient                                |
| GET    | `/recipient/deactivate`         | Deactivate recipient                              |
| GET    | `/recipient/reactivate`         | Reactivate recipient                              |
| POST   | `/recipient/assignrecipients`   | Assign recipients to a business                   |
| POST   | `/recipient/unassignrecipients` | Unassign recipients from a business               |
| POST   | `/recipient/adddba`             | Add recipient-level DBA names                     |
| PUT    | `/recipient/updatedba`          | Update recipient DBA                              |
| GET    | `/recipient/listdba`            | List recipient DBAs                               |
| DELETE | `/recipient/deletedba`          | Delete recipient DBA                              |

### Form 1099-NEC

Nonemployee Compensation reporting (contractors, freelancers).

| Method | Endpoint                    | Description                               |
| ------ | ---------------------------- | ------------------------------------------ |
| POST   | `/form1099nec/create`       | Create and save 1099-NEC form records     |
| GET    | `/form1099nec/get`          | Retrieve saved 1099-NEC records           |
| PUT    | `/form1099nec/update`       | Update existing 1099-NEC records          |
| POST   | `/form1099nec/validateform` | Validate form data before creation/update |

**Key Fields:** NEC amount, Cash Tips, Federal Tax WH, EPP, State withholding & income, Direct Sales indicator.

### Form 1099-MISC

Miscellaneous Income reporting (rents, royalties, medical payments, etc.).

| Method | Endpoint                     | Description                               |
| ------ | ------------------------------ | ------------------------------------------ |
| POST   | `/form1099misc/create`       | Create and save 1099-MISC form records    |
| GET    | `/form1099misc/get`          | Retrieve saved 1099-MISC records          |
| PUT    | `/form1099misc/update`       | Update existing 1099-MISC records         |
| POST   | `/form1099misc/validateform` | Validate form data before creation/update |

**Key Fields:** Rents, Royalties, Other Income, Medical Payments, Gross Proceeds, Crop Insurance, Section 409A, Nonqualified Deferred Compensation.

### Form Utilities

Cross-form operations for 1099s (list, status, PDFs, transmit, delete).

| Method | Endpoint                                | Description                                             |
| ------ | ----------------------------------------- | ---------------------------------------------------------- |
| POST   | `/form1099utility/list`               | Paginated list of forms (by tax year, business, status) |
| GET    | `/form1099utility/status`             | Get real-time federal/state/distribution status         |
| GET    | `/form1099utility/requestdraftpdfurl` | Request pre-transmission draft PDF                      |
| GET    | `/form1099utility/draftpdffile`       | Download draft PDF (S3 SSE-C proxy)                     |
| GET    | `/form1099utility/requestpdfurls`     | Get post-transmission PDF URLs (Copy B, C, 1, 2, D)     |
| DELETE | `/form1099utility/delete`             | Delete saved (untransmitted) form records               |
| POST   | `/form1099utility/transmit`           | E-file forms to IRS/SSA + state agencies                |
| GET    | `/form1099utility/statuslog`          | Full audit trail of all status transitions              |

---

## Quick Start

### Prerequisites

- **Go** >= 1.24 (module targets `go 1.26.1`)
- **Node.js** >= 18.x (for the client)
- **TaxBandits API Credentials** (Client ID, Client Secret, User Token) — sign up at [TaxBandits Developer](https://sandbox.taxbandits.com/)
- **AWS S3 Credentials** (for draft PDF proxy — optional if using pre-built URLs only)

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd tbs-go-sdk-2.0.x

# Fetch server module dependencies
cd server
go mod download

# Install client dependencies (new terminal)
cd ../client
npm install
```

### 2. Configure environment variables

Create the server `.env` (no template is checked in — see [Environment Variables](#environment-variables) below), and copy the client template:

```bash
# Client
cp client/.env.example client/.env
```

### 3. Start the stack

```bash
# Terminal 1 — Backend server (port from SERVER_PORT, e.g. 8080)
cd server
go run .

# Terminal 2 — Frontend client (port 3000)
cd client
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Environment Variables

### Server (`server/.env`)

| Variable                     | Required | Description                                                             |
| ----------------------------- | -------- | ------------------------------------------------------------------------ |
| `SERVER_PORT`                | ✅       | Port the Gin server listens on (e.g. `8080`)                           |
| `SERVER_READ_TIMEOUT_SEC`    | ⚠️       | Read header timeout in seconds (default `15`)                          |
| `SERVER_WRITE_TIMEOUT_SEC`   | ⚠️       | Write timeout in seconds (default `15`)                                |
| `SERVER_SHUTDOWN_TIMEOUT_SEC`| ⚠️       | Graceful shutdown timeout in seconds (default `10`)                    |
| `PUBLIC_API_URL`             | ✅       | TaxBandits API base URL (e.g. `https://testapi.taxbandits.com/v2.0.0`) |
| `OAUTH_URL`                  | ✅       | OAuth 2.0 base URL                                                      |
| `OAUTH_TOKEN_PATH`           | ⚠️       | OAuth token path appended to `OAUTH_URL` (default `/token`)            |
| `OAUTH_CLIENT_ID`            | ✅       | Your TaxBandits Client ID                                              |
| `OAUTH_CLIENT_SECRET`        | ✅       | Your TaxBandits Client Secret                                          |
| `OAUTH_USER_TOKEN`           | ✅       | Your TaxBandits User Token                                             |
| `AWS_ACCESS_KEY`             | ⚠️       | AWS Access Key (required for draft PDF download proxy)                 |
| `AWS_SECRET_KEY`             | ⚠️       | AWS Secret Key (required for draft PDF download proxy)                 |
| `BUCKET_NAME`                | ⚠️       | S3 bucket name (e.g. `expressirsforms`)                                |
| `BASE_64_KEY`                | ⚠️       | Base64-encoded SSE-C encryption key for draft PDFs                     |

### Client (`client/.env`)

| Variable            | Required | Default                 | Description             |
| -------------------- | -------- | ------------------------- | -------------------------- |
| `VITE_API_BASE_URL` | ✅       | `http://localhost:8080` | Backend server base URL |

---

## Typical Workflow

1. **Authenticate** → Obtain JWT token via `POST /auth/gettoken`
2. **Create Business** → `POST /business/create` → store `BusinessId`
3. **Add Recipients** → `POST /recipient/create` → store `RecipientId`s
4. **Create Form** → `POST /form1099nec/create` (or 1099-MISC) with `BusinessId` + `RecipientId`
5. **Validate** (optional) → `POST /form1099nec/validateform` to check for errors before save
6. **Review Draft PDF** → `/form1099utility/requestdraftpdfurl` → download preview
7. **Transmit** → `POST /form1099utility/transmit` → e-file to IRS + state agencies
8. **Track Status** → `/form1099utility/status` or `/form1099utility/statuslog`
9. **Get PDFs** → `/form1099utility/requestpdfurls` → retrieve Copy B, C, 1, 2, D PDFs

---

## Documentation

- 🔗 [Official TaxBandits API 2.0.0 Docs](https://developer.taxbandits.com/docs/2.0.0/Business/Overview)
  - [Business Endpoints](https://developer.taxbandits.com/docs/2.0.0/Business/Overview)
  - [Form 1099-NEC](https://developer.taxbandits.com/docs/2.0.0/Form-1099-NEC/Overview)
  - [Form 1099-MISC](https://developer.taxbandits.com/docs/2.0.0/Form-1099-MISC/Overview)
- 📂 [Server README](./server/README.md) — Backend setup, routes, architecture
- 📂 [Client README](./client/README.md) — Frontend setup, components, service layer

---

## Tech Stack

| Layer         | Technology                                                       |
| ------------- | ------------------------------------------------------------------ |
| Backend       | Go 1.26, Gin, golang-jwt, AWS SDK for Go v2                      |
| Frontend      | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, React Router 7 |
| Auth          | OAuth 2.0 Bearer tokens, JWT (HS256)                             |
| Storage       | AWS S3 (SSE-C encrypted draft PDF proxy)                         |
| UI Components | lucide-react (icons), motion (animations), date-fns              |

---

## License

Internal SDK for TaxBandits API integration.
