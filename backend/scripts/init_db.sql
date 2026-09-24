-- Anti-Money Laundering (AML) Detection & Graph Analytics Database Schema
-- Compatible with PostgreSQL 14, 15, 16, 17+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    step INTEGER NOT NULL DEFAULT 1,
    type VARCHAR(20) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    
    name_orig VARCHAR(64) NOT NULL,
    old_balance_orig DOUBLE PRECISION NOT NULL,
    new_balance_orig DOUBLE PRECISION NOT NULL,
    
    name_dest VARCHAR(64) NOT NULL,
    old_balance_dest DOUBLE PRECISION NOT NULL,
    new_balance_dest DOUBLE PRECISION NOT NULL,
    
    is_fraud_ground_truth INTEGER DEFAULT 0,
    is_flagged_fraud_ground_truth INTEGER DEFAULT 0,
    
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
    risk_level VARCHAR(16) NOT NULL DEFAULT 'LOW',
    
    flag_reasons JSONB,
    shap_values JSONB,
    plugin_scores JSONB,
    
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS idx_tx_orig ON transactions (name_orig);
CREATE INDEX IF NOT EXISTS idx_tx_dest ON transactions (name_dest);
CREATE INDEX IF NOT EXISTS idx_tx_orig_dest ON transactions (name_orig, name_dest);
CREATE INDEX IF NOT EXISTS idx_tx_risk_score ON transactions (risk_score);
CREATE INDEX IF NOT EXISTS idx_tx_is_suspicious ON transactions (is_suspicious);
CREATE INDEX IF NOT EXISTS idx_tx_risk_level ON transactions (risk_level);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_tx_created_at ON transactions (created_at DESC);

-- 2. Alerts Table (Compliance & Investigator Triage)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    risk_score DOUBLE PRECISION NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    assigned_to VARCHAR(64),
    investigator_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    resolved_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_alerts_tx_id ON alerts (transaction_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status_severity ON alerts (status, severity);

-- 3. Audit Logs Table (Compliance & Chain of Custody)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(32) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    performed_by VARCHAR(64) NOT NULL DEFAULT 'system',
    details JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs (created_at DESC);
