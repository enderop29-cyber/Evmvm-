import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VPSProvider, useVPS } from './context/VPSContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { VPSDetailView } from './components/VPSDetailView';
import { WebTerminal } from './components/WebTerminal';
import { NATManager } from './components/NATManager';
import { RedeemCodeCenter } from './components/RedeemCodeCenter';
import { AdminPanel } from './components/AdminPanel';
import { DeployVPSModal } from './components/DeployVPSModal';
import { ReinstallModal } from './components/ReinstallModal';
import { AuthModal } from './components/AuthModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { SSHSessionModal } from './components/SSHSessionModal';

const MainLayout: React.FC = () => {
  const { currentUser, isAdmin, isLoggedIn } = useAuth();
  const { userInstances, selectedVps, setSelectedVpsId } = useVPS();
  const { theme, isSettingsOpen, setIsSettingsOpen } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isReinstallModalOpen, setIsReinstallModalOpen] = useState(false);
  const [isSSHModalOpen, setIsSSHModalOpen] = useState(false);
  const [sshTargetVpsId, setSshTargetVpsId] = useState<string | null>(null);

  const handleDeploySuccess = (instanceId: string) => {
    setSelectedVpsId(instanceId);
    setActiveTab('vps');
  };

  const handleOpenSSH = (vpsId?: string) => {
    if (vpsId) {
      setSelectedVpsId(vpsId);
      setSshTargetVpsId(vpsId);
    }
    setIsSSHModalOpen(true);
  };

  // If not logged in, present the user with the mandatory EVM Panel Login & Registration portal
  if (!currentUser || !isLoggedIn) {
    return <AuthModal isFullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Dynamic Background Image & Wallpaper Layer */}
      {theme.backgroundImageUrl ? (
        <div
          className="fixed inset-0 bg-cover bg-center pointer-events-none z-0 transition-all duration-700"
          style={{
            backgroundImage: `url(${theme.backgroundImageUrl})`,
            opacity: (theme.backgroundOpacity ?? 25) / 100,
            filter: `blur(${theme.backgroundBlur ?? 0}px)`,
            transform: 'scale(1.05)',
          }}
        />
      ) : null}

      {/* Cyber Glow Accent Overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.06),rgba(255,255,255,0))] pointer-events-none z-0" />

      {/* Top Navigation */}
      <div className="relative z-40">
        <Navbar
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenThemeModal={() => setIsSettingsOpen(true)}
          onOpenDeployModal={() => {
            if (isAdmin) {
              setIsDeployModalOpen(true);
            } else {
              setActiveTab('admin'); // Will trigger Access Denied view to clearly demonstrate RBAC
            }
          }}
        />
      </div>

      {/* Main Body */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenThemeModal={() => setIsSettingsOpen(true)}
          onOpenDeployModal={() => {
            if (isAdmin) {
              setIsDeployModalOpen(true);
            } else {
              setActiveTab('admin'); // Directs to access denied explanation
            }
          }}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenDeployModal={() => {
                if (isAdmin) {
                  setIsDeployModalOpen(true);
                } else {
                  setActiveTab('admin');
                }
              }}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onOpenSSHSession={(vpsId) => handleOpenSSH(vpsId)}
            />
          )}

          {activeTab === 'vps' && (
            <VPSDetailView
              onOpenTerminal={() => setActiveTab('terminal')}
              onOpenNAT={() => setActiveTab('nat')}
              onOpenReinstall={() => setIsReinstallModalOpen(true)}
              onOpenSSHSession={() => handleOpenSSH()}
            />
          )}

          {activeTab === 'terminal' && (
            <WebTerminal
              onOpenSSHSession={() => handleOpenSSH()}
            />
          )}

          {activeTab === 'nat' && <NATManager />}

          {activeTab === 'redeem' && <RedeemCodeCenter />}

          {activeTab === 'admin' && (
            <AdminPanel
              onOpenDeployModal={() => setIsDeployModalOpen(true)}
              setActiveTab={setActiveTab}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <DeployVPSModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onSuccess={handleDeploySuccess}
      />

      <ReinstallModal
        isOpen={isReinstallModalOpen}
        onClose={() => setIsReinstallModalOpen(false)}
      />

      <SSHSessionModal
        isOpen={isSSHModalOpen}
        onClose={() => {
          setIsSSHModalOpen(false);
          setSshTargetVpsId(null);
        }}
        vps={userInstances.find((v) => v.id === sshTargetVpsId) || selectedVps}
        onOpenWebTerminal={() => setActiveTab('terminal')}
      />

      <ThemeCustomizerModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VPSProvider>
          <MainLayout />
        </VPSProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
