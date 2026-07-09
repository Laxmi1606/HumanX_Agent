import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, FileText, TrendingUp, TrendingDown, Activity, Zap, Eye, Ban } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Topbar from '../components/Topbar';
import { supabase, ORG_ID } from '../lib/supabase';
import type { Prompt, Policy, Violation } from '../lib/types';

const riskColors: Record<string, string> = {
  safe: '#10b981',
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export default function Dashboard() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [pRes, polRes, vRes] = await Promise.all([
        supabase.from('prompts').select('*').eq('organization_id', ORG_ID).order('created_at', { ascending: false }).limit(100),
        supabase.from('policies').select('*').eq('organization_id', ORG_ID),
        supabase.from('violations').select('*').eq('organization_id', ORG_ID).order('created_at', { ascending: false }).limit(50),
      ]);
      setPrompts(pRes.data || []);
      setPolicies(polRes.data || []);
      setViolations(vRes.data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalPrompts = prompts.length;
  const blockedCount = prompts.filter(p => p.status === 'blocked').length;
  const redactedCount = prompts.filter(p => p.status === 'redacted').length;
  const safeCount = prompts.filter(p => p.status === 'safe').length;
  const escalatedCount = prompts.filter(p => p.status === 'escalated').length;
  const activePolicies = policies.filter(p => p.enabled).length;
  const totalViolations = violations.length;

  const trendData = prompts.slice(0, 7).reverse().map((p, i) => ({
    name: `T-${7 - i}h`,
    risk: p.risk_score,
    prompts: 1,
  }));

  const riskDistribution = [
    { name: 'Safe', value: safeCount, color: riskColors.safe },
    { name: 'Redacted', value: redactedCount, color: riskColors.low },
    { name: 'Escalated', value: escalatedCount, color: riskColors.high },
    { name: 'Blocked', value: blockedCount, color: riskColors.critical },
  ].filter(d => d.value > 0);

  const violationTypes = violations.reduce((acc, v) => {
    acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const violationBarData = Object.entries(violationTypes).map(([name, count]) => ({ name, count }));

  const stats = [
    { label: 'Total Prompts', value: totalPrompts, icon: FileText, color: 'blue', trend: '+12%' },
    { label: 'PII Redacted', value: redactedCount, icon: Eye, color: 'amber', trend: '+8%' },
    { label: 'Blocked', value: blockedCount, icon: Ban, color: 'red', trend: '-3%' },
    { label: 'Active Policies', value: activePolicies, icon: Shield, color: 'emerald', trend: '+2' },
  ];

  if (loading) {
    return (
      <div>
        <Topbar title="Dashboard" subtitle="AI governance overview" />
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 glass-card rounded-2xl shimmer animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 glass-card rounded-2xl shimmer animate-pulse" />
            <div className="h-80 glass-card rounded-2xl shimmer animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Dashboard" subtitle="AI governance overview" />
      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            const isPositive = !s.trend.startsWith('-');
            return (
              <div key={i} className="glass-card rounded-2xl p-5 hover:border-border-light transition-all animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${s.color}-400`} strokeWidth={2} />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {s.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                <p className="text-sm text-text-muted mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk trend */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Risk Score Trend</h3>
                <p className="text-xs text-text-muted">Last 7 prompts analyzed</p>
              </div>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2940" />
                <XAxis dataKey="name" stroke="#5a6478" fontSize={11} />
                <YAxis stroke="#5a6478" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#131a2e', border: '1px solid #2a3650', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#8b95a8' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} fill="url(#riskGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk distribution */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Prompt Status</h3>
                <p className="text-xs text-text-muted">Distribution by action</p>
              </div>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#131a2e', border: '1px solid #2a3650', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {riskDistribution.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-text-secondary">{d.name}</span>
                  </div>
                  <span className="text-text-primary font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent prompts */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Recent Prompts</h3>
              <span className="text-xs text-text-muted">{totalPrompts} total</span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {prompts.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated/50 hover:bg-bg-elevated transition-colors">
                  <div className={`w-1 h-10 rounded-full`} style={{ background: riskColors[p.risk_level] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{p.prompt_text}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-text-muted">{p.ai_platform || 'Unknown'}</span>
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-text-muted">{new Date(p.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-md text-xs font-medium capitalize"
                    style={{
                      background: `${riskColors[p.risk_level]}15`,
                      color: riskColors[p.risk_level],
                    }}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Violations by type */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Violations by Type</h3>
                <p className="text-xs text-text-muted">{totalViolations} total violations</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            {violationBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={violationBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2940" horizontal={false} />
                  <XAxis type="number" stroke="#5a6478" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#5a6478" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{ background: '#131a2e', border: '1px solid #2a3650', borderRadius: '8px', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No violations detected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
