import { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('laxmi@acme.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/app');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg-primary grid-bg flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/30 to-bg-primary pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center glow-blue transition-transform group-hover:scale-105">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">HumanXAgent</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">AI Governance</p>
          </div>
        </Link>

        <div className="glass-card rounded-2xl p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-sm text-text-secondary mb-6">Sign in to access the governance dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border bg-bg-elevated" />
                Remember me
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-xs text-text-muted mb-2">Demo credentials (pre-filled):</div>
            <div className="text-xs text-text-secondary font-mono">laxmi@acme.com / demo1234</div>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    </div>
  );
}
