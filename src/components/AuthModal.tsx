import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Lock, Mail, User, AlertCircle, ArrowRight, CheckCircle2, Server, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isFullScreen?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  onClose,
  isFullScreen = false
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen && !isFullScreen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('Authentication successful! Initializing Docker VPS environment...');
        setTimeout(() => {
          setSuccessMsg(null);
          if (onClose) onClose();
        }, 500);
      } else {
        setError(res.message || 'Invalid username or password.');
      }
    }, 300);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = register(regName, regEmail, regPassword);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('Account created successfully! Logged in as Normal User.');
        setTimeout(() => {
          setSuccessMsg(null);
          if (onClose) onClose();
        }, 600);
      } else {
        setError(res.message || 'Registration failed.');
      }
    }, 300);
  };

  const content = (
    <div className="relative w-full max-w-md bg-zinc-900/95 border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Top Cyber Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500" />

      {/* Header */}
      <div className="p-7 pb-4 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[1px] shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[15px] flex items-center justify-center">
              <Server className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse" />
        </div>

        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold tracking-tight text-white">EVM PANEL</h2>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Docker VPS
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs">
          High-performance containerized VPS management platform with live terminal & NAT routing
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="px-7">
        <div className="flex p-1 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Register Account
          </button>
        </div>
      </div>

      {/* Form Area */}
      <div className="p-7 pt-4 space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin, user, or email..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to EVM Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Name / Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="username or email..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              💡 <strong>Account Access</strong>: Standard user accounts access personal Docker VPS instances, Web Terminal, NAT Port mappings, and the Redeem Code center.
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-pulse">Creating Account...</span>
              ) : (
                <>
                  <span>Create User Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Credentials Reference Card */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-2">
          <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>Role-Based Authentication Guide</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-amber-500/30">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1 font-mono">
                User: <span className="text-white font-bold">admin</span>
                <br />
                Pass: <span className="text-white font-bold">admin</span>
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">Full Admin Panel, Host Nodes & Manual Deploy</p>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-emerald-500/30">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Normal User</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1 font-mono">
                User: <span className="text-white font-bold">user</span> / custom
                <br />
                Pass: <span className="text-white font-bold">user</span> / custom
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">User Dashboard, Web Console & Code Redeem</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-zinc-950/90 border-t border-zinc-800/80 text-center text-[11px] text-zinc-500">
        EVM Panel • Modern Containerized Docker VPS Management
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Cyber grid background background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0,transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {content}
    </div>
  );
};
