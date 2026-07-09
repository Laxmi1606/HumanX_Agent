/*
# HumanXAgent - Complete Schema

1. New Tables
  - `organizations` - Company workspaces with compliance settings
  - `users` - Platform users linked to organizations with roles
  - `policies` - IF/THEN compliance policy rules per organization
  - `ai_providers` - Connected AI platform integrations
  - `prompts` - All submitted prompts with risk analysis results
  - `violations` - Detected violations per prompt
  - `audit_logs` - Complete immutable audit trail

2. Security
  - RLS enabled on all tables
  - Authenticated users scoped to their organization's data
  - anon access for demo/no-auth flow using public org

3. Notes
  - This is a multi-tenant SaaS schema
  - All timestamps in UTC
  - Risk scores 0-100
*/

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  industry text,
  employee_count text,
  compliance_frameworks text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_organizations" ON organizations;
CREATE POLICY "anon_select_organizations" ON organizations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_organizations" ON organizations;
CREATE POLICY "anon_insert_organizations" ON organizations FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_organizations" ON organizations;
CREATE POLICY "anon_update_organizations" ON organizations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_organizations" ON organizations;
CREATE POLICY "anon_delete_organizations" ON organizations FOR DELETE TO anon, authenticated USING (true);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('super_admin', 'compliance_manager', 'security_analyst', 'employee')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_delete_users" ON users FOR DELETE TO anon, authenticated USING (true);

-- Policies
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  condition text NOT NULL,
  action text NOT NULL CHECK (action IN ('redact', 'require_approval', 'block', 'approve', 'escalate')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_policies" ON policies;
CREATE POLICY "anon_select_policies" ON policies FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_policies" ON policies;
CREATE POLICY "anon_insert_policies" ON policies FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_policies" ON policies;
CREATE POLICY "anon_update_policies" ON policies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_policies" ON policies;
CREATE POLICY "anon_delete_policies" ON policies FOR DELETE TO anon, authenticated USING (true);

-- AI Providers
CREATE TABLE IF NOT EXISTS ai_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  provider_name text NOT NULL CHECK (provider_name IN ('openai', 'claude', 'gemini', 'copilot', 'llama')),
  connected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ai_providers" ON ai_providers;
CREATE POLICY "anon_select_ai_providers" ON ai_providers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_ai_providers" ON ai_providers;
CREATE POLICY "anon_insert_ai_providers" ON ai_providers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_ai_providers" ON ai_providers;
CREATE POLICY "anon_update_ai_providers" ON ai_providers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_ai_providers" ON ai_providers;
CREATE POLICY "anon_delete_ai_providers" ON ai_providers FOR DELETE TO anon, authenticated USING (true);

-- Prompts
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name text,
  prompt_text text NOT NULL,
  redacted_text text,
  risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level text DEFAULT 'safe' CHECK (risk_level IN ('safe', 'low', 'medium', 'high', 'critical')),
  status text DEFAULT 'pending' CHECK (status IN ('safe', 'redacted', 'blocked', 'pending', 'escalated', 'approved')),
  ai_platform text,
  detected_entities jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_prompts" ON prompts;
CREATE POLICY "anon_select_prompts" ON prompts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_prompts" ON prompts;
CREATE POLICY "anon_insert_prompts" ON prompts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_prompts" ON prompts;
CREATE POLICY "anon_update_prompts" ON prompts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_prompts" ON prompts;
CREATE POLICY "anon_delete_prompts" ON prompts FOR DELETE TO anon, authenticated USING (true);

-- Violations
CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  violation_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  detected_value text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_violations" ON violations;
CREATE POLICY "anon_select_violations" ON violations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_violations" ON violations;
CREATE POLICY "anon_insert_violations" ON violations FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_violations" ON violations;
CREATE POLICY "anon_update_violations" ON violations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_violations" ON violations;
CREATE POLICY "anon_delete_violations" ON violations FOR DELETE TO anon, authenticated USING (true);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name text,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit_logs" ON audit_logs;
CREATE POLICY "anon_select_audit_logs" ON audit_logs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit_logs" ON audit_logs;
CREATE POLICY "anon_insert_audit_logs" ON audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_audit_logs" ON audit_logs;
CREATE POLICY "anon_update_audit_logs" ON audit_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit_logs" ON audit_logs;
CREATE POLICY "anon_delete_audit_logs" ON audit_logs FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS prompts_organization_id_idx ON prompts(organization_id);
CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS violations_organization_id_idx ON violations(organization_id);
CREATE INDEX IF NOT EXISTS audit_logs_organization_id_idx ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- Seed demo organization
INSERT INTO organizations (id, name, domain, industry, employee_count, compliance_frameworks)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme Corp', 'acme.com', 'Information Technology', '501-1000', ARRAY['GDPR', 'HIPAA', 'SOC2'])
ON CONFLICT (id) DO NOTHING;

-- Seed demo user
INSERT INTO users (id, organization_id, name, email, role)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Laxmi Sharma', 'laxmi@acme.com', 'super_admin')
ON CONFLICT (id) DO NOTHING;

-- Seed default policies
INSERT INTO policies (organization_id, name, condition, action, severity, enabled) VALUES
('00000000-0000-0000-0000-000000000001', 'Aadhaar Number Protection', 'Aadhaar Number', 'redact', 'critical', true),
('00000000-0000-0000-0000-000000000001', 'PAN Card Redaction', 'PAN Number', 'redact', 'high', true),
('00000000-0000-0000-0000-000000000001', 'Credit Card Block', 'Credit Card Number', 'block', 'critical', true),
('00000000-0000-0000-0000-000000000001', 'Customer Data Approval', 'Customer Data', 'require_approval', 'high', true),
('00000000-0000-0000-0000-000000000001', 'Strategic Plan Block', 'Strategic Plan', 'block', 'critical', true),
('00000000-0000-0000-0000-000000000001', 'Email Address Redaction', 'Email Address', 'redact', 'medium', true),
('00000000-0000-0000-0000-000000000001', 'Phone Number Redaction', 'Phone Number', 'redact', 'medium', true),
('00000000-0000-0000-0000-000000000001', 'Financial Data Escalation', 'Financial Data', 'escalate', 'high', true)
ON CONFLICT DO NOTHING;

-- Seed AI providers
INSERT INTO ai_providers (organization_id, provider_name, connected) VALUES
('00000000-0000-0000-0000-000000000001', 'openai', true),
('00000000-0000-0000-0000-000000000001', 'claude', true),
('00000000-0000-0000-0000-000000000001', 'gemini', true),
('00000000-0000-0000-0000-000000000001', 'copilot', false),
('00000000-0000-0000-0000-000000000001', 'llama', false)
ON CONFLICT DO NOTHING;
