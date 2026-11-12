# BATON Administrator Guide

This guide is designed for Platform Owners, Security Administrators, and Chief Architects managing BATON.

---

## 1. Multi-Tenant Organization Management

BATON enforces strict multi-tenancy at every database query and caching boundary:
- Each organization receives a unique immutable identifier and slug (`/org/<slug>`).
- Cross-tenant data access is mathematically prohibited by mandatory `organization_id` filters on all database sessions.

### Setting Up Organizations
1. Access the Registration portal at `/register` or invoke the admin CLI.
2. Provide your corporate domain and organization name.
3. The initializing administrator is automatically granted the `owner` role.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Permission / Action | Owner | Admin | Auditor | Member | Successor |
|---------------------|:-----:|:-----:|:-------:|:------:|:---------:|
| Manage Organization Settings | Yes | No | No | No | No |
| Invite / Deactivate Users | Yes | Yes | No | No | No |
| Create / Archive Projects | Yes | Yes | No | No | No |
| Ingest Documents & Repos | Yes | Yes | Read-Only | Yes | No |
| Approve / Dispute Claims | Yes | Yes | Yes | No | No |
| Launch Exit Interviews | Yes | Yes | Read-Only | No | No |
| Answer Offboarding Wizard | Yes | Yes | No | Yes | No |
| Compile Handover Packs | Yes | Yes | Read-Only | Yes | No |
| Mint QR Knowledge Bridges | Yes | Yes | No | No | No |
| Redeem QR Bridges | Yes | Yes | Yes | Yes | Yes |
| Revoke QR Bridges | Yes | Yes | No | No | No |
| View Immutable Audit Logs | Yes | Yes | Yes | No | No |

---

## 3. Security Auditing & Compliance Tracking

Every security-sensitive operation writes an immutable record to the `audit_logs` table:
- **Actions tracked**: `TENANT_REGISTERED`, `USER_INVITED`, `DOCUMENT_INGESTED`, `CLAIM_APPROVED`, `CLAIM_DISPUTED`, `INTERVIEW_ANSWERED`, `HANDOVER_GENERATED`, `QR_BRIDGE_MINTED`, `QR_BRIDGE_REVOKED`, `PASSWORD_RESET_REQUESTED`.
- Each log contains: `organization_id`, `user_id`, `user_email`, `timestamp`, `ip_address`, `resource_type`, `resource_id`, and a JSON payload detailing exact mutations.
- **Audit View**: Accessible at `/audit` for Owners, Admins, and Compliance Auditors.

---

## 4. QR Knowledge Bridge Governance

When an engineer departs, the QR Knowledge Bridge facilitates secure, frictionless handover transfer:
1. **Configurable TTL**: Standard TTL is 72 hours; maximum recommended window is 168 hours (7 days).
2. **Access Capping**: Default max redemptions = 5 (single-use or multi-use allowed).
3. **Passphrase Protection**: Recommended for high-security domains.
4. **Emergency Revocation**: If a token is compromised or leaked, an Administrator can immediately revoke it from the Handover or QR Bridge screen. All subsequent scans fail instantly.
