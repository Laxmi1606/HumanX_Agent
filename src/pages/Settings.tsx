import { useEffect, useState } from 'react';
import { Building2, Shield, Users, Cpu, Check, Globe } from 'lucide-react';
import Topbar from '../components/Topbar';
import { supabase, ORG_ID } from '../lib/supabase';
import type { Organization, User, AIProvider } from '../lib/types';

const providerLabels: Record<string, string> = {
  openai: 'OpenAI',
  claude: 'Claude',
  gemini: 'Gemini',
  copilot: 'GitHub Copilot',
  llama: 'Llama',
};

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [oRes, uRes, pRes] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', ORG_ID).maybeSingle(),
        supabase.from('users').select('*').eq('organization_id', ORG_ID),
        supabase.from('ai_providers').select('*').eq('organization_id', ORG_ID),
      ]);
      setOrg(oRes.data);
      setUsers(uRes.data || []);
      setProviders(pRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const toggleProvider = async (id: string, connected: boolean) => {
    await supabase.from('ai_providers').update({ connected: !connected }).eq('id', id);
    setProviders(providers.map(p => p.id === id ? { ...p, connected: !connected } : p));
  };

  if (loading) {
    return (
      <div>
        <Topbar title="Settings" subtitle="Organization configuration" />
        <div className="p-8 space-y-6">
          <div className="h-40 glass-card rounded-2xl shimmer animate-pulse" />
          <div className="h-60 glass-card rounded-2xl shimmer animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Settings" subtitle="Organization configuration" />
      <div className="p-8 space-y-6">
        {/* Organization */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Organization Profile</h3>
              <p className="text-xs text-text-muted">Company information and compliance frameworks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Company Name</label>
              <input
                type="text"
                value={org?.name || ''}
                readOnly
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Domain</label>
              <input
                type="text"
                value={org?.domain || ''}
                readOnly
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Industry</label>
              <input
                type="text"
                value={org?.industry || ''}
                readOnly
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Employee Count</label>
              <input
                type="text"
                value={org?.employee_count || ''}
                readOnly
                className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-text-secondary mb-2">Compliance Frameworks</label>
            <div className="flex flex-wrap gap-2">
              {(org?.compliance_frameworks || []).map((f) => (
                <span key={f} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <Check className="w-3 h-3" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Team members */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Team Members</h3>
              <p className="text-xs text-text-muted">{users.length} users in organization</p>
            </div>
          </div>

          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated/50">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                  {u.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{u.name}</p>
                  <p className="text-xs text-text-muted">{u.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium capitalize bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {u.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Providers */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold">AI Platform Integrations</h3>
              <p className="text-xs text-text-muted">Toggle monitoring for connected AI services</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {providers.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-4 rounded-lg bg-bg-elevated/50">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.connected ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-bg-elevated border border-border'}`}>
                  <Globe className={`w-5 h-5 ${p.connected ? 'text-emerald-400' : 'text-text-muted'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{providerLabels[p.provider_name] || p.provider_name}</p>
                  <p className="text-xs text-text-muted">{p.connected ? 'Monitoring active' : 'Not monitored'}</p>
                </div>
                <button
                  onClick={() => toggleProvider(p.id, p.connected)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative ${p.connected ? 'bg-emerald-500' : 'bg-bg-elevated border border-border'}`}
                  style={{ height: '22px' }}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${p.connected ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Security Settings</h3>
              <p className="text-xs text-text-muted">Data retention and encryption configuration</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'End-to-end encryption', desc: 'AES-256 encryption for all prompt data', enabled: true },
              { label: 'Data retention period', desc: '90 days automatic purge of prompt history', enabled: true },
              { label: 'Real-time alerting', desc: 'Instant notifications for critical violations', enabled: true },
              { label: 'SSO enforcement', desc: 'Require SSO authentication for all users', enabled: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{s.label}</p>
                  <p className="text-xs text-text-muted">{s.desc}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${s.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-bg-elevated text-text-muted border border-border'}`}>
                  {s.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
