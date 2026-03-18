# Dispute & Refund — Inspector API Reference
## (Inspector role — Mobile App)

> **Generated**: 2026-03-12
> **Scope**: Only Inspector role APIs. For Buyer + Admin, see `docs/dispute-refund-api-update.md`
> **Backend base URL**: `{SERVER_URL}/api/v1`

---

## 1. Inspector's Role in Dispute Flow

```
DISPUTE LIFECYCLE — Inspector's Perspective
============================================

  [Buyer creates dispute]
        |
        v
  Dispute status: 'open'
        |
  [Admin assigns dispute to themselves]
        |
        v
  Dispute status: 'under_review'
        |
  >>>>>> INSPECTOR ACTION <<<<<<
  Inspector compares buyer's complaint
  with original inspection report.
  Attaches comparison notes.
        |
        v
  [Admin reviews Inspector's evidence]
        |
  [Admin resolves dispute]
        |
        v
  Dispute status: resolved_buyer_favor / resolved_seller_favor / resolved_partial_refund
```

The inspector's primary task is to **compare the buyer's complaint with the original inspection report** and provide an expert opinion that helps the admin make a decision.

---

## 2. Inspector API Endpoints

### 2.1 Add Inspector Evidence to Dispute

```
PATCH /api/v1/disputes/:id/inspector-evidence
```

| Item | Detail |
|------|--------|
| **Allowed roles** | `inspector` only |
| **Guard** | `JwtAuthGuard` + `RolesGuard` |
| **Path param** | `:id` — dispute MongoDB ObjectId |
| **Request body** | `{ comparisonNotes: string }` |
| **Response** | `{ message: string, data: Dispute }` |

**Request example:**
```json
{
  "comparisonNotes": "So sanh voi bao cao kiem dinh ban dau, khung xe co them 3 vet tray moi khong co trong bao cao. Phanh truoc bi mon nhieu hon muc bao cao. De nghi hoan tien cho nguoi mua."
}
```

**Response example:**
```json
{
  "message": "Inspector evidence added successfully",
  "data": {
    "_id": "...",
    "transactionId": "...",
    "reporterId": "...",
    "reason": "item_not_as_described",
    "status": "under_review",
    "inspectorReport": {
      "inspectorId": "...",
      "reportId": "...",
      "comparisonNotes": "So sanh voi bao cao kiem dinh ban dau..."
    },
    "timeline": [
      { "action": "Dispute opened", "performedBy": "...", "timestamp": "..." },
      { "action": "Assigned to admin", "performedBy": "...", "timestamp": "..." },
      { "action": "Inspector evidence added", "performedBy": "...", "notes": "...", "timestamp": "..." }
    ]
  }
}
```

**What the backend does internally:**
1. Finds the dispute by ID
2. Finds the original transaction linked to the dispute
3. Finds the original inspection report for the bicycle (via `bicycleId` from transaction)
4. Stores the inspector evidence:
   ```js
   dispute.inspectorReport = {
     inspectorId: inspectorId,        // auto from JWT
     reportId: inspection._id,        // auto-linked original report
     comparisonNotes: comparisonNotes, // from request body
   };
   ```
5. Adds a timeline entry
6. Saves and returns the updated dispute

---

### 2.2 View All Disputes (Inspector can also access)

```
GET /api/v1/disputes/admin/all
```

| Item | Detail |
|------|--------|
| **Allowed roles** | `admin`, `inspector` |
| **Query params** | `?status=open&page=1&limit=20` |
| **Response** | Paginated dispute list |

