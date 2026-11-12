# BATON Disaster Recovery, Backup & Restoration Runbook

This document defines the high-availability disaster recovery, backup schedules, and point-in-time recovery procedures for BATON.

---

## 1. Architecture Overview & Persistence Layers

BATON relies on three data persistence tiers:
1. **Relational & Vector Database**:
   - Production: Managed PostgreSQL with the `pgvector` extension.
   - Development / Staging: SQLite with file-based vector storage (`baton.db`).
2. **Document & Evidence Storage**:
   - S3-compatible private object storage for original uploaded artifacts (PDF, DOCX, CSV, JSON).
3. **Cache & Task Queues**:
   - Redis for Celery background tasks, session cache, and rate-limiting counters.

---

## 2. Backup Schedules & Retention Policy

| Backup Type | Frequency | Retention Window | Storage Target | Encryption |
|-------------|-----------|------------------|----------------|------------|
| Full Database Dump | Daily (02:00 UTC) | 90 Days | Encrypted S3 / Glacier | AES-256-GCM |
| WAL Continuous Archiving | Continuous (5 min) | 14 Days | S3 Bucket (Versioned) | KMS Managed Key |
| Document Blob Store | Real-time S3 Mirror | Permanent | Multi-region Replica | SSE-S3 / KMS |
| Environment Config | On Every Deployment | GitOps (Encrypted Vault) | Private Parameter Store | Zero-Commit |

---

## 3. Automated Backup Commands

### PostgreSQL Daily Automated Backup Script
```bash
#!/bin/bash
set -eo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/baton"
DB_NAME="${POSTGRES_DB:-baton_db}"
S3_BUCKET="${BACKUP_S3_BUCKET:-s3://baton-vault-backups}"

mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/baton_${DB_NAME}_${TIMESTAMP}.dump"

echo "[BATON BACKUP] Starting database snapshot at $(date)..."

# Run custom format pg_dump (includes schemas, pgvector indices, and tables)
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "${POSTGRES_HOST:-localhost}" \
  -U "${POSTGRES_USER:-postgres}" \
  -F c \
  -b \
  -v \
  -f "$BACKUP_FILE" \
  "$DB_NAME"

echo "[BATON BACKUP] Uploading snapshot to encrypted cold storage..."
aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/db/" --sse aws:kms

# Purge local backups older than 7 days
find "$BACKUP_DIR" -type f -mtime +7 -name "*.dump" -delete
echo "[BATON BACKUP] Backup completed successfully."
```

### SQLite Snapshot (Local / Staging)
```bash
sqlite3 baton.db ".backup 'baton_backup_$(date +%Y%m%d).db'"
```

---

## 4. Disaster Recovery & Restoration Procedures

### Scenario A: Full PostgreSQL Database Restoration from Cold Dump
1. Provision a new PostgreSQL instance with the `vector` extension enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
2. Pull the latest verified snapshot from S3:
   ```bash
   aws s3 cp s3://baton-vault-backups/db/baton_baton_db_latest.dump ./latest.dump
   ```
3. Run `pg_restore`:
   ```bash
   PGPASSWORD=$POSTGRES_PASSWORD pg_restore \
     -h $POSTGRES_HOST \
     -U $POSTGRES_USER \
     -d baton_db \
     --clean \
     --if-exists \
     -v ./latest.dump
   ```
4. Run Alembic migration check:
   ```bash
   cd backend
   alembic upgrade head
   ```

### Scenario B: Point-In-Time Recovery (PITR via WAL-G)
1. Stop the backend web service:
   ```bash
   docker compose stop backend
   ```
2. Restore base backup and configure recovery target time in `recovery.conf` / `postgresql.conf`:
   ```text
   restore_command = 'wal-g wal-fetch "%f" "%p"'
   recovery_target_time = '2026-11-12 18:30:00 UTC'
   recovery_target_action = 'promote'
   ```
3. Start database and allow WAL replay to reach the specified timestamp.
4. Restart the backend service and inspect `/health` endpoint.

---

## 5. Recovery Time Objective (RTO) and Recovery Point Objective (RPO)

- **RTO (Recovery Time Objective)**: < 30 minutes from catastrophe notification.
- **RPO (Recovery Point Objective)**: < 5 minutes (governed by continuous WAL archiving).

---

## 6. Verification and Health Audits

Run the recovery verification script to test schema consistency:
```bash
pytest backend/tests/
```
Verify all tables, relationships, and grounding guard constraints match production expectations.
