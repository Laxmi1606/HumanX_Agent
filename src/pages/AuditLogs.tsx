import { useEffect, useState } from 'react';
import { ScrollText, Search, Filter, Download, Eye, Ban, CheckCircle2, AlertTriangle, FileCheck, Shield } from 'lucide-react';
import Topbar from '../components/Topbar';
import { supabase, ORG_ID } from '../lib/supabase';
import type { AuditLog } from '../lib/types';

const actionConfig: Record<string, { icon: typeof Eye; color: string; label: string }> = {
  PROMPT_BLOCKED: { icon: Ban, color: '#ef4444', label: 'Prompt Blocked' },
  PROMPT_REDACTED: { icon: Eye, color: '#3b82f6', label: 'Prompt Redacted' },
  PROMPT_SAFE: { icon: CheckCircle2, color: '#10b981', label: 'Prompt Safe' },
  PROMPT_ESCALATED: { icon: AlertTriangle, color: '#f97316', label: 'Prompt Escalated' },
  POLICY_CREATED: { icon: FileCheck, color: '#818cf8', label: 'Policy Created' },
  POLICY_UPDATED: { icon: Shield, color: '#f59e0b', label: 'Policy Updated' },
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false })
      .limit(100);
    setLogs(data || []);
    setLoading(false);
  };

  const filtered = logs.filter(l => {
    const matchesSearch = !search || l.action.toLowerCase().includes(search.toLowerCase()) || (l.user_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || l.action === filter;
    return matchesSearch && matchesFilter;
  });

  const filterOptions = ['all', 'PROMPT_BLOCKED', 'PROMPT_REDACTED', 'PROMPT_SAFE', 'PROMPT_ESCALATED', 'POLICY_CREATED', 'POLICY_UPDATED'];

  return (
    <div>
      <Topbar title="Audit Logs" subtitle="Immutable compliance trail" />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Activity Trail</h3>
              <p className="text-xs text-text-muted">{logs.length} events recorded</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-bg-elevated border border-border hover:border-border-light text-text-primary text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-9 pr-4 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              {filterOptions.map(f => (
                <option key={f} value={f}>{f === 'all' ? 'All Events' : actionConfig[f]?.label || f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-elevated/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={5} className="px-4 py-4"><div className="h-6 shimmer rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-text-muted">No logs found</td>
                  </tr>
                ) : (
                  filtered.map((log) => {
                    const cfg = actionConfig[log.action] || { icon: ScrollText, color: '#8b95a8', label: log.action };
                    const Icon = cfg.icon;
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-bg-elevated/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                              <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                            </div>
                            <span className="text-sm text-text-primary font-medium">{cfg.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-secondary">{log.user_name || 'System'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-secondary capitalize">{log.resource_type || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs text-text-muted font-mono">
                            {log.details ? JSON.stringify(log.details).slice(0, 60) : '-'}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-muted">{new Date(log.created_at).toLocaleString()}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
