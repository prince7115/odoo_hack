# AssetFlow — Hackathon Implementation Plan

## Problem Statement Summary
Build an **Enterprise Asset & Resource Management System** with: login/signup, dashboard, org setup (admin), asset registry, allocation & transfer, resource booking, maintenance management, asset audit, reports & analytics, and activity logs/notifications.

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React (Vite) |
| Backend | Spring Boot |
| Database | PostgreSQL |
| AI (future) | Gemma 4:e4b (local) |
| Design Prototyping | Google Stitch (project: `odoo`, ID: `17545362602219729682`) |

---

## Stitch Project Status
- **Project ID:** `17545362602219729682`
- **Existing screens:** Login screen (generated), 1 uploaded reference image
- **Design system:** Already configured — "AssetFlow Professional" (Inter font, blue primary `#0052ff`, light mode)

---

## 10 Screens to Build (from Problem Statement)

| # | Screen | Complexity | Priority |
|---|--------|-----------|----------|
| 1 | Login / Signup | Low | P0 |
| 2 | Dashboard / Home | Medium | P0 |
| 3 | Organization Setup (Admin — 3 tabs) | High | P0 |
| 4 | Asset Registration & Directory | Medium | P0 |
| 5 | Asset Allocation & Transfer | High | P1 |
| 6 | Resource Booking | High | P1 |
| 7 | Maintenance Management (Kanban) | High | P1 |
| 8 | Asset Audit | Medium | P2 |
| 9 | Reports & Analytics | Medium | P2 |
| 10 | Activity Logs & Notifications | Low | P2 |

---

## Phased Workflow (8-hour Hackathon)

### Phase 1 — Foundation (Hour 0–1.5)
> **Goal:** Project scaffolding, DB schema, design system, login screen

| Task | Owner | Details |
|------|-------|---------|
| React project setup (Vite + React Router + Axios) | **Frontend 1** | Scaffold project, folder structure, shared layout with sidebar |
| Spring Boot project setup (Maven/Gradle + JPA + Security) | **Backend 1** | Init project, configure PostgreSQL connection, JWT auth setup |
| PostgreSQL schema design & seed data | **Backend 2** | Design all tables (see schema below), create migration scripts |
| Stitch → Login/Signup screen (already done) → Export HTML/CSS to React | **Frontend 2** | Convert Stitch login screen to React component, integrate with auth API |

---

### Phase 2 — Core Screens (Hour 1.5–4)
> **Goal:** Dashboard, Org Setup, Asset Registration

| Task | Owner | Details |
|------|-------|---------|
| **Screen 2: Dashboard** — Generate in Stitch, then code in React | **Frontend 1** | KPI cards, recent activity feed, quick action buttons |
| **Screen 3: Org Setup (3 tabs)** — Departments, Categories, Employees | **Frontend 2** | Tab layout, CRUD tables, role promotion UI |
| Dashboard + Org Setup REST APIs | **Backend 1** | `GET /api/dashboard/stats`, CRUD for departments/categories/employees |
| Asset & Allocation DB models + APIs | **Backend 2** | Asset CRUD, search/filter endpoints, allocation conflict logic |

---

### Phase 3 — Asset Management (Hour 4–6)
> **Goal:** Asset Directory, Allocation & Transfer, Resource Booking

| Task | Owner | Details |
|------|-------|---------|
| **Screen 4: Asset Registration & Directory** | **Frontend 1** | Search/filter UI, register asset form, lifecycle status badges |
| **Screen 5: Allocation & Transfer** | **Frontend 2** | Allocation form, conflict block UI, transfer request form, history timeline |
| **Screen 6: Resource Booking** | **Frontend 1** | Calendar/timeline view, overlap validation display, booking status |
| Booking + Transfer APIs | **Backend 1** | Time-slot overlap validation, transfer workflow (Requested→Approved→Reallocated) |
| Maintenance + Audit APIs | **Backend 2** | Maintenance workflow, audit cycle CRUD, discrepancy report generation |

---

### Phase 4 — Workflows & Reports (Hour 6–7.5)
> **Goal:** Maintenance Kanban, Audit, Reports, Notifications

