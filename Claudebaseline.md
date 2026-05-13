# ICP Dashboard — Claude Code Instructions

## Project Overview
Internal dashboard for Global Turbine Asia (GTA) to manage ICP (Industrial Collaboration Programme) obligations across 5 contracts with Petronas/RMAF. Built with React + Vite + Supabase (PostgreSQL).

---

## Tech Stack
- **Frontend**: React + Vite, React Router DOM
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Styling**: Inline styles only (no Tailwind, no CSS modules)
- **Deployment**: Vercel → https://icp-dashboard-eta.vercel.app/

---

## Project Structure
```
src/
├── assets/
├── components/
│   ├── ChatBot.jsx
│   ├── ContractKpiCards.jsx
│   ├── ContractTable.jsx
│   ├── ContractTabs.jsx
│   ├── ExcelUpload.jsx
│   ├── ExpiryAlert.jsx
│   ├── IcvDonutChart.jsx
│   ├── IpdTable.jsx
│   ├── KpiBar.jsx
│   ├── MilestoneTable.jsx
│   ├── Sidebar.jsx
│   └── UrgentPanel.jsx
├── hooks/
│   ├── useContracts.js
│   ├── useIcvTracker.js
│   ├── useIpdds.js
│   └── useUrgentItems.js
├── lib/
│   └── supabase.js
├── pages/
│   ├── AiAdmin.jsx
│   ├── ContractDetail.jsx
│   ├── Dashboard.jsx
│   ├── IcvTracker.jsx
│   └── OrgChart.jsx
└── utils/
    └── parseExcel.js
```

---

## Routing (App.jsx)
```
/                → Dashboard
/contracts/:id   → ContractDetail
/gantt           → Gantt Chart (TBD)
/urgent          → Urgent Folder (in Dashboard)
/icv             → IcvTracker
/admin           → AiAdmin
/org-chart       → OrgChart
```

---

## Supabase Tables

### `contracts`
| Column | Type | Notes |
|--------|------|-------|
| id | int4 PK | 1=ISS2 TP400, 2=GSP Makila, 3=TP400 HW, 4=ISS2 Additional, 5=ISS2 Extension |
| name | text | Contract name |
| duration_start | date | |
| duration_end | date | |
| obligation_value | numeric | Total ICP obligation (RM) |
| total_icv_planned | numeric | |
| icv_balance | numeric | |
| pct_icv_planned | numeric | ratio e.g. 0.5998 |
| pct_icv_balance | numeric | |
| approved_planned_icv | numeric | BIP approved only — NOT total planned |
| nominal_value | numeric | |
| current_actual_icv | numeric | |
| est_nominal_planned | numeric | |
| oba_plan | boolean | |
| status | text | 'Active' |

### `ipds`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| contract_id | int FK → contracts | |
| code | text | 'IPD 1', 'IPD 2' |
| description | text | Full IPD description |
| category_type | text | IPD Type — read-only badge e.g. 'MRO', 'Exhibition', 'Training' |
| objectives | text | legacy — not used in UI |
| beneficiary | text | e.g. 'GTA', 'RMAF / GTA' — shown in IPD header, editable |
| project_category | text | 'Essential' or 'Strategic' — shown in IPD header, editable dropdown |

### `ipd_milestones`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| ipd_id | int FK → ipds | |
| submission_number | text | BIP session e.g. 'BIP-1/2025', 'Session 2/2025' — per milestone |
| milestone_desc | text | Milestone description text |
| est_nominal_value | numeric | |
| actual_nominal_value | numeric | |
| multiplier | numeric | |
| est_plan_icv | numeric | GENERATED: est_nominal × multiplier — never write directly |
| actual_icv | numeric | GENERATED: actual_nominal × multiplier — never write directly |
| claim_submission_notes | text | Combined text: "Submit: 20/12/2024  Approved: 25/2/2025" |
| total_icv_approved | numeric | |
| balance_icv | numeric | GENERATED: est_plan_icv - total_icv_approved — never write directly |
| payment_planning | text | e.g. "Nov'26" |
| status_project | text | 'Not Started' / 'In Progress' / 'Done' / 'On Hold' |
| created_at | timestamptz | |

