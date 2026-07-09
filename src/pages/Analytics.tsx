import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Zap, Target, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Topbar from '../components/Topbar';
import { supabase, ORG_ID } from '../lib/supabase';
import type { Prompt, Violation } from '../lib/types';

const riskColors: Record<string, string> = {
  safe: '#10b981',
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export default function Analytics() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pRes, vRes] = await Promise.all([
        supabase.from('prompts').select('*').eq('organization_id', ORG_ID).order('created_at', { ascending: true }),
        supabase.from('violations').select('*').eq('organization_id', ORG_ID),
      ]);
      setPrompts(pRes.data || []);
      setViolations(vRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const platformData = prompts.reduce((acc, p) => {
    const platform = p.ai_platform || 'Unknown';
    if (!acc[platform]) acc[platform] = { platform, total: 0, blocked: 0, redacted: 0, safe: 0 };
    acc[platform].total++;
    if (p.status === 'blocked') acc[platform].blocked++;
    if (p.status === 'redacted') acc[platform].redacted++;
    if (p.status === 'safe') acc[platform].safe++;
    return acc;
  }, {} as Record<string, any>);

  const platformChart = Object.values(platformData);

  const violationBySeverity = violations.reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const radarData = [
    { metric: 'PII Detection', score: 95 },
    { metric: 'Policy Coverage', score: 88 },
    { metric: 'Response Time', score: 92 },
    { metric: 'Audit Completeness', score: 99 },
    { metric: 'Risk Scoring', score: 90 },
    { metric: 'Compliance', score: 96 },
  ];

  const trendData = prompts.map((p, i) => ({
    name: `#${i + 1}`,
    risk: p.risk_score,
    entities: p.detected_entities?.length || 0,
  }));

  const avgRisk = prompts.length > 0 ? Math.round(prompts.reduce((a, p) => a + p.risk_score, 0) / prompts.length) : 0;
  const totalBlocked = prompts.filter(p => p.status === 'blocked').length;
  const blockRate = prompts.length > 0 ? Math.round((totalBlocked / prompts.length) * 100) : 0;

  if (loading) {
    return (
      <div>
        <Topbar title="Analytics" subtitle="Deep insights into AI governance" />
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass-card rounded-2xl shimmer animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 glass-card rounded-2xl shimmer animate-pulse" />
            <div className="h-80 glass-card rounded-2xl shimmer animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Analytics" subtitle="Deep insights into AI governance" />
      <div className="p-8 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Risk Score', value: avgRisk, icon: Target, color: 'blue', suffix: '/100' },
            { label: 'Block Rate', value: blockRate, icon: AlertCircle, color: 'red', suffix: '%' },
            { label: 'Total Violations', value: violations.length, icon: Zap, color: 'amber', suffix: '' },
            { label: 'Prompts Analyzed', value: prompts.length, icon: TrendingUp, color: 'emerald', suffix: '' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-lg bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 text-${s.color}-400`} />
                  </div>
                  <p className="text-sm text-text-muted">{s.label}</p>
                </div>
                <p className="text-2xl font-bold text-text-primary">{s.value}<span className="text-sm text-text-muted">{s.suffix}</span></p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk trend */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Risk Score Over Time</h3>
                <p className="text-xs text-text-muted">All analyzed prompts</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2940" />
                <XAxis dataKey="name" stroke="#5a6478" fontSize={11} />
                <YAxis stroke="#5a6478" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#131a2e', border: '1px solid #2a3650', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Platform comparison */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">By AI Platform</h3>
                <p className="text-xs text-text-muted">Prompt status distribution</p>
              </div>
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={platformChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2940" />
                <XAxis dataKey="platform" stroke="#5a6478" fontSize={11} />
                <YAxis stroke="#5a6478" fontSize={11} />
                <Tooltip contentStyle={{ background: '#131a2e', border: '1px solid #2a3650', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="safe" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="redacted" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="blocked" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Compliance radar */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Governance Scorecard</h3>
                <p className="text-xs text-text-muted">Multi-dimensional compliance metrics</p>
              </div>
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e2940" />
                <PolarAngleAxis dataKey="metric" stroke="#8b95a8" fontSize={10} />
                <PolarRadiusAxis stroke="#5a6478" fontSize={9} domain={[0, 100]} />
                <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#131a2e', border: '1px solid #2a3650', borderRadius: '8px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Violations by severity */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Violations by Severity</h3>
                <p className="text-xs text-text-muted">Distribution across all detections</p>
              </div>
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={Object.entries(violationBySeverity).map(([k, v]) => ({ name: k, count: v }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2940" horizontal={false} />
                <XAxis type="number" stroke="#5a6478" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#5a6478" fontSize={11} width={70} />
                <Tooltip contentStyle={{ background: '#131a2e', border: '1px solid #2a3650', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }} />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24}>
                  {Object.entries(violationBySeverity).map(([k, _], i) => (
                    <Bar key={i} dataKey="count" fill={riskColors[k] || '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
