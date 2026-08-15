import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, KeyRound, Check } from 'lucide-react';
import { useVPS } from '../context/VPSContext';
import { LinuxOS } from '../types';
import { OS_TEMPLATES } from '../lib/mockData';

interface ReinstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReinstallModal: React.FC<ReinstallModalProps> = ({ isOpen, onClose }) => {
  const { selectedVps, reinstallVPS } = useVPS();
  const [selectedOs, setSelectedOs] = useState<LinuxOS>(selectedVps?.os || 'Ubuntu 22.04 LTS');
  const [rootPassword, setRootPassword] = useState('root_' + Math.random().toString(36).substring(2, 10));
  const [isReinstalling, setIsReinstalling] = useState(false);

  if (!isOpen || !selectedVps) return null;

  const handleReinstall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReinstalling(true);
    await reinstallVPS(selectedVps.id, selectedOs, rootPassword);
    setIsReinstalling(false);
    onClose();
  };

  const generateNewPassword = () => {
    setRootPassword('root_' + Math.random().toString(36).substring(2, 10));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 pb-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reinstall Operating System</h3>
              <p className="text-xs text-zinc-400">Instance: {selectedVps.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleReinstall} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">WARNING: Destructive Operation</strong>
              All filesystem data in this container will be wiped and replaced with the selected base Docker image.
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Target Linux OS</label>
            <select
              value={selectedOs}
              onChange={(e) => setSelectedOs(e.target.value as LinuxOS)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none"
            >
              {OS_TEMPLATES.map((tmpl) => (
                <option key={tmpl.name} value={tmpl.name}>
                  {tmpl.name} ({tmpl.tag})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-zinc-300">New Root Password</label>
              <button
                type="button"
                onClick={generateNewPassword}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" /> Regenerate
              </button>
            </div>
            <input
              type="text"
              required
              value={rootPassword}
              onChange={(e) => setRootPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-emerald-400 font-mono outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isReinstalling}
              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20"
            >
              {isReinstalling ? 'Formatting & Reinstalling...' : 'Wipe & Reinstall OS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