| Task | Owner | Details |
|------|-------|---------|
| **Screen 7: Maintenance Management (Kanban)** | **Frontend 2** | Drag-and-drop kanban board (Pending→Approved→Assigned→InProgress→Resolved) |
| **Screen 8: Asset Audit** | **Frontend 1** | Audit cycle table, checklist (Verified/Missing/Damaged), discrepancy report |
| **Screen 9: Reports & Analytics** | **Frontend 2** | Charts (utilization, maintenance frequency), idle/most-used lists, export button |
| **Screen 10: Activity Logs & Notifications** | **Frontend 1** | Notification feed with filters (All/Alerts/Approvals/Bookings), timestamps |
| Reports + Notifications APIs | **Backend 1 + 2** | Aggregation queries, notification events, export endpoints |

---

### Phase 5 — Polish & Demo (Hour 7.5–8)
> **Goal:** Integration testing, bug fixes, demo prep

| Task | Owner | Details |
|------|-------|---------|
| End-to-end flow testing | **All** | Login → Dashboard → Create Asset → Allocate → Book → Maintain → Audit |
| UI polish & responsive fixes | **Frontend 1 + 2** | Consistent spacing, loading states, error toasts |
| Demo data seeding | **Backend 2** | Realistic sample data for all screens |
| Demo script preparation | **Backend 1** | Walk-through narrative for judges |

---

## Team Assignment (4 Members)

| Role | Focus Area | Screens Owned |
|------|-----------|---------------|
| **Frontend 1** | Layout + Data-heavy screens | Dashboard (2), Asset Directory (4), Resource Booking (6), Audit (8), Notifications (10) |
| **Frontend 2** | Forms + Workflow screens | Login (1), Org Setup (3), Allocation & Transfer (5), Maintenance Kanban (7), Reports (9) |
| **Backend 1** | Auth + Business logic APIs | JWT auth, Dashboard stats, Booking overlap validation, Transfer workflow, Reports aggregation |
| **Backend 2** | DB schema + CRUD + Data | Schema design, Asset CRUD, Maintenance workflow, Audit cycles, Seed data |

---

## Stitch Screen-by-Screen Plan

> [!IMPORTANT]
> We will generate screens **one at a time** in Stitch, review the design, then export the HTML to convert to React components.

### Screen generation order:
1. ~~Login / Signup~~ *(already generated)*
2. **Dashboard** ← **Start here next**
3. Organization Setup
4. Asset Registration & Directory
5. Asset Allocation & Transfer
6. Resource Booking
7. Maintenance Management
8. Asset Audit
9. Reports & Analytics
10. Activity Logs & Notifications

---

## Database Schema (Key Tables)

```
departments (id, name, head_id, parent_dept_id, status)
employees (id, name, email, password_hash, department_id, role, status)
asset_categories (id, name, custom_fields_json)
assets (id, tag, name, category_id, serial_number, acquisition_date, cost, condition, location, status, is_bookable, photo_url)
allocations (id, asset_id, employee_id, department_id, allocated_date, expected_return, actual_return, condition_notes, status)
transfers (id, asset_id, from_employee_id, to_employee_id, reason, status, approved_by)
bookings (id, asset_id, booked_by, start_time, end_time, status)
maintenance_requests (id, asset_id, description, priority, photo_url, status, technician, resolved_date)
audit_cycles (id, scope, date_range_start, date_range_end, status)
audit_assignments (id, audit_cycle_id, auditor_id)
audit_items (id, audit_cycle_id, asset_id, expected_location, verification_status)
notifications (id, user_id, message, type, created_at, read)
activity_logs (id, user_id, action, entity_type, entity_id, timestamp)
```

---

## User Roles & Permissions

| Role | Can Do |
|------|--------|
| **Admin** | Everything — org setup, role promotion, analytics |
| **Asset Manager** | Register/allocate assets, approve transfers/maintenance/audits |
| **Department Head** | View dept assets, approve dept transfers, book resources |
| **Employee** | View own assets, book resources, raise maintenance/transfer requests |

---

## Open Questions

> [!IMPORTANT]
> Please confirm before we proceed:

1. **Which screen should we generate next in Stitch?** I recommend starting with the **Dashboard** screen since the Login is already done.
2. **Do you have the 4 reference screen images uploaded to the Stitch project already**, or do they need to be uploaded from a local folder?
3. **React project setup** — should I scaffold the Vite + React project now, or do you want to finalize all Stitch designs first?
