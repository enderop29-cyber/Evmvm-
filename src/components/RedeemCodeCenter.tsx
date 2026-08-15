import React, { useState } from 'react';
import {
  Gift,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Copy,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVPS } from '../context/VPSContext';
import { LinuxOS } from '../types';
import { OS_TEMPLATES } from '../lib/mockData';

export const RedeemCodeCenter: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { redeemCodes, redeemCouponCode, createRedeemCode, deleteRedeemCode, toggleRedeemCode } = useVPS();

  // User Redeem input
  const [codeInput, setCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Admin Code Creation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCores, setNewCores] = useState(2);
  const [newRamGb, setNewRamGb] = useState(4);
  const [newDiskGb, setNewDiskGb] = useState(40);
  const [newBwTb, setNewBwTb] = useState(2);
  const [newOs, setNewOs] = useState<LinuxOS>('Ubuntu 22.04 LTS');
  const [newMaxClaims, setNewMaxClaims] = useState(10);
  const [newExpiryDays, setNewExpiryDays] = useState<number | null>(30);
  const [adminErr, setAdminErr] = useState<string | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await redeemCouponCode(codeInput);
      setFeedback(res);
      if (res.success) {
        setCodeInput('');
      }
    } catch {
      setFeedback({ success: false, message: 'An unexpected error occurred while claiming code.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminErr(null);

    const res = createRedeemCode({
      code: newCodeName,
      description: newDesc,
      cpuCores: newCores,
      ramMb: newRamGb * 1024,
      diskGb: newDiskGb,
      bandwidthTb: newBwTb,
      defaultOs: newOs,
      maxClaims: newMaxClaims,
      expiresInDays: newExpiryDays,
    });

    if (res.success) {
      setIsCreateModalOpen(false);
      setNewCodeName('');
      setNewDesc('');
    } else {
      setAdminErr(res.message);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / User Redeem Box */}
      <div className="relative rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
            <Gift className="w-3.5 h-3.5" />
            <span>Instant Docker VPS Provisioning Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Claim Your Docker VPS Container
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Enter an authorized EVM coupon or promo code to automatically allocate dedicated vCPU cores, NVMe SSD storage, and boot up your Docker Linux instance immediately.
          </p>

          {/* Form */}
          <form onSubmit={handleRedeem} className="pt-2 max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 shadow-inner">
              <input
                type="text"
                required
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER PROMO CODE (e.g. EVM-STARTER-FREE)"
                className="flex-1 px-4 py-3 bg-transparent text-white font-mono text-sm uppercase placeholder-zinc-500 outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
              >
                {isSubmitting ? (
                  <Activity className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Redeem VPS</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Feedback messages */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs max-w-xl mx-auto flex items-center gap-3 animate-fade-in ${
                feedback.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span className="text-left font-medium">{feedback.message}</span>
            </div>
          )}

          {/* Available Code Quick Clips Helper */}
          <div className="pt-2 text-xs text-zinc-400 flex flex-wrap items-center justify-center gap-2">
            <span>Try active demo codes:</span>
            {redeemCodes
              .filter((c) => c.active && c.claimCount < c.maxClaims)
              .slice(0, 3)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCodeInput(c.code)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-cyan-300 font-mono text-[11px] transition-colors"
                >
                  {c.code}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Available Redeem Codes Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Active Coupon Catalog</h3>
            <p className="text-xs text-zinc-400">Available compute packages ready for redemption</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Code (Admin)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {redeemCodes.map((code) => {
            const hasUserClaimed = code.claimedBy.some((c) => c.userId === currentUser?.id);
            const isFull = code.claimCount >= code.maxClaims;

            return (
              <div
                key={code.id}
                className="relative rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-white tracking-wider bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 group-hover:border-cyan-500/40 transition-colors">
                      {code.code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === code.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2">{code.description}</p>
                </div>

                {/* Specs list */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-zinc-800/60">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{code.cpuCores} vCPU Cores</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{(code.ramMb / 1024).toFixed(0)} GB RAM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span>{code.diskGb} GB NVMe</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">{code.defaultOs.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Status and Action */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Claims: {code.claimCount}/{code.maxClaims}</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {code.expiresAt ? 'Limited Time' : 'No Expiry'}
                    </span>
                  </div>

                  {hasUserClaimed ? (
                    <div className="w-full py-2 text-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-medium">
                      ✓ Claimed by your account
                    </div>
                  ) : isFull ? (
                    <div className="w-full py-2 text-center text-xs text-zinc-500 bg-zinc-950 border border-zinc-800 rounded-xl">
                      Sold Out / Max Claims
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCodeInput(code.code);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-cyan-600 hover:text-white text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Redeem this Tier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="pt-2 flex items-center justify-between border-t border-zinc-850 text-xs">
                      <button
                        onClick={() => toggleRedeemCode(code.id)}
                        className={`text-[11px] ${code.active ? 'text-amber-400 hover:underline' : 'text-emerald-400 hover:underline'}`}
                      >
                        {code.active ? 'Disable Code' : 'Enable Code'}
                      </button>
                      <button
                        onClick={() => deleteRedeemCode(code.id)}
                        className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Create Redeem Code Modal */}
      {isCreateModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 pb-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Generate Redeem Code (Admin)</h3>
                  <p className="text-xs text-zinc-400">Set hardware limits, claim quotas, and distribution parameters</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="p-6 space-y-4">
              {adminErr && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminErr}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Coupon Code String</label>
                <input
                  type="text"
                  required
                  value={newCodeName}
                  onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                  placeholder="e.g. EVM-SUMMER-SPECIAL"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-xs text-white font-mono uppercase outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Community promotion tier with 2 vCPU"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl text-xs text-white outline-none"
                />
              </div>

              {/* Hardware Allocations */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    vCPU Cores: <span className="text-cyan-400">{newCores} Cores</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={16}
                    value={newCores}
                    onChange={(e) => setNewCores(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    RAM: <span className="text-emerald-400">{newRamGb} GB</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={32}
                    value={newRamGb}
                    onChange={(e) => setNewRamGb(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    NVMe Storage: <span className="text-amber-400">{newDiskGb} GB</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={10}
                    value={newDiskGb}
                    onChange={(e) => setNewDiskGb(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Bandwidth: <span className="text-indigo-400">{newBwTb} TB</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={newBwTb}
                    onChange={(e) => setNewBwTb(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Default Linux OS Template</label>
                <select
                  value={newOs}
                  onChange={(e) => setNewOs(e.target.value as LinuxOS)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                >
                  {OS_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.name} value={tmpl.name}>
                      {tmpl.name} ({tmpl.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Max Total Claims</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={newMaxClaims}
                    onChange={(e) => setNewMaxClaims(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Valid For (Days)</label>
                  <select
                    value={newExpiryDays === null ? 'never' : newExpiryDays}
                    onChange={(e) => setNewExpiryDays(e.target.value === 'never' ? null : parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="365">1 Year</option>
                    <option value="never">Never Expires</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20"
                >
                  Publish Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
