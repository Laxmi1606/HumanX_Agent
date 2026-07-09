/*
# Add documents table for document upload and redaction

1. New Tables
  - `documents` - Uploaded documents with PII redaction analysis
  - `id` (uuid, primary key)
  - `organization_id` (uuid, FK to organizations)
  - `user_id` (uuid, FK to users)
  - `user_name` (text)
  - `file_name` (text, original file name)
  - `file_type` (text, MIME type)
  - `file_size` (bigint, bytes)
  - `original_content` (text, extracted text content)
  - `redacted_content` (text, redacted version)
  - `risk_score` (integer, 0-100)
  - `risk_level` (text, safe/low/medium/high/critical)
  - `status` (text, safe/redacted/blocked/escalated)
  - `detected_entities` (jsonb, array of detected PII entities)
  - `created_at` (timestamptz)

2. Security
  - Enable RLS on `documents`.
  - Allow anon + authenticated CRUD (single-tenant demo mode).

3. Notes
  - Documents are analyzed with the same PII engine as prompts.
  - Original content is stored for audit; redacted version is what would be shared.
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name text,
  file_name text NOT NULL,
  file_type text,
  file_size bigint DEFAULT 0,
  original_content text NOT NULL,
  redacted_content text,
  risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level text DEFAULT 'safe' CHECK (risk_level IN ('safe', 'low', 'medium', 'high', 'critical')),
  status text DEFAULT 'pending' CHECK (status IN ('safe', 'redacted', 'blocked', 'pending', 'escalated', 'approved')),
  detected_entities jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_documents" ON documents;
CREATE POLICY "anon_insert_documents" ON documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_documents" ON documents;
CREATE POLICY "anon_update_documents" ON documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_documents" ON documents;
CREATE POLICY "anon_delete_documents" ON documents FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS documents_organization_id_idx ON documents(organization_id);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at DESC);
