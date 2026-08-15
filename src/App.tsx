import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VPSProvider, useVPS } from './context/VPSContext';
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

const MainLayout: React.FC = () => {
  const { currentUser, isAdmin, isLoggedIn } = useAuth();
  const { setSelectedVpsId } = useVPS();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isReinstallModalOpen, setIsReinstallModalOpen] = useState(false);

  const handleDeploySuccess = (instanceId: string) => {
    setSelectedVpsId(instanceId);
    setActiveTab('vps');
  };

  // If not logged in, present the user with the mandatory EVM Panel Login & Registration portal
  if (!currentUser || !isLoggedIn) {
    return <AuthModal isFullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDeployModal={() => {
          if (isAdmin) {
            setIsDeployModalOpen(true);
          } else {
            setActiveTab('admin'); // Will trigger Access Denied view to clearly demonstrate RBAC
          }
        }}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
            />
          )}

          {activeTab === 'vps' && (
            <VPSDetailView
              onOpenTerminal={() => setActiveTab('terminal')}
              onOpenNAT={() => setActiveTab('nat')}
              onOpenReinstall={() => setIsReinstallModalOpen(true)}
            />
          )}

          {activeTab === 'terminal' && <WebTerminal />}

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
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <VPSProvider>
        <MainLayout />
      </VPSProvider>
    </AuthProvider>
  );
}
