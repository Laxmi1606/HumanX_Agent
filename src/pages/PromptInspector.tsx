import { useState } from 'react';
import { FileSearch, Send, Shield, Eye, Ban, AlertTriangle, CheckCircle2, Loader2, Sparkles, ArrowRight, FileText, UploadCloud } from 'lucide-react';
import Topbar from '../components/Topbar';
import DocumentUpload from '../components/DocumentUpload';
import { supabase, ORG_ID, DEMO_USER_ID, DEMO_USER_NAME } from '../lib/supabase';
import { analyzePrompt } from '../lib/piiAnalyzer';
import type { Prompt, Document, DetectedEntity } from '../lib/types';

const riskColors: Record<string, string> = {
  safe: '#10b981',
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const statusConfig: Record<string, { icon: typeof Shield; label: string; color: string }> = {
  safe: { icon: CheckCircle2, label: 'Safe - Approved', color: '#10b981' },
  redacted: { icon: Eye, label: 'PII Redacted', color: '#3b82f6' },
  blocked: { icon: Ban, label: 'Blocked', color: '#ef4444' },
  escalated: { icon: AlertTriangle, label: 'Escalated for Review', color: '#f97316' },
  approved: { icon: CheckCircle2, label: 'Approved', color: '#10b981' },
  pending: { icon: Loader2, label: 'Pending Review', color: '#f59e0b' },
};

const samplePrompts = [
  'Generate a report for customer John Doe with PAN ABCDE1234F and bank account 12345678901 regarding his loan details.',
  'Help me draft an email to Rahul Mehta at rahul.mehta@example.com regarding his Aadhaar 1234 5678 9012 verification issue.',
  'Summarize Q3 financial results and our strategic expansion plan for Southeast Asia.',
  'Write an email to the marketing team about our new product launch next quarter.',
];

type Tab = 'prompt' | 'document';
type ResultType = 'prompt' | 'document';

interface ScanResult {
  type: ResultType;
  prompt?: Prompt;
  document?: Document;
}

export default function PromptInspector() {
  const [tab, setTab] = useState<Tab>('prompt');
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('OpenAI');
  const [docFile, setDocFile] = useState<{ name: string; type: string; size: number; content: string } | null>(null);

  const handleAnalyzePrompt = async () => {
    if (!input.trim()) return;
    setAnalyzing(true);
    setResult(null);

    await new Promise(r => setTimeout(r, 900));

    const analysis = analyzePrompt(input);

    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      organization_id: ORG_ID,
      user_id: DEMO_USER_ID,
      user_name: DEMO_USER_NAME,
      prompt_text: input,
      redacted_text: analysis.redactedText,
      risk_score: analysis.riskScore,
      risk_level: analysis.riskLevel,
      status: analysis.status,
      ai_platform: selectedPlatform,
      detected_entities: analysis.detectedEntities,
      created_at: new Date().toISOString(),
    };

    await supabase.from('prompts').insert({
      organization_id: ORG_ID,
      user_id: DEMO_USER_ID,
      user_name: DEMO_USER_NAME,
      prompt_text: input,
      redacted_text: analysis.redactedText,
      risk_score: analysis.riskScore,
      risk_level: analysis.riskLevel,
      status: analysis.status,
      ai_platform: selectedPlatform,
      detected_entities: analysis.detectedEntities,
    });

    for (const entity of analysis.detectedEntities) {
      await supabase.from('violations').insert({
        prompt_id: newPrompt.id,
        organization_id: ORG_ID,
        violation_type: entity.label,
        severity: entity.severity,
        detected_value: entity.value,
      });
    }

    await supabase.from('audit_logs').insert({
      organization_id: ORG_ID,
      user_id: DEMO_USER_ID,
      user_name: DEMO_USER_NAME,
      action: analysis.status === 'safe' ? 'PROMPT_SAFE' : analysis.status === 'blocked' ? 'PROMPT_BLOCKED' : analysis.status === 'escalated' ? 'PROMPT_ESCALATED' : 'PROMPT_REDACTED',
      resource_type: 'prompt',
      details: { risk_score: analysis.riskScore, entities: analysis.detectedEntities.length },
    });

    const scanResult: ScanResult = { type: 'prompt', prompt: newPrompt };
    setResult(scanResult);
    setHistory([scanResult, ...history].slice(0, 10));
    setAnalyzing(false);
  };

  const handleAnalyzeDocument = async () => {
    if (!docFile) return;
    setAnalyzing(true);
    setResult(null);

    await new Promise(r => setTimeout(r, 1200));

    const analysis = analyzePrompt(docFile.content);

    const newDoc: Document = {
      id: crypto.randomUUID(),
      organization_id: ORG_ID,
      user_id: DEMO_USER_ID,
      user_name: DEMO_USER_NAME,
      file_name: docFile.name,
      file_type: docFile.type,
      file_size: docFile.size,
      original_content: docFile.content,
      redacted_content: analysis.redactedText,
      risk_score: analysis.riskScore,
      risk_level: analysis.riskLevel,
      status: analysis.status,
      detected_entities: analysis.detectedEntities,
      created_at: new Date().toISOString(),
    };

    await supabase.from('documents').insert({
      organization_id: ORG_ID,
      user_id: DEMO_USER_ID,
      user_name: DEMO_USER_NAME,
      file_name: docFile.name,
      file_type: docFile.type,
      file_size: docFile.size,
      original_content: docFile.content,
      redacted_content: analysis.redactedText,
      risk_score: analysis.riskScore,
      risk_level: analysis.riskLevel,
      status: analysis.status,
      detected_entities: analysis.detectedEntities,
    });

    for (const entity of analysis.detectedEntities) {
      await supabase.from('violations').insert({
        prompt_id: null,
        organization_id: ORG_ID,
        violation_type: entity.label,
        severity: entity.severity,
        detected_value: entity.value,
      });
    }

    await supabase.from('audit_logs').insert({
      organization_id: ORG_ID,
      user_id: DEMO_USER_ID,
      user_name: DEMO_USER_NAME,
      action: analysis.status === 'safe' ? 'DOCUMENT_SAFE' : analysis.status === 'blocked' ? 'DOCUMENT_BLOCKED' : analysis.status === 'escalated' ? 'DOCUMENT_ESCALATED' : 'DOCUMENT_REDACTED',
      resource_type: 'document',
      details: { file_name: docFile.name, risk_score: analysis.riskScore, entities: analysis.detectedEntities.length },
    });

    const scanResult: ScanResult = { type: 'document', document: newDoc };
    setResult(scanResult);
    setHistory([scanResult, ...history].slice(0, 10));
    setDocFile(null);
    setAnalyzing(false);
  };

  const loadSample = (s: string) => {
    setInput(s);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const truncateContent = (content: string, max: number = 500) => {
    if (content.length <= max) return content;
    return content.slice(0, max) + '\n... [truncated for display]';
  };

  return (
    <div>
      <Topbar title="Prompt Inspector" subtitle="Real-time PII detection and redaction" />
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <FileSearch className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Content Analysis</h3>
                  <p className="text-xs text-text-muted">Analyze prompts or uploaded documents for PII and compliance</p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex items-center gap-1 p-1 bg-bg-elevated rounded-lg mb-4 w-fit">
                <button
                  onClick={() => setTab('prompt')}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                    tab === 'prompt' ? 'bg-blue-500/15 text-blue-400' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Prompt
                </button>
                <button
                  onClick={() => setTab('document')}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                    tab === 'document' ? 'bg-blue-500/15 text-blue-400' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Document Upload
                </button>
              </div>

              {/* Prompt tab */}
              {tab === 'prompt' && (
                <>
                  {/* Platform selector */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-text-muted">AI Platform:</span>
                    {['OpenAI', 'Claude', 'Gemini'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPlatform(p)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          selectedPlatform === p
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-bg-elevated text-text-secondary border border-border hover:border-border-light'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type or paste a prompt here..."
                    className="w-full h-40 p-4 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-colors resize-none font-mono"
                    disabled={analyzing}
                  />

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Try a sample:</span>
                      {samplePrompts.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => loadSample(s)}
                          className="px-2.5 py-1 rounded-md text-xs bg-bg-elevated border border-border text-text-secondary hover:border-blue-500/30 hover:text-blue-400 transition-colors"
                        >
                          Sample {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleAnalyzePrompt}
                      disabled={!input.trim() || analyzing}
                      className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Analyze Prompt
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Document tab */}
              {tab === 'document' && (
                <>
                  <DocumentUpload onFileReady={setDocFile} disabled={analyzing} />

                  {docFile && !analyzing && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-text-muted">
                        Ready to scan: <span className="text-text-primary font-medium">{docFile.name}</span> ({formatSize(docFile.size)})
                      </div>
                      <button
                        onClick={handleAnalyzeDocument}
                        className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FileSearch className="w-4 h-4" />
                        Scan Document
                      </button>
                    </div>
                  )}

                  {analyzing && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      Scanning document for confidential content...
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Analyzing state */}
            {analyzing && (
              <div className="glass-card rounded-2xl p-8">
                <div className="flex items-center justify-center gap-3 text-text-secondary">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-500/20" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {tab === 'prompt' ? 'Scanning for PII...' : 'Scanning document...'}
                    </p>
                    <p className="text-xs text-text-muted">Pattern matching + NER analysis</p>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  {['Pattern matching (Aadhaar, PAN, CC...)', 'Named Entity Recognition', 'Contextual data detection', 'Policy evaluation'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-muted animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result panel */}
            {result && !analyzing && (
              <div className="space-y-4 animate-fade-in">
                {/* Risk score */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold">
                      {result.type === 'document' ? 'Document Risk Assessment' : 'Risk Assessment'}
                    </h3>
                    <span className="text-xs text-text-muted">
                      {result.type === 'document' && result.document
                        ? `${result.document.file_name} • ${new Date(result.document.created_at).toLocaleString()}`
                        : result.prompt && new Date(result.prompt.created_at).toLocaleString()
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Score gauge */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#1e2940" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke={riskColors[result.type === 'document' ? result.document!.risk_level : result.prompt!.risk_level]}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${((result.type === 'document' ? result.document!.risk_score : result.prompt!.risk_score) / 100) * 264} 264`}
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold" style={{ color: riskColors[result.type === 'document' ? result.document!.risk_level : result.prompt!.risk_level] }}>
                          {result.type === 'document' ? result.document!.risk_score : result.prompt!.risk_score}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase">Risk</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex-1">
                      {(() => {
                        const status = result.type === 'document' ? result.document!.status : result.prompt!.status;
                        const cfg = statusConfig[status];
                        const Icon = cfg.icon;
                        return (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                              <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                              <p className="text-xs text-text-muted">Action taken automatically</p>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: riskColors[result.type === 'document' ? result.document!.risk_level : result.prompt!.risk_level] }} />
                          <span className="text-xs text-text-secondary capitalize">Risk: {result.type === 'document' ? result.document!.risk_level : result.prompt!.risk_level}</span>
                        </div>
                        {result.type === 'prompt' && (
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-text-muted" />
                            <span className="text-xs text-text-secondary">{result.prompt!.ai_platform}</span>
                          </div>
                        )}
                        {result.type === 'document' && (
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-text-muted" />
                            <span className="text-xs text-text-secondary">{formatSize(result.document!.file_size)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-text-muted" />
                          <span className="text-xs text-text-secondary">
                            {(result.type === 'document' ? result.document!.detected_entities : result.prompt!.detected_entities).length} entities
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detected entities */}
                {(() => {
                  const entities = (result.type === 'document' ? result.document!.detected_entities : result.prompt!.detected_entities) as DetectedEntity[];
                  return entities.length > 0 && (
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="text-base font-semibold mb-4">Detected Entities ({entities.length})</h3>
                      <div className="space-y-2">
                        {entities.map((e: DetectedEntity, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated/50">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                              style={{ background: `${riskColors[e.severity]}15`, color: riskColors[e.severity] }}
                            >
                              {e.type}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-text-primary font-medium">{e.label}</p>
                              <p className="text-xs text-text-muted font-mono truncate">{e.value}</p>
                            </div>
                            <span
                              className="px-2.5 py-1 rounded-md text-xs font-medium capitalize"
                              style={{ background: `${riskColors[e.severity]}15`, color: riskColors[e.severity] }}
                            >
                              {e.severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Before/After comparison */}
                {(() => {
                  const originalText = result.type === 'document' ? result.document!.original_content : result.prompt!.prompt_text;
                  const redactedText = result.type === 'document' ? result.document!.redacted_content : result.prompt!.redacted_text;
                  const entities = (result.type === 'document' ? result.document!.detected_entities : result.prompt!.detected_entities) as DetectedEntity[];

                  if (!redactedText || redactedText === originalText || entities.length === 0) return null;

                  return (
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="text-base font-semibold mb-4">
                        {result.type === 'document' ? 'Document Redaction Result' : 'Redaction Result'}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-text-muted mb-1.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            {result.type === 'document' ? 'Original Document' : 'Original Prompt'}
                          </p>
                          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-sm text-text-secondary font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {truncateContent(originalText)}
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className="w-4 h-4 text-text-muted rotate-90" />
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {result.type === 'document' ? 'Redacted Document (safe to share)' : 'Redacted Prompt (sent to AI)'}
                          </p>
                          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-sm text-text-primary font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {truncateContent(redactedText)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Safe state */}
                {(() => {
                  const entities = (result.type === 'document' ? result.document!.detected_entities : result.prompt!.detected_entities) as DetectedEntity[];
                  return entities.length === 0 && (
                    <div className="glass-card rounded-2xl p-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-400">No sensitive data detected</p>
                          <p className="text-xs text-text-muted">
                            {result.type === 'document' ? 'This document is safe to share with AI platforms.' : 'This prompt is safe to send to the AI platform.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* History sidebar */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold mb-4">Recent Scans</h3>
              {history.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">No content analyzed yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-bg-elevated/50 hover:bg-bg-elevated transition-colors cursor-pointer"
                      onClick={() => setResult(h)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {h.type === 'document' ? (
                            <FileText className="w-3 h-3 text-text-muted" />
                          ) : (
                            <Send className="w-3 h-3 text-text-muted" />
                          )}
                          <span className="text-xs text-text-muted">
                            {h.type === 'document' ? h.document!.file_name : h.prompt!.ai_platform}
                          </span>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                          style={{ background: `${riskColors[h.type === 'document' ? h.document!.risk_level : h.prompt!.risk_level]}15`, color: riskColors[h.type === 'document' ? h.document!.risk_level : h.prompt!.risk_level] }}
                        >
                          {h.type === 'document' ? h.document!.risk_level : h.prompt!.risk_level}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">
                        {h.type === 'document' ? h.document!.original_content : h.prompt!.prompt_text}
                      </p>
                      <p className="text-[10px] text-text-muted mt-1">
                        {new Date(h.type === 'document' ? h.document!.created_at : h.prompt!.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold mb-3">Detection Layers</h3>
              <div className="space-y-2">
                {[
                  { label: 'Pattern Matching', desc: 'Aadhaar, PAN, CC, Bank', active: true },
                  { label: 'Named Entity Recognition', desc: 'Person names, orgs', active: true },
                  { label: 'Contextual Analysis', desc: 'Strategic, financial data', active: true },
                  { label: 'Policy Evaluation', desc: 'IF/THEN rule engine', active: true },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-elevated/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-text-primary">{l.label}</p>
                      <p className="text-[10px] text-text-muted">{l.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
