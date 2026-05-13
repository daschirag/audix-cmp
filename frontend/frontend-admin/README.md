# Audix CMP — DPDPA Consent Management Platform

A complete React + TypeScript + Tailwind CSS frontend for the Audix CMP platform.

---

## 📁 Folder Structure

```
audix-cmp/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx              # Entry point
    ├── App.tsx               # Router provider
    ├── index.css             # Tailwind base + global styles
    ├── routes/
    │   └── routes.tsx        # All route definitions
    ├── data/
    │   └── mockData.ts       # All mock data + TypeScript interfaces
    │                         # ← Backend team: replace with API calls here
    ├── components/
    │   ├── Header.tsx        # Top navigation bar
    │   ├── SuccessMessage.tsx # Reusable success toast
    │   └── ToggleSwitch.tsx  # Reusable toggle component
    └── screens/
        ├── LoginScreen.tsx   # / — Login page
        ├── DashboardScreen.tsx # /dashboard — DPO Governance Dashboard
        ├── ComplaintsScreen.tsx # /complaints — Complaint management + modals
        ├── RegulatorScreen.tsx  # /regulator — Reports & Access Control
        ├── AuditScreen.tsx      # /audit — Audit logs
        └── AdminScreen.tsx      # /admin — SLA config, orgs, consent purposes
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Install & Run

```bash
# Install dependencies
pnpm install
# or: npm install

# Start development server
pnpm dev
# or: npm run dev

# Build for production
pnpm build
# or: npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Login with any credentials → navigates to Dashboard.

---

## 🔗 Routes

| Path           | Screen              |
|----------------|---------------------|
| `/`            | Login               |
| `/dashboard`   | DPO Dashboard       |
| `/complaints`  | Complaints          |
| `/regulator`   | Regulator Reports   |
| `/audit`       | Audit Logs          |
| `/admin`       | Admin Settings      |

---

## 🎨 Design System

| Token              | Value       |
|--------------------|-------------|
| Primary Navy       | `#0A2540`   |
| Primary Teal       | `#00C4B4`   |
| Teal Hover         | `#00B3A3`   |
| Background         | `#F8F9FA`   |
| Font               | Inter       |

---

## 🔧 For Backend Team

All mock data lives in **`src/data/mockData.ts`**.

To connect to a real API, replace the exported arrays/objects with API fetch calls. Each screen imports from this file:

```ts
// Example: replace mock with API call
// Before:
export const complaintsData: Complaint[] = [ ... ]

// After:
export async function fetchComplaints(): Promise<Complaint[]> {
  const res = await fetch('/api/complaints')
  return res.json()
}
```

Each screen uses `useState` to hold data locally — simply swap the initial state with an `useEffect` + API call pattern.

---

## 📦 Tech Stack

| Package           | Version   |
|-------------------|-----------|
| React             | 18.3.1    |
| React Router DOM  | 7.x       |
| Lucide React      | 0.487.0   |
| Recharts          | 2.15.2    |
| Tailwind CSS      | 3.4.x     |
| TypeScript        | 5.x       |
| Vite              | 6.x       |
