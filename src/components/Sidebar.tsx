import { Shield, LayoutDashboard, FileSearch, Gavel, ScrollText, BarChart3, Activity, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/inspector', label: 'Prompt Inspector', icon: FileSearch },
  { path: '/app/policies', label: 'Policy Engine', icon: Gavel },
  { path: '/app/audit', label: 'Audit Logs', icon: ScrollText },
  { path: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/app/monitoring', label: 'Monitoring', icon: Activity },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <aside className="w-64 h-screen bg-bg-secondary border-r border-border flex flex-col fixed left-0 top-0 z-30">
      <div className="px-6 py-5 border-b border-border">
        <Link to="/app" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center glow-blue transition-transform group-hover:scale-105">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary tracking-tight">HumanXAgent</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">AI Governance</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-elevated mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
            LS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Laxmi Sharma</p>
            <p className="text-xs text-text-muted truncate">Super Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
