import { useEffect, useState } from 'react';
import { Gavel, Plus, Eye, Ban, AlertTriangle, CheckCircle2, FileCheck, X, Trash2, Power } from 'lucide-react';
import Topbar from '../components/Topbar';
import { supabase, ORG_ID } from '../lib/supabase';
import type { Policy } from '../lib/types';

const actionConfig: Record<string, { icon: typeof Eye; color: string; bg: string }> = {
  redact: { icon: Eye, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  block: { icon: Ban, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  require_approval: { icon: FileCheck, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  escalate: { icon: AlertTriangle, color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
  approve: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
};

const severityColors: Record<string, string> = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export default function PolicyEngine() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: '', condition: '', action: 'redact' as Policy['action'], severity: 'medium' as Policy['severity'] });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    const { data } = await supabase.from('policies').select('*').eq('organization_id', ORG_ID).order('created_at', { ascending: false });
    setPolicies(data || []);
    setLoading(false);
  };

  const togglePolicy = async (id: string, enabled: boolean) => {
    await supabase.from('policies').update({ enabled: !enabled }).eq('id', id);
    setPolicies(policies.map(p => p.id === id ? { ...p, enabled: !enabled } : p));
  };

  const deletePolicy = async (id: string) => {
    await supabase.from('policies').delete().eq('id', id);
    setPolicies(policies.filter(p => p.id !== id));
  };

  const createPolicy = async () => {
    if (!newPolicy.name || !newPolicy.condition) return;
    const { data } = await supabase.from('policies').insert({
      organization_id: ORG_ID,
      name: newPolicy.name,
      condition: newPolicy.condition,
      action: newPolicy.action,
      severity: newPolicy.severity,
      enabled: true,
    }).select().single();
    if (data) {
      setPolicies([data, ...policies]);
      await supabase.from('audit_logs').insert({
        organization_id: ORG_ID,
        user_id: '00000000-0000-0000-0000-000000000002',
        user_name: 'Laxmi Sharma',
        action: 'POLICY_CREATED',
        resource_type: 'policy',
        details: { policy: newPolicy.name, action: newPolicy.action },
      });
    }
    setNewPolicy({ name: '', condition: '', action: 'redact', severity: 'medium' });
    setShowModal(false);
  };

  return (
    <div>
      <Topbar title="Policy Engine" subtitle="IF/THEN compliance rules for AI governance" />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Gavel className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Compliance Policies</h3>
              <p className="text-xs text-text-muted">{policies.filter(p => p.enabled).length} active / {policies.length} total</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 glass-card rounded-2xl shimmer animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((p, i) => {
              const cfg = actionConfig[p.action];
              const ActionIcon = cfg.icon;
              return (
                <div
                  key={p.id}
                  className={`glass-card rounded-2xl p-5 transition-all animate-fade-in ${p.enabled ? '' : 'opacity-50'}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                        <ActionIcon className="w-5 h-5" style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">{p.name}</h4>
                        <span className="text-xs text-text-muted capitalize">{p.action.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePolicy(p.id, p.enabled)}
                        className={`w-8 h-5 rounded-full transition-colors relative ${p.enabled ? 'bg-emerald-500' : 'bg-bg-elevated border border-border'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${p.enabled ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                      </button>
                      <button onClick={() => deletePolicy(p.id)} className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-bg-elevated/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-medium">IF</span>
                      <span className="text-text-secondary">{p.condition}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-medium">THEN</span>
                      <span className="text-text-secondary capitalize">{p.action.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-medium capitalize"
                      style={{ background: `${severityColors[p.severity]}15`, color: severityColors[p.severity] }}
                    >
                      {p.severity} severity
                    </span>
                    <span className="text-xs text-text-muted">{p.enabled ? 'Active' : 'Disabled'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New policy modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowModal(false)}>
            <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Policy</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Policy Name</label>
                  <input
                    type="text"
                    value={newPolicy.name}
                    onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                    placeholder="e.g., SSN Protection"
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Condition (IF)</label>
                  <input
                    type="text"
                    value={newPolicy.condition}
                    onChange={(e) => setNewPolicy({ ...newPolicy, condition: e.target.value })}
                    placeholder="e.g., Social Security Number"
                    className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Action (THEN)</label>
                    <select
                      value={newPolicy.action}
                      onChange={(e) => setNewPolicy({ ...newPolicy, action: e.target.value as Policy['action'] })}
                      className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-blue-500/50 transition-colors"
                    >
                      <option value="redact">Redact</option>
                      <option value="block">Block</option>
                      <option value="require_approval">Require Approval</option>
                      <option value="escalate">Escalate</option>
                      <option value="approve">Approve</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Severity</label>
                    <select
                      value={newPolicy.severity}
                      onChange={(e) => setNewPolicy({ ...newPolicy, severity: e.target.value as Policy['severity'] })}
                      className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-blue-500/50 transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={createPolicy}
                  disabled={!newPolicy.name || !newPolicy.condition}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Power className="w-4 h-4" />
                  Create & Enable Policy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
