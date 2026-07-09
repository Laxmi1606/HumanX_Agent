import { Search, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-md border-b border-border sticky top-0 z-20 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prompts, policies..."
            className="w-64 pl-9 pr-4 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 rounded-lg bg-bg-elevated border border-border flex items-center justify-center hover:border-border-light transition-colors"
          >
            <Bell className="w-4 h-4 text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-glow" />
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl shadow-2xl animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-text-primary">Notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {[
                  { type: 'critical', msg: 'Prompt blocked: Aadhaar number detected', time: '2h ago' },
                  { type: 'warning', msg: 'Prompt escalated: Strategic plan detected', time: '25m ago' },
                  { type: 'info', msg: 'New policy created: Financial Data Escalation', time: '1d ago' },
                ].map((n, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border hover:bg-bg-elevated transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full mt-1.5 ${n.type === 'critical' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <p className="text-sm text-text-primary">{n.msg}</p>
                        <p className="text-xs text-text-muted mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border cursor-pointer hover:border-border-light transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
            LS
          </div>
          <span className="text-sm text-text-primary">Laxmi</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
        </div>
      </div>
    </header>
  );
}
