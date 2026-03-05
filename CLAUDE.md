# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start development server (Vite, localhost:5173)
yarn build        # Type-check (tsc -b) then build for production
yarn lint         # Run ESLint across the codebase
yarn preview      # Preview the production build locally
```

There are no tests configured in this project.

## Architecture

### Stack
- **React 19 + TypeScript** via Vite
- **Routing:** React Router v7
- **State:** Zustand v5 (one store per domain)
- **API:** Axios with a shared `apiClient` in `src/services/api.ts`
- **UI:** Shadcn UI (Radix primitives) + Tailwind CSS + Lucide icons
- **Path alias:** `@/` maps to `src/`

### Auth Flow
OTP-based login — no password. `POST /auth/verify-otp` returns a JWT stored in `localStorage` under the key `admin_token`. The Axios request interceptor in `src/services/api.ts` automatically attaches it as `Authorization: Bearer <token>` on every request. Auth state lives in `useAuthStore` (Zustand), which also reads from localStorage on init so sessions survive page refreshes.

### Route Protection
`src/routes/ProtectedRoute.tsx` checks `isAuthenticated` from `useAuthStore`. Unauthenticated users are redirected to `/login`; authenticated users get the `DashboardLayout` with sidebar navigation.

### State / Data Fetching Pattern
Each domain has a Zustand store that owns fetching, loading, error, and pagination state:
- `useAuthStore` — login/logout, persisted token
- `useUsersStore` — user list + user detail (paginated, 20/page)
- `useAnalyticsStore` — dashboard stats and trends
- `useReportedStore` — reported/flagged files (paginated)

Stores call service functions (`src/services/*.service.ts`) which use `apiClient`. Components subscribe to store slices via selectors.

### Key API Endpoints
| Store/Service | Backend path |
|---|---|
| Auth | `/auth/verify-otp` |
| Users list | `/web/admin/users` |
| User detail | `/web/admin/user/:id` |
| User actions (delete/restore/block) | `/web/admin/users/:id` |
| Dashboard stats | `/web/analytics/dashboard-stats` |
| Reported items | `/web/admin/reported-items` |

### Environment
`VITE_API_URL` in `.env` sets the API base URL (currently `https://api.tenbox.app/api/v1`). The fallback in `api.ts` is `http://localhost:3000/api`. Restart the dev server after changing `.env`.

### Layout
`DashboardLayout` (`src/layouts/`) wraps all protected pages with a sidebar (hidden on mobile, hamburger menu provided). Pages live in `src/pages/`.
