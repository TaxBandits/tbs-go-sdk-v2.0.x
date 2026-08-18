## Overview

The **TaxBandits Client** is a modern React 19 + TypeScript SPA (Single Page Application) built with Vite. It provides a ready-to-use dashboard with pre-built UI components and service layers for managing:

- 🏢 **Business (Payer) management** — Create, update, list, delete payers and DBAs
- 👥 **Recipient management** — Vendor/contractor directory with assignment & DBA support
- 📄 **Form 1099-NEC** — Nonemployee Compensation forms with multi-return submissions
- 🧾 **Form 1099-MISC** — Miscellaneous Income forms with full field support
- 📊 **Form Dashboard** — List, status tracking, PDF previews, e-file transmit, delete, and audit logs

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **Backend server running** — The client proxies all API calls to the Go backend (see [../server/README.md](../server/README.md))

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

By default the client connects to the local backend at `http://localhost:8080` (see `.env.example`).

### 3. Run development server

```bash
npm run dev
```

Vite starts the client at **http://localhost:3000** with hot-module replacement (HMR).

### 4. Build for production

```bash
npm run build
```

Output is generated in the `dist/` directory. Deploy the contents to any static host (Netlify, Vercel, S3, Nginx, etc.).

### 5. Preview production build

```bash
npm run preview
```

### 6. Type-check (no emit)

```bash
npm run lint
```

---

## Environment Variables

All variables are Vite-styled (prefixed with `VITE_`) and are inlined at build time.

| Variable            | Default                 | Required | Description                         |
| ------------------- | ----------------------- | -------- | ----------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | ✅       | Base URL for the backend Go SDK server |

> ⚠️ **Important**: Never put secrets in client env variables. All TaxBandits credentials live in the **server** `.env`.

---

## Project Structure

```
client/
├── src/
│   ├── api/
│   │   └── client.ts               # Axios instance with base URL + interceptors
│   ├── services/
│   │   ├── payerService.ts         # Business CRUD + DBA management
│   │   ├── recipientService.ts     # Recipient CRUD + assign/unassign + DBA
│   │   ├── form1099NecService.ts   # 1099-NEC create/update/get/validate
│   │   ├── form1099MiscService.ts  # 1099-MISC create/update/get/validate
│   │   └── form1099UtilityService.ts  # List/status/PDFs/transmit/delete/log
│   ├── components/                 # Pre-built UI (see table below)
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces
│   ├── constants.ts                # App-wide constants
│   ├── App.tsx                     # Root component + routes
│   ├── main.tsx                    # React entry
│   └── index.css                   # Tailwind 4 global styles
├── index.html                      # Vite HTML entry
├── vite.config.ts                  # Vite + React plugin + Tailwind config
├── tsconfig.json                   # TypeScript strict mode enabled
├── package.json
└── .env.example
```

---

## Service Layer

The client ships with five typed service modules. Import them anywhere in your app:

```ts
import { payerService } from "./services/payerService";
import { recipientService } from "./services/recipientService";
import { form1099NecService } from "./services/form1099NecService";
import { form1099MiscService } from "./services/form1099MiscService";
import { form1099UtilityService } from "./services/form1099UtilityService";
```

### payerService

| Method                                                                                         | Description                               |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `savePayer({ Businesses })`                                                                    | Create one or more businesses             |
| `updatePayer({ Businesses })`                                                                  | Update existing businesses                |
| `deletePayer(businessId)`                                                                      | Delete a business                         |
| `getBusinesses(params)`                                                                        | Paginated list with name/TIN/date filters |
| `getBusinessById(businessId)`                                                                  | Full details for one business             |
| `activatePayer(businessIds)`                                                                   | Reactivate deactivated businesses         |
| `deactivatePayer(businessIds)`                                                                 | Temporarily deactivate                    |
| `addDBA(dbaData)` / `updateDBA(dbaData)` / `listDBA(params)` / `deleteDBA(businessId, dbaIds)` | DBA sub-management                        |

### recipientService

| Method                                                   | Description                                  |
| -------------------------------------------------------- | -------------------------------------------- |
| `createRecipient(data)`                                  | Create a new recipient                       |
| `updateRecipient(data)`                                  | Update recipient                             |
| `deleteRecipient(recipientId)`                           | Delete recipient                             |
| `getRecipients(params)`                                  | Filtered list (business, active, date range) |
| `getRecipientById(recipientId)`                          | Single recipient detail                      |
| `reactivateRecipient(id)` / `deactivateRecipient(id)`    | Toggle active state                          |
| `assignRecipient(data)` / `unassignRecipient(data)`      | Assign recipients to business                |
| `addDBA()` / `updateDBA()` / `listDBA()` / `deleteDBA()` | Recipient-level DBA support                  |

### form1099NecService

| Method                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| `create(request)`       | Create 1099-NEC returns (multi-return batch) |
| `update(request)`       | Update saved 1099-NEC returns                |
| `get({ recordIds })`    | Retrieve 1099-NEC by RecordId(s)             |
| `validateForm(request)` | Validate data without persisting             |

