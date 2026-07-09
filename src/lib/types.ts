export interface Organization {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  employee_count: string | null;
  compliance_frameworks: string[];
  created_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'compliance_manager' | 'security_analyst' | 'employee';
  created_at: string;
}

export interface Policy {
  id: string;
  organization_id: string;
  name: string;
  condition: string;
  action: 'redact' | 'require_approval' | 'block' | 'approve' | 'escalate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  created_at: string;
}

export interface AIProvider {
  id: string;
  organization_id: string;
  provider_name: 'openai' | 'claude' | 'gemini' | 'copilot' | 'llama';
  connected: boolean;
  created_at: string;
}

export interface DetectedEntity {
  type: 'PII' | 'NER' | 'CONTEXT';
  label: string;
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Prompt {
  id: string;
  organization_id: string;
  user_id: string | null;
  user_name: string | null;
  prompt_text: string;
  redacted_text: string | null;
  risk_score: number;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  status: 'safe' | 'redacted' | 'blocked' | 'pending' | 'escalated' | 'approved';
  ai_platform: string | null;
  detected_entities: DetectedEntity[];
  created_at: string;
}

export interface Violation {
  id: string;
  prompt_id: string;
  organization_id: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected_value: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  organization_id: string;
  user_id: string | null;
  user_name: string | null;
  file_name: string;
  file_type: string | null;
  file_size: number;
  original_content: string;
  redacted_content: string | null;
  risk_score: number;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  status: 'safe' | 'redacted' | 'blocked' | 'pending' | 'escalated' | 'approved';
  detected_entities: DetectedEntity[];
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}
