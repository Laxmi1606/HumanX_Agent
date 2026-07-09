import type { DetectedEntity } from './types';

interface PIIPattern {
  type: 'PII' | 'NER' | 'CONTEXT';
  label: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  replacement: string;
}

const PII_PATTERNS: PIIPattern[] = [
  { type: 'PII', label: 'Aadhaar Number', pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g, severity: 'critical', replacement: '[AADHAAR REDACTED]' },
  { type: 'PII', label: 'PAN Number', pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g, severity: 'high', replacement: '[PAN REDACTED]' },
  { type: 'PII', label: 'Credit Card', pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, severity: 'critical', replacement: '[CC REDACTED]' },
  { type: 'PII', label: 'Bank Account', pattern: /\b\d{9,18}\b/g, severity: 'high', replacement: '[BANK REDACTED]' },
  { type: 'PII', label: 'Email Address', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, severity: 'medium', replacement: '[EMAIL REDACTED]' },
  { type: 'PII', label: 'Phone Number', pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{4,10}/g, severity: 'medium', replacement: '[PHONE REDACTED]' },
];

const CONTEXT_PATTERNS: PIIPattern[] = [
  { type: 'CONTEXT', label: 'Strategic Plan', pattern: /\b(strategic\s+plan|expansion\s+plan|merger|acquisition|IPO\s+plan)\b/gi, severity: 'critical', replacement: '[CONFIDENTIAL: Strategic plan redacted]' },
  { type: 'CONTEXT', label: 'Financial Data', pattern: /\b(financial\s+results|revenue\s+figures|profit\s+margins|Q[1-4]\s+earnings|financial\s+statement)\b/gi, severity: 'high', replacement: '[CONFIDENTIAL: Financial data redacted]' },
  { type: 'CONTEXT', label: 'Customer Data', pattern: /\b(customer\s+data|client\s+information|customer\s+list|customer\s+database)\b/gi, severity: 'high', replacement: '[CONFIDENTIAL: Customer data redacted]' },
  { type: 'CONTEXT', label: 'Healthcare Data', pattern: /\b(HIPAA|patient\s+records|medical\s+records|health\s+data|diagnosis)\b/gi, severity: 'medium', replacement: '[PHI REDACTED]' },
  { type: 'CONTEXT', label: 'Source Code', pattern: /\b(source\s+code|API\s+key|secret\s+key|password|credential)\b/gi, severity: 'high', replacement: '[SECURITY: Credential redacted]' },
];

const NER_PATTERNS: PIIPattern[] = [
  { type: 'NER', label: 'Person Name', pattern: /\b(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, severity: 'medium', replacement: '[NAME REDACTED]' },
  { type: 'NER', label: 'Person Name', pattern: /\bcustomer\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g, severity: 'medium', replacement: 'customer [NAME REDACTED]' },
];

const ALL_PATTERNS = [...PII_PATTERNS, ...CONTEXT_PATTERNS, ...NER_PATTERNS];

const SEVERITY_SCORES: Record<string, number> = {
  critical: 40,
  high: 25,
  medium: 12,
  low: 5,
};

export interface AnalysisResult {
  redactedText: string;
  detectedEntities: DetectedEntity[];
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  status: 'safe' | 'redacted' | 'blocked' | 'pending' | 'escalated' | 'approved';
}

export function analyzePrompt(text: string): AnalysisResult {
  let redactedText = text;
  const detectedEntities: DetectedEntity[] = [];
  let maxSeverityScore = 0;
  let hasCritical = false;
  let hasHigh = false;

  for (const p of ALL_PATTERNS) {
    const matches = [...text.matchAll(p.pattern)];
    for (const match of matches) {
      const value = match[0];
      if (!value || value.trim().length < 2) continue;

      detectedEntities.push({
        type: p.type,
        label: p.label,
        value: value,
        severity: p.severity,
      });

      redactedText = redactedText.replace(value, p.replacement);

      const score = SEVERITY_SCORES[p.severity] || 0;
      if (score > maxSeverityScore) maxSeverityScore = score;
      if (p.severity === 'critical') hasCritical = true;
      if (p.severity === 'high') hasHigh = true;
    }
  }

  const entityCount = detectedEntities.length;
  let riskScore = Math.min(100, maxSeverityScore + entityCount * 5);

  let riskLevel: AnalysisResult['riskLevel'] = 'safe';
  let status: AnalysisResult['status'] = 'safe';

  if (riskScore >= 80 || hasCritical) {
    riskLevel = 'critical';
    status = 'blocked';
  } else if (riskScore >= 60 || hasHigh) {
    riskLevel = 'high';
    status = detectedEntities.some(e => e.type === 'CONTEXT') ? 'escalated' : 'redacted';
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
    status = 'redacted';
  } else if (riskScore >= 10) {
    riskLevel = 'low';
    status = 'redacted';
  }

  if (detectedEntities.length === 0) {
    riskScore = Math.max(0, Math.floor(Math.random() * 8));
    riskLevel = 'safe';
    status = 'safe';
    redactedText = text;
  }

  return {
    redactedText,
    detectedEntities,
    riskScore,
    riskLevel,
    status,
  };
}