### form1099MiscService

Same shape as `form1099NecService` but with MISC-specific fields (Rents, Royalties, Medical Payments, etc.).

### form1099UtilityService

Cross-form operations (works for both 1099-NEC / 1099-MISC / W-2).

| Method                                       | Description                           |
| -------------------------------------------- | ------------------------------------- |
| `list(request)`                              | Paginated cross-form list             |
| `status({ submissionId, recordIds })`        | Federal + state + distribution status |
| `requestDraftPdfUrl(recordId)`               | Pre-transmit draft PDF URL            |
| `getDraftPdfFileUrl(draftPdfUrl)`            | Builds proxied download URL           |
| `requestPdfUrls({ submissionId, recordId })` | Post-transmit Copy B/C/1/2/D PDFs     |
| `delete({ submissionId, recordIds })`        | Remove saved (untransmitted) records  |
| `transmit({ submissionId, recordIds })`      | E-file to IRS + states                |
| `statusLog({ recordId })`                    | Full status change audit log          |

---

## UI Components

Pre-built, composable components in `src/components/`:

| Component                    | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| `LoginPage.tsx`              | OAuth login entry                          |
| `OAuthPage.tsx`              | OAuth callback handler                     |
| `OverviewPage.tsx`           | Dashboard landing page                     |
| `Dashboard.tsx`              | Main shell/navigation wrapper              |
| `PayerOffcanvas.tsx`         | Slide-out business create/edit form        |
| `AddressBookPage.tsx`        | Recipient directory page                   |
| `RecipientDetailPanel.tsx`   | Recipient detail side panel                |
| `AddRecipientWizard.tsx`     | Multi-step add recipient flow              |
| `AssignRecipientModal.tsx`   | Modal for assigning recipients             |
| `Form1099SeriesPage.tsx`     | Forms dashboard (list + actions)           |
| `CreateForm1099Wizard.tsx`   | Multi-step 1099-NEC/MISC create flow       |
| `Form1099ActionsCell.tsx`    | Table row actions (view/transmit/delete)   |
| `Form1099NecViewModal.tsx`   | 1099-NEC record detail viewer              |
| `Form1099StatusModal.tsx`    | Status summary modal                       |
| `Form1099StatusLogModal.tsx` | Audit trail / status log viewer            |
| `Form1099DraftPdfModal.tsx`  | Draft PDF preview modal                    |
| `Form1099PdfUrlsModal.tsx`   | Post-transmit PDF selector (Copy B/C/etc.) |
| `Form1099TransmitModal.tsx`  | E-file confirmation & transmit             |
| `Form1099ErrorsModal.tsx`    | Form validation error list                 |
| `Form1099SuccessModal.tsx`   | Create/success confirmation                |
| `Input.tsx`                  | Shared styled input component              |

All components are built with **Tailwind CSS 4**, **lucide-react** icons, **motion** animations, and **date-fns** for formatting.

---

## API Client (`src/api/client.ts`)

Uses a shared Axios instance with:

- Base URL from `VITE_API_BASE_URL`
- Automatic JSON content types
- Centralized error handling (extend interceptors as needed)

```ts
import api from "./api/client";

// Direct usage example:
const { data } = await api.get("/business/list", { params: { page: 1 } });
```

---

## Routing (React Router 7)

The app uses React Router 7 with routes defined in `App.tsx`:

- `/login` — Login page (public)
- `/` — Dashboard shell, redirects to `/login` if not authenticated
  - index (`/`) — Overview page
  - `/address-book` — Recipient directory
  - `/oauth` — OAuth page
  - `/form-1099-series` — 1099-NEC / 1099-MISC forms dashboard
- `*` — Falls back to `/` (authenticated) or `/login` (not authenticated)

---

## Tech Stack Summary

| Library                | Purpose                            |
| ---------------------- | ---------------------------------- |
| React 19               | UI framework                       |
| TypeScript 5.8         | Static type checking (strict mode) |
| Vite 6                 | Dev server + build tooling         |
| React Router 7         | Client-side routing                |
| Axios                  | HTTP client                        |
| Tailwind CSS 4         | Utility-first styling              |
| lucide-react           | Icon library                       |
| motion (Framer Motion) | Smooth animations                  |
| date-fns               | Date formatting & helpers          |

---

## Next Steps

1. Start the backend server first ([../server/README.md](../server/README.md))
2. Run `npm run dev` in this folder
3. Open http://localhost:3000 and explore the dashboard
4. Customize components in `src/components/` or use service modules independently in your own UI

---

📚 **Related Documentation**

- [Root SDK README](../README.md) — Full SDK overview & module list
- [Server README](../server/README.md) — Backend setup & API route map
- [Official TaxBandits 2.0.0 Docs](https://developer.taxbandits.com/docs/2.0.0/Business/Overview)