### `urgent_items`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| title | text | |
| due_date | date | |
| file_link | text | SharePoint/Teams URL (no file upload) |
| uploaded_by | text | |
| status | text | 'Pending' / 'Urgent' / 'Review' / 'Done' |
| contracts (relation) | | via contract_id FK |

### `org_members`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| name | text | |
| role | text | |
| image_data | text | base64 compressed jpeg |

---

## 5 Active Contracts
| ID | Name | Obligation | Duration |
|----|------|-----------|----------|
| 1 | ISS 2 TP400-D6 | RM 163M | Jun 2022 – Dec 2026 |
| 2 | GSP Makila | RM 257M | Jan 2023 – Jan 2028 |
| 3 | TP400-D6 Hardware | RM 392.5M | Jun 2024 – Jun 2029 |
| 4 | ISS 2 TP400-D6 Additional | RM 165M | Jun 2022 – Dec 2026 |
| 5 | ISS 2 TP400-D6 Extension | RM 164M | Jun 2022 – Dec 2026 |

---

## ICP Domain Knowledge

### ICV (Industrial Collaboration Value)
- **ICV = Nominal Value × Multiplier**
- Multiplier ranges: 1x (basic), 2x, 3x, 4x, 7.2x, 9x (strategic/high-value)
- Higher multiplier = higher ICV credit per RM spent

### Project Categories
- **Essential**: Operational spending GTA must do to maintain capability & run business (EASA renewal, training, royalty fees, protege salary) — still claimable as ICP
- **Strategic**: Beyond normal operations — R&D, digitization, conferences, Masters/PhD programs

### Claim Submission Flow
1. GTA submits claim to BIP (Bahagian Industri Pertahanan)
2. BIP reviews → Approved or Rejected
3. If rejected → Re-submit required
4. Approved amount recorded as `total_icv_approved`
5. Multiple submissions possible (1st, 2nd, 3rd...) — open-ended

### Submission Status (ISS 2 TP400-D6 example)
- 1st Submission: RM 11,401,010.69 — **Approved** ✅
- 2nd Submission: RM 16,050,753.27 — **Pending BIP Review** 🟡
- 3rd Submission: RM 18,983,154.64 — **Not yet submitted** 🟡

### Key Issue
Finance dept records more spend than what's being claimed for ICV.
Example: IPD 1 ISS — Finance recorded RM 22M spent, but only RM 6M claimed ICV → losing claimable ICV value. Tracker being reconciled with Finance.

---

## UI/Style Conventions
- **Background**: `#f1f5f9` (page), `#fff` (cards)
- **Primary navy**: `#1F4E79`
- **Blue accent**: `#378ADD`
- **Green**: `#3B6D11` / `#1D9E75`
- **Border**: `0.5px solid #e5e7eb`
- **Border radius**: 12px (cards), 8px (inputs), 6px (small)
- **Font sizes**: 11px (meta/label), 12-13px (table), 14px (section title), 20px+ (KPI values)
- **No external CSS libraries** — inline styles only
- **No Tailwind**

---

## Key Business Rules
1. `approved_planned_icv` in contracts = BIP approved amount ONLY (not total planned)
2. `est_plan_icv` and `actual_icv` are GENERATED columns in Supabase — never write to them directly, strip before INSERT/UPDATE
3. `balance_icv` is also GENERATED — strip before writes
4. UrgentPanel uses link paste only — NO file upload to storage
5. OrgChart images stored as base64 in DB (compressed to max 300×300px JPEG)

---

## Pending / Planned Features
- [ ] ICV Tracker page — milestone table editable, IPD header with beneficiary & project_category
- [ ] Gantt Chart page per IPD
- [ ] Export to Excel (milestone table)
- [ ] SharePoint integration
- [ ] Public view (read-only)
- [ ] Audit trail page
- [ ] Pie chart
- [ ] Outstanding claim statistics
- [ ] User authentication (future)