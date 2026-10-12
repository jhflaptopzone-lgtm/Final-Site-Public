import React, { useState, useEffect, useId } from 'react';
import { useAdminAuth } from '../authContext';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  Terminal,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface AdminLoginPageProps {
  onOpenSetupGuide: () => void;
  onOpenFirebaseConfig: () => void;
  onBackToWebsite: () => void;
}

type AuthFlowStage = 'idle' | 'authenticating' | 'verifying' | 'verified' | 'denied';

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onOpenSetupGuide,
  onOpenFirebaseConfig,
  onBackToWebsite,
}) => {
  const {
    login,
    loading: authLoading,
    error: authError,
    sessionTerminatedNotice,
    sessionTerminationReason,
    clearSessionTerminatedNotice,
    rateLimitStatus,
    isFirebaseLive,
  } = useAdminAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Authentication Sequence States
  const [stage, setStage] = useState<AuthFlowStage>('idle');
  const [stageMessage, setStageMessage] = useState<string>('');
  const [loginFailed, setLoginFailed] = useState<boolean>(false);
  const [shakeCard, setShakeCard] = useState<boolean>(false);

  // Rate-limiting Countdown Timer
  const [countdown, setCountdown] = useState<number>(0);

  // Terminal telemetry log messages
  const [terminalFeed, setTerminalFeed] = useState<string[]>([
    'NODE_INIT: JHF SOC Gateway 2026.4',
    'POLICY: Zero-Trust Strict RBAC Enforced',
    'STATUS: TLS 1.3 / AES-256 Auth Daemon Ready',
  ]);

  useEffect(() => {
    if (rateLimitStatus.isLocked && rateLimitStatus.remainingSeconds > 0) {
      setCountdown(rateLimitStatus.remainingSeconds);
    }
  }, [rateLimitStatus]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Subtle telemetry ticker in terminal
  useEffect(() => {
    const feeds = [
      'HEALTH: Node ingress nominal [LATENCY: 22ms]',
      'SEC_VAULT: Cryptographic integrity confirmed',
      'MONITOR: Real-time telemetry connection active',
      'GATEWAY: Port 3000 reverse proxy operational',
    ];
    let index = 0;
    const interval = setInterval(() => {
      const next = feeds[index % feeds.length];
      index++;
      setTerminalFeed((prev) => [...prev.slice(-3), next]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;

    // Reset feedback
    clearSessionTerminatedNotice();
    setLoginFailed(false);
    setShakeCard(false);

    // Step 1: Authenticating
    setStage('authenticating');
    setStageMessage('AUTHENTICATING...');

    await new Promise((resolve) => setTimeout(resolve, 400));

    // Step 2: Verifying Credentials
    setStage('verifying');
    setStageMessage('VERIFYING CREDENTIALS...');

    const success = await login(username, password);

    if (success) {
      // Step 3: Access Verified
      setStage('verified');
      setStageMessage('ACCESS VERIFIED');
      setLoginFailed(false);
      // Wait briefly for verified animation before dashboard render
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
      setStage('denied');
      setLoginFailed(true);
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 600);
    }
  };

  const isLocked = countdown > 0;

  return (
    <div className="min-h-screen bg-[#070a0e] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Subtle Scanline Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />

      {/* Cyber Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            linear-gradient(to right, rgba(16, 185, 129, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        }}
      />

      {/* Top Navigation / Telemetry Bar */}
      <header className="w-full max-w-5xl z-20 flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onBackToWebsite}
          className="group flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 transition px-3 py-1.5 rounded-lg border border-slate-800/80 bg-slate-900/60 backdrop-blur"
        >
          <span className="text-emerald-500 group-hover:-translate-x-0.5 transition">←</span>
          <span>RETURN TO PUBLIC STORE</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800/80 bg-slate-900/60 backdrop-blur">
            <span
              className={`w-2 h-2 rounded-full ${
                isFirebaseLive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-emerald-500'
              } animate-pulse`}
            />
            <span className="text-slate-300">
              {isFirebaseLive ? 'FIREBASE SOC LIVE' : 'SECURE VAULT OFFLINE'}
            </span>
            <button
              onClick={onOpenFirebaseConfig}
              className="text-emerald-400 hover:underline font-bold ml-1"
            >
              CONFIG
            </button>
          </div>

          <button
            onClick={onOpenSetupGuide}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>SECURITY GUIDE</span>
          </button>
        </div>
      </header>

      {/* Center Container: Cyber Security Command Center Card */}
      <main className="w-full max-w-md my-auto py-6 z-20">
        
        {/* Session Terminated Notice Banner */}
        {sessionTerminatedNotice && (
          <div
            className={`mb-4 rounded-xl p-3.5 text-xs flex items-start gap-2.5 backdrop-blur animate-fadeIn border ${
              sessionTerminationReason === 'inactivity'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {sessionTerminationReason === 'inactivity' ? (
              <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold tracking-wider font-mono flex items-center justify-between">
                <span>
                  {sessionTerminationReason === 'inactivity'
                    ? 'AUTO-LOGOUT • 5 MIN INACTIVITY'
                    : 'SESSION TERMINATED'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 border border-slate-700 font-mono">
                  PASSWORD REQUIRED
                </span>
              </div>
              <div className="text-[11px] opacity-90 mt-1 leading-relaxed">
                {sessionTerminationReason === 'inactivity' ? (
                  <>
                    <div>নিরাপত্তার স্বার্থে ৫ মিনিট কোনো কার্যক্রম না থাকায় অ্যাডমিন প্যানেল স্বয়ংক্রিয়ভাবে লগআউট হয়েছে।</div>
                    <div className="text-[10px] opacity-80 mt-0.5 font-mono">
                      Your session was closed due to 5 minutes of inactivity. Re-enter your password to log in.
                    </div>
                  </>
                ) : (
                  <div>Your administrative session has ended securely. Please enter your password to continue.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lockout Banner */}
        {isLocked && (
          <div className="mb-4 bg-rose-500/15 border border-rose-500/40 rounded-xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5 backdrop-blur animate-pulse">
            <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold font-mono tracking-wider">ACCESS DENIED • RATE-LIMIT ACTIVE</div>
              <div className="text-[11px] text-rose-200/90 mt-0.5">
                Too many failed attempts. Temporary security lockout active. Retry available in{' '}
                <strong className="text-white font-mono text-xs">{countdown}s</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Primary Command Center Card */}
        <div
          className={`bg-[#0d121a]/95 border border-slate-800/90 rounded-2xl p-7 sm:p-9 shadow-2xl relative backdrop-blur-xl transition-all duration-300 ${
            shakeCard ? 'animate-[shake_0.5s_ease-in-out] border-rose-500/50' : 'hover:border-emerald-500/30'
          }`}
          style={{
            boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top Cyber Accent Corner Line */}
          <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative">
              <ShieldCheck className="w-7 h-7" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0d121a] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">
              JHF LAPTOP ZONE
            </h1>
            <p className="text-xs font-mono font-bold text-emerald-400 tracking-widest uppercase mt-1">
              ADMIN CONTROL CENTER
            </p>
          </div>

          {/* Failure Alert Box */}
          {loginFailed && !isLocked && (
            <div className="mb-5 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold font-mono tracking-wider">ACCESS DENIED</div>
                <div className="text-[11px] text-rose-200/90 mt-0.5">
                  Invalid username or password. Please verify and retry.
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5" autoComplete="off">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Username / Login ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4 text-emerald-500/70" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. jhfboss)"
                  disabled={stage !== 'idle' && stage !== 'denied'}
                  autoComplete="off"
                  className="w-full bg-[#080c12] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500 font-mono transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4 text-emerald-500/70" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={stage !== 'idle' && stage !== 'denied'}
                  autoComplete="off"
                  className="w-full bg-[#080c12] border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500 font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-emerald-400 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit / Authentication Transition Button */}
            <button
              type="submit"
              disabled={isLocked || stage === 'authenticating' || stage === 'verifying' || stage === 'verified'}
              className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                stage === 'verified'
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_#10b981]'
                  : stage === 'authenticating' || stage === 'verifying'
                  ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/40 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-900/30 active:scale-[0.99]'
              }`}
            >
              {stage === 'authenticating' ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : stage === 'verifying' ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>VERIFYING CREDENTIALS...</span>
                </>
              ) : stage === 'verified' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>ACCESS VERIFIED</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>SECURE LOGIN</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>

            {/* Quick Master Credential Bar */}
            <div className="pt-2">
              <div className="bg-[#080c12]/90 border border-emerald-950/80 rounded-xl p-3 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>DEFAULT CREDENTIALS</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">SUPER ADMIN</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5">
                  <div className="bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Username</span>
                    <span className="text-emerald-300 font-bold select-all">jhfboss</span>
                  </div>
                  <div className="bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Password</span>
                    <span className="text-emerald-300 font-bold font-mono select-all">J@hf693071</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('jhfboss');
                      setPassword('J@hf693071');
                      setLoginFailed(false);
                    }}
                    className="flex-1 py-1.5 px-2.5 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 rounded-lg text-[10px] font-bold tracking-wider uppercase transition text-center flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Auto-Fill Super Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('admin');
                      setPassword('admin123');
                      setLoginFailed(false);
                    }}
                    className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-[10px] font-bold tracking-wider uppercase transition"
                  >
                    admin / admin123
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Under Card System Status */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SYSTEM SECURE</span>
            </div>
            <span className="text-slate-500">Authentication protected</span>
          </div>
        </div>

        {/* Minimal Terminal Activity / Telemetry Box */}
        <div className="mt-4 bg-[#080c12]/90 border border-slate-800/80 rounded-xl p-3 font-mono text-[10px] text-slate-400 space-y-1 backdrop-blur shadow-lg">
          <div className="flex items-center justify-between text-slate-500 pb-1.5 border-b border-slate-800/60 mb-1">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <Terminal className="w-3 h-3" />
              <span>SECURITY TELEMETRY</span>
            </span>
            <span className="text-[9px] text-slate-600">ZERO_TRUST_v2</span>
          </div>
          {terminalFeed.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2 truncate">
              <span className="text-emerald-500/80">›</span>
              <span className="text-slate-400 truncate">{line}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="w-full max-w-5xl z-20 text-center py-2 text-[11px] font-mono text-slate-500">
        JHF Cyber Security SOC • Enterprise Laptop ERP &amp; Administrative Management Platform
      </footer>

      {/* Custom Styles for Keyframe Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};