**Response:**
```json
{
  "message": "Disputes retrieved successfully",
  "data": [
    {
      "_id": "...",
      "transactionId": "...",
      "reporterId": "...",
      "reportedUserId": "...",
      "reason": "item_not_as_described",
      "description": "...",
      "evidence": { "photos": ["..."], "videos": ["..."] },
      "status": "under_review",
      "assignedAdminId": "...",
      "inspectorReport": null,
      "timeline": [...],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

---

### 2.3 View Dispute Detail

```
GET /api/v1/disputes/:id
```

| Item | Detail |
|------|--------|
| **Allowed roles** | Any authenticated user |
| **Path param** | `:id` — dispute ObjectId |
| **Response** | `{ message: string, data: Dispute }` |

---

### 2.4 Get Original Inspection Report (for comparison)

These are existing inspection endpoints the inspector should use to access the original report:

#### By inspection ID:
```
GET /api/v1/inspections/:id
```

#### By bicycle ID:
```
GET /api/v1/inspections/bicycle/:bicycleId
```

**Response:**
```json
{
  "message": "Inspection report retrieved successfully",
  "data": {
    "_id": "...",
    "bicycleId": "...",
    "inspectorId": "...",
    "inspectionType": "pre_sale",
    "status": "completed",
    "components": { ... },
    "overallCondition": "...",
    "verdict": "approved",
    "photos": ["..."],
    "notes": "...",
    "completedAt": "..."
  }
}
```

---

## 3. Dispute Data Model (Full Reference)

```typescript
interface Dispute {
  _id: string;
  transactionId: string;          // ref -> Transaction
  reporterId: string;             // ref -> User (buyer who filed)
  reportedUserId?: string;        // ref -> User (seller)
  reason: DisputeReason;          // enum
  description?: string;
  evidence?: {
    photos?: string[];            // buyer's uploaded photos
    videos?: string[];            // buyer's uploaded videos
    documents?: string[];         // buyer's uploaded documents
  };
  inspectorReport?: {             // <<< THIS IS WHAT INSPECTOR FILLS
    inspectorId?: string;         // ref -> User (inspector)
    reportId?: string;            // ref -> InspectionReport (auto-linked)
    comparisonNotes?: string;     // inspector's comparison text
  };
  status: DisputeStatus;
  assignedAdminId?: string;       // ref -> User (admin)
  resolution?: {
    decision?: string;            // admin's decision
    refundAmount?: number;
    penaltyToSeller?: number;
    penaltyToBuyer?: number;
    notes?: string;
    resolvedAt?: Date;
  };
  timeline?: Array<{
    action: string;
    performedBy: string;
    notes?: string;
    timestamp: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
}
```

### DisputeReason enum:
| Value | Vietnamese |
|-------|-----------|
| `item_not_received` | Khong nhan duoc hang |
| `item_not_as_described` | Hang khong dung mo ta |
| `damaged_item` | Hang bi hu hong |
| `counterfeit_parts` | Linh kien gia |
| `seller_unresponsive` | Nguoi ban khong phan hoi |
| `buyer_refusing_delivery` | Nguoi mua tu choi nhan hang |
| `other` | Ly do khac |

### DisputeStatus enum:
| Value | Vietnamese |
|-------|-----------|
| `open` | Moi mo |
| `under_review` | Admin dang xem xet |
| `awaiting_evidence` | Cho bang chung |
| `resolved_buyer_favor` | Giai quyet co loi cho buyer |
| `resolved_seller_favor` | Giai quyet co loi cho seller |
| `resolved_partial_refund` | Hoan tien mot phan |
| `closed` | Da dong |

---

## 4. Suggested Mobile API Service

### `disputeService.js` (or `.ts`)

```js
import apiClient from './apiClient'; // your axios instance

const disputeService = {
  /**
   * Get all disputes (inspector has access)
   * GET /api/v1/disputes/admin/all
   */
  getAllDisputes: (params = {}) =>
    apiClient.get('/api/v1/disputes/admin/all', { params }),

  /**
   * Get dispute detail
   * GET /api/v1/disputes/:id
   */
  getDisputeById: (disputeId) =>
    apiClient.get(`/api/v1/disputes/${disputeId}`),

  /**
   * Add inspector comparison evidence
   * PATCH /api/v1/disputes/:id/inspector-evidence
   */
  addInspectorEvidence: (disputeId, comparisonNotes) =>
    apiClient.patch(`/api/v1/disputes/${disputeId}/inspector-evidence`, {
      comparisonNotes,
    }),

  /**
   * Get original inspection report by bicycle ID
   * GET /api/v1/inspections/bicycle/:bicycleId
   */
  getInspectionByBicycle: (bicycleId) =>
    apiClient.get(`/api/v1/inspections/bicycle/${bicycleId}`),

  /**
   * Get inspection report by ID
   * GET /api/v1/inspections/:id
   */
  getInspectionById: (inspectionId) =>
    apiClient.get(`/api/v1/inspections/${inspectionId}`),
};

export default disputeService;
```

---

## 5. Recommended Mobile UI Screens

### Screen 1: Dispute List

| Feature | Detail |
|---------|--------|
| **Data** | `disputeService.getAllDisputes({ status, page, limit })` |
| **Display** | List of disputes with reason, status badge, date |
| **Filter** | By status (especially `under_review` — disputes needing inspector input) |
| **Action** | Tap -> navigate to Dispute Detail |

### Screen 2: Dispute Detail + Add Evidence

| Feature | Detail |
|---------|--------|
| **Data** | `disputeService.getDisputeById(id)` |
| **Display** | Full dispute info: reason, description, buyer evidence, timeline |
| **Original report** | Load via: `disputeService.getInspectionByBicycle(dispute.transactionId -> bicycleId)` |
| **Inspector action** | TextArea for `comparisonNotes` -> submit via `disputeService.addInspectorEvidence(disputeId, notes)` |
| **Condition** | Show "Add Evidence" button only if: `dispute.inspectorReport === null` or `dispute.inspectorReport.comparisonNotes` is empty |

### Screen 3: Side-by-side Comparison View (Optional/Premium)

| Feature | Detail |
|---------|--------|
| **Left panel** | Original inspection report (photos, condition notes) |
| **Right panel** | Buyer's dispute evidence (photos, description) |
| **Bottom** | Inspector's comparison notes textarea |

---

## 6. Important Notes for Mobile Implementation

1. **Authentication**: All endpoints require JWT Bearer token in headers
2. **Role check**: Backend validates `inspector` role from JWT — no need to pass role in body
3. **Inspector ID**: Auto-extracted from JWT token — no need to send `inspectorId`
4. **Report auto-linking**: Backend automatically links the original `InspectionReport` via `bicycleId` from the transaction — inspector does NOT need to provide `reportId`
5. **Only `comparisonNotes`**: The PATCH endpoint only accepts `comparisonNotes` as the request body field. Nothing else is needed.
6. **Timeline**: After adding evidence, a timeline entry "Inspector evidence added" is automatically created
7. **No evidence upload**: The current backend does NOT support photo/video upload for inspector evidence — only text `comparisonNotes`. If you need image uploads for inspector evidence, that would require a backend change (out of scope).
8. **`PATCH :id/evidence`** (buyer/seller adding evidence) is **commented out** in the backend. DO NOT call this endpoint.
