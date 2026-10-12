# JHF LAPTOP ZONE ADMIN PANEL — SECURITY SPECIFICATION

## Data Invariants
1. **Zero-Trust Identity**: User roles are verified exclusively from the Firestore document `/users/{uid}`, never from client-side state or unverified tokens.
2. **Immutable Audit Trails**: `inventoryTransactions` and `activityLogs` are strictly append-only. Updates and deletions are forbidden (`allow update, delete: if false;`).
3. **PII Protection**: Customer phone numbers, addresses, and full order details are accessible only by authenticated staff with roles `super_admin`, `admin`, `sales_staff`, or `customer_support`.
4. **Soft Delete Protocol**: Products cannot be permanently purged except by `super_admin`. Regular deletes set `isDeleted: true`, `deletedAt`, `deletedBy`, and `deleteReason`.
5. **Cost Preservation Invariant**: Sales records capture `purchaseCost` snapshot at the moment of sale, ensuring subsequent product purchase price changes do not rewrite historical profit numbers.

## The Dirty Dozen Payloads & Mitigation

| # | Attack Vector | Malicious Payload Attempt | Hardened Defense | Status |
|---|---------------|---------------------------|-------------------|--------|
| 1 | Role Elevation | Non-admin sends `role: "super_admin"` in `users/{uid}` | Rule requires `isSuperAdmin()` to mutate `role` key | BLOCKED |
| 2 | Ghost Field Injection | Add `isAdmin: true` to `/products/{id}` | Default-deny & strict collection match rules | BLOCKED |
| 3 | Blanket Public PII Read | Unauthenticated GET `/customers` | Requires `isSignedIn()` and specific staff roles | BLOCKED |
| 4 | Inventory Tampering | User tries to edit or delete `/inventoryTransactions/{id}` | Explicit `allow update, delete: if false;` | BLOCKED |
| 5 | Audit Trail Erasure | User attempts to delete `/activityLogs/{id}` | Explicit `allow update, delete: if false;` | BLOCKED |
| 6 | Financial Leakage | Viewer role requests `/expenses` collection | Restricted strictly to `isAdmin()` and `isSuperAdmin()` | BLOCKED |
| 7 | Spoofed Author UID | Attacker sends order with fake `createdBy` | Validates `request.auth.uid` against author record | BLOCKED |
| 8 | Settings Overwrite | Sales staff attempts to alter WhatsApp hotlines in `/settings` | Restricted strictly to `isSuperAdmin()` | BLOCKED |
| 9 | Direct Stock Manipulation | Bypassing stock transaction to zero-out inventory | Enforced transaction logging on inventory balance update | BLOCKED |
| 10| Anonymous Order Erasure | DELETE request to `/orders/{id}` | Only `isSuperAdmin()` can perform hard order deletion | BLOCKED |
| 11| Customer Impersonation | Modifying customer purchase history directly | Calculated dynamically from confirmed orders | BLOCKED |
| 12| Permanent Product Purge | Sales staff tries to hard delete product document | Only `super_admin` permitted to execute hard delete | BLOCKED |
