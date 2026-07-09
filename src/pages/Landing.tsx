import { Shield, Lock, FileSearch, Gavel, Activity, ArrowRight, CheckCircle2, Zap, Eye, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center glow-blue">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">HumanXAgent</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#architecture" className="hover:text-text-primary transition-colors">Architecture</a>
            <a href="#compliance" className="hover:text-text-primary transition-colors">Compliance</a>
          </div>
          <Link
            to="/login"
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Enterprise AI Governance Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Secure AI.
            <br />
            <span className="gradient-text">Compliant by Design.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            A multi-layered enterprise architecture for AI governance, ensuring real-time
            PII redaction and regulatory compliance across every AI interaction.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all hover:scale-105 flex items-center gap-2 glow-blue"
            >
              Access Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="px-6 py-3 bg-bg-elevated border border-border hover:border-border-light text-text-primary font-medium rounded-lg transition-colors"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 border-y border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '99.9%', label: 'PII Detection Accuracy' },
            { value: '<50ms', label: 'Real-time Latency' },
            { value: '12+', label: 'Compliance Frameworks' },
            { value: '5M+', label: 'Prompts Protected' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Multi-Layered Protection</h2>
            <p className="text-text-secondary">Every AI interaction passes through four governance layers</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileSearch, title: 'Prompt Inspector', desc: 'Real-time PII detection with NER and pattern matching before any AI call.', color: 'blue' },
              { icon: Gavel, title: 'Policy Engine', desc: 'IF/THEN compliance rules with redact, block, escalate, and approval actions.', color: 'amber' },
              { icon: Database, title: 'Audit Trail', desc: 'Immutable, timestamped logs for every decision. GDPR and SOC2 ready.', color: 'emerald' },
              { icon: Activity, title: 'Live Monitoring', desc: 'Real-time risk scoring, violation alerts, and compliance dashboards.', color: 'red' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="glass-card rounded-2xl p-6 hover:border-border-light transition-all hover:-translate-y-1 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${f.color}-500/10 border border-${f.color}-500/20`}>
                    <Icon className={`w-6 h-6 text-${f.color}-400`} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="px-6 py-20 bg-bg-secondary/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-text-secondary">From prompt to protected response in milliseconds</p>
          </div>
          <div className="space-y-4">
            {[
              { step: '01', icon: Eye, title: 'User Submits Prompt', desc: 'Employee enters a prompt in ChatGPT, Claude, or any connected AI platform.' },
              { step: '02', icon: FileSearch, title: 'PII Detection Layer', desc: 'Pattern matching and NER scan for Aadhaar, PAN, credit cards, emails, names, and contextual data.' },
              { step: '03', icon: Gavel, title: 'Policy Evaluation', desc: 'IF/THEN rules determine action: redact, block, escalate, or require approval based on severity.' },
              { step: '04', icon: CheckCircle2, title: 'Safe Prompt Delivered', desc: 'Redacted or blocked prompt reaches the AI. Original is never exposed. Full audit trail recorded.' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-start gap-6 glass-card rounded-2xl p-6 hover:border-border-light transition-colors">
                  <div className="text-3xl font-bold gradient-text flex-shrink-0">{s.step}</div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                    <p className="text-sm text-text-secondary">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Compliance Frameworks</h2>
          <p className="text-text-secondary mb-12">Built to satisfy the strictest regulatory requirements</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['GDPR', 'HIPAA', 'SOC 2', 'ISO 27001', 'CCPA', 'DPDP Act', 'PCI DSS', 'FedRAMP'].map((f) => (
              <div key={f} className="px-6 py-3 glass-card rounded-xl text-sm font-medium hover:border-blue-500/30 transition-colors">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12 glow-blue">
          <Zap className="w-10 h-10 text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Ready to Secure Your AI?</h2>
          <p className="text-text-secondary mb-8">Access the governance dashboard and start protecting your enterprise today.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all hover:scale-105"
          >
            Access Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-text-secondary">HumanXAgent - AI Governance Platform</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Lock className="w-3.5 h-3.5" />
            <span>SOC 2 Type II Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
