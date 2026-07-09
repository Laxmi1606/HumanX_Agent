import { useEffect, useState } from 'react';
import { Activity, Radio, AlertTriangle, CheckCircle2, XCircle, Clock, Cpu, Zap } from 'lucide-react';
import Topbar from '../components/Topbar';
import { supabase, ORG_ID } from '../lib/supabase';
import type { Prompt, AIProvider } from '../lib/types';

const riskColors: Record<string, string> = {
  safe: '#10b981',
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const providerLabels: Record<string, string> = {
  openai: 'OpenAI',
  claude: 'Claude',
  gemini: 'Gemini',
  copilot: 'GitHub Copilot',
  llama: 'Llama',
};

export default function Monitoring() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pRes, provRes] = await Promise.all([
        supabase.from('prompts').select('*').eq('organization_id', ORG_ID).order('created_at', { ascending: false }).limit(20),
        supabase.from('ai_providers').select('*').eq('organization_id', ORG_ID),
      ]);
      setPrompts(pRes.data || []);
      setProviders(provRes.data || []);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const liveFeed = prompts.slice(0, 8);
  const connectedCount = providers.filter(p => p.connected).length;

  return (
    <div>
      <Topbar title="Live Monitoring" subtitle="Real-time AI activity and threat detection" />
      <div className="p-8 space-y-6">
        {/* Status bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'System Status', value: 'Operational', icon: CheckCircle2, color: 'emerald', live: true },
            { label: 'Avg Response', value: '42ms', icon: Clock, color: 'blue' },
            { label: 'Active Threats', value: prompts.filter(p => p.status === 'blocked' || p.status === 'escalated').length, icon: AlertTriangle, color: 'red' },
            { label: 'AI Providers', value: `${connectedCount}/${providers.length}`, icon: Cpu, color: 'amber' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-lg bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 text-${s.color}-400`} />
                  </div>
                  <p className="text-sm text-text-muted">{s.label}</p>
                  {s.live && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />}
                </div>
                <p className="text-xl font-bold text-text-primary">{s.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live feed */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Radio className="w-5 h-5 text-emerald-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Live Prompt Feed</h3>
                  <p className="text-xs text-text-muted">Real-time AI interaction monitoring</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 shimmer rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {liveFeed.map((p) => {
                  const isBlocked = p.status === 'blocked';
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated/50 hover:bg-bg-elevated transition-colors animate-slide-in">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${riskColors[p.risk_level]}15`, border: `1px solid ${riskColors[p.risk_level]}30` }}>
                        {isBlocked ? <XCircle className="w-4 h-4" style={{ color: riskColors[p.risk_level] }} /> : p.status === 'safe' ? <CheckCircle2 className="w-4 h-4" style={{ color: riskColors[p.risk_level] }} /> : <AlertTriangle className="w-4 h-4" style={{ color: riskColors[p.risk_level] }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">{p.prompt_text}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-muted">{p.ai_platform || 'Unknown'}</span>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-xs text-text-muted">{p.user_name}</span>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-xs text-text-muted">{new Date(p.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold" style={{ color: riskColors[p.risk_level] }}>{p.risk_score}</span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                          style={{ background: `${riskColors[p.risk_level]}15`, color: riskColors[p.risk_level] }}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Providers */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold">AI Providers</h3>
              </div>
              <div className="space-y-2">
                {providers.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.connected ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-bg-elevated border border-border'}`}>
                      <Zap className={`w-4 h-4 ${p.connected ? 'text-emerald-400' : 'text-text-muted'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{providerLabels[p.provider_name] || p.provider_name}</p>
                      <p className="text-xs text-text-muted">{p.connected ? 'Connected & monitored' : 'Not connected'}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${p.connected ? 'bg-emerald-500 animate-pulse-glow' : 'bg-text-muted'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold">System Health</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'PII Detection Engine', value: 100, color: '#10b981' },
                  { label: 'Policy Engine', value: 100, color: '#10b981' },
                  { label: 'Audit Logger', value: 100, color: '#10b981' },
                  { label: 'Risk Scorer', value: 98, color: '#10b981' },
                ].map((h, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-secondary">{h.label}</span>
                      <span className="text-xs font-medium" style={{ color: h.color }}>{h.value}%</span>
                    </div>
                    <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${h.value}%`, background: h.color }} />
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
