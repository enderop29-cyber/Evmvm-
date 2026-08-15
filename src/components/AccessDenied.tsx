import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccessDeniedProps {
  onBackToDashboard?: () => void;
  onOpenLoginModal?: () => void;
  featureName?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  onBackToDashboard,
  onOpenLoginModal,
  featureName = 'Admin Management Portal',
}) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/10 backdrop-blur-md">
          <ShieldAlert className="w-12 h-12 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-zinc-900 border border-red-500/40 p-2 rounded-xl text-red-400 shadow-lg">
          <Lock className="w-4 h-4" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-medium mb-3 uppercase tracking-wider">
        <Lock className="w-3 h-3" /> 403 Forbidden: Administrator Privilege Required
      </div>

      <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
        Access Restricted to Administrators
      </h2>
      
      <p className="text-zinc-400 max-w-md text-sm leading-relaxed mb-6">
        You are currently signed in as <span className="text-cyan-300 font-semibold">{currentUser?.email || currentUser?.name || 'Standard User'}</span> (<span className="text-emerald-400 font-mono text-xs uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{currentUser?.role || 'USER'}</span>).
        Normal users cannot access <span className="text-white font-medium">{featureName}</span> or manually generate VPS containers.
      </p>

      {/* Helper Box */}
      <div className="w-full max-w-md p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-left mb-6 space-y-3">
        <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
          How to get a Docker VPS as a Normal User:
        </div>
        <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
          <li>Normal users provision VPS instances using <span className="text-cyan-400 font-semibold">Redeem Codes</span>.</li>
          <li>Ask an Administrator for a coupon code or check the Redeem Center.</li>
          <li>To access the Admin Panel, sign in with username: <strong className="text-white">admin</strong> and password: <strong className="text-white">admin</strong>.</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-all border border-zinc-700 hover:border-zinc-600"
          >
            <ArrowLeft className="w-4 h-4" /> Return to My Dashboard
          </button>
        )}

        {onOpenLoginModal ? (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-all shadow-lg shadow-cyan-600/20 border border-cyan-400/40"
          >
            <KeyRound className="w-4 h-4" /> Sign In with Admin Account
          </button>
        ) : (
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-all shadow-lg shadow-cyan-600/20 border border-cyan-400/40"
          >
            <KeyRound className="w-4 h-4" /> Log Out & Sign In as Admin
          </button>
        )}
      </div>
    </div>
  );
};
