
import React, { useState } from 'react';
import Login from './components/Login';
import EnvironmentSelector from './components/EnvironmentSelector';
import { User } from './types';
import { ProducerProvider } from './context/ProducerContext';
import { MasterDataProvider } from './context/MasterDataContext';
import { ApplicationProvider } from './context/ApplicationContext';
import { PatternProvider } from './context/PatternContext';
import { RouteProvider } from './context/RouteContext';
import { VisitProvider } from './context/VisitContext';
import { CreditProvider } from './context/CreditContext';

// Mobile Components
import MobileLayout from './components/MobileLayout';
import MobileDashboard from './components/MobileDashboard';
import MobilePortfolioRoutes from './components/MobilePortfolioRoutes';
import MobileActivities from './components/MobileActivities';
import MobileDiagnosis from './components/MobileDiagnosis';
import MobileVisits from './components/MobileVisits';
import MobileHarvests from './components/MobileHarvests';
import MobileRoutePlanner from './components/MobileRoutePlanner';
import MobileRouteExecution from './components/MobileRouteExecution';
import MobileVisitWizard from './components/MobileVisitWizard';
import MobileRegistration from './components/MobileRegistration';
import Profile from './components/Profile';
import DataVisualization from './components/DataVisualization';

// Desktop Components
import DesktopLayout from './components/DesktopLayout';
import DesktopProducers from './components/DesktopProducers';
import DesktopFinancing from './components/DesktopFinancing';
import DesktopApplications from './components/DesktopApplications';
import DesktopSeeds from './components/DesktopSeeds';
import DesktopVisits from './components/DesktopVisits';
import DesktopHarvests from './components/DesktopHarvests';
import DesktopPlanning from './components/DesktopPlanning';
import DesktopRoutes from './components/DesktopRoutes';
import DesktopConfig from './components/DesktopConfig';
import DesktopOperations from './components/DesktopOperations';
import DesktopFarms from './components/DesktopFarms';
import DesktopFields from './components/DesktopFields';
import DesktopDeliveries from './components/DesktopDeliveries';
import DesktopMasters from './components/DesktopMasters';
import DesktopRoutePlanning from './components/DesktopRoutePlanning';
import Dashboard from './components/Dashboard';

// Producer Component
import ProducerWhatsApp from './components/ProducerWhatsApp';

type AppState = 'selector' | 'login' | 'app';

function App() {
  const [appState, setAppState] = useState<AppState>('selector');
  const [selectedMode, setSelectedMode] = useState<'mobile' | 'desktop' | 'producer' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [viewParams, setViewParams] = useState<any>(null);

  const handleEnvironmentSelect = (mode: 'mobile' | 'desktop' | 'producer') => {
    setSelectedMode(mode);
    setAppState('login');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setAppState('app');
    if (userData.appMode === 'mobile') {
        setActiveView('dashboard'); 
    } else if (userData.appMode === 'producer') {
        setActiveView('whatsapp');
    } else {
        setActiveView('dashboard-general');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedMode(null);
    setAppState('selector');
    setActiveView('dashboard-general');
  };

  const handleBackToSelector = () => {
    setAppState('selector');
    setSelectedMode(null);
  };

  const handleNavigate = (view: string, params?: any) => {
    if (view === 'selector' || view === 'logout') {
      handleLogout();
      return;
    }
    setActiveView(view);
    setViewParams(params || null);
  };

  const renderContent = () => {
    if (appState === 'selector') {
      return <EnvironmentSelector onSelect={handleEnvironmentSelect} />;
    }
  
    if (appState === 'login' || !user) {
      return <Login onLogin={handleLogin} preselectedMode={selectedMode} onBack={handleBackToSelector} />;
    }
  
    // Producer WhatsApp Mode
    if (user?.appMode === 'producer') {
        return <ProducerWhatsApp onNavigate={handleNavigate} />;
    }
  
    // Mobile Technician Mode
    if (user?.appMode === 'mobile') {
      return (
        <MobileLayout activeView={activeView} onNavigate={handleNavigate} user={user}>
          {activeView === 'portfolio' && <MobilePortfolioRoutes onNavigate={handleNavigate} user={user} />}
          {activeView === 'dashboard' && <MobileDashboard onNavigate={handleNavigate} user={user} />}
          {activeView === 'activities' && <MobileActivities onNavigate={handleNavigate} params={viewParams} />}
          {activeView === 'diagnosis' && <MobileDiagnosis onNavigate={handleNavigate} params={viewParams} />}
          {activeView === 'visits' && <MobileVisits onNavigate={handleNavigate} params={viewParams} user={user} />}
          {activeView === 'harvests' && <MobileHarvests onNavigate={handleNavigate} params={viewParams} />}
          {activeView === 'profile' && <Profile onNavigate={handleNavigate} user={user} />}
          {activeView === 'dataviz' && <DataVisualization onNavigate={handleNavigate} params={viewParams} />}
          {activeView === 'route-planner' && <MobileRoutePlanner onNavigate={handleNavigate} params={viewParams} />}
          {activeView === 'route-execution' && <MobileRouteExecution onNavigate={handleNavigate} params={viewParams} />}
          {activeView === 'visit-wizard' && <MobileVisitWizard onNavigate={handleNavigate} params={viewParams} />}
          {activeView === 'mobile-registration' && <MobileRegistration onNavigate={handleNavigate} params={viewParams} />}
        </MobileLayout>
      );
    }
  
    // Desktop Odoo Mode
    const isDashboard = activeView.startsWith('dashboard');
    const isMasters = activeView.startsWith('masters-');
  
    return (
      <DesktopLayout activeView={activeView} onNavigate={handleNavigate} user={user}>
        {isDashboard && (
          <Dashboard 
            onNavigate={handleNavigate} 
            user={user} 
            currentView={activeView}
          />
        )}
  
        {/* MASTER DATA MANAGEMENT */}
        {isMasters && (
            <DesktopMasters 
              onNavigate={handleNavigate} 
              tab={activeView.replace('masters-', '') as any} 
            />
        )}
  
        {/* OPERATIONS */}
        {activeView === 'ops-producers' && <DesktopProducers onNavigate={handleNavigate} />}
        {activeView === 'ops-farms' && <DesktopFarms onNavigate={handleNavigate} />}
        {activeView === 'ops-fields' && <DesktopFields onNavigate={handleNavigate} params={viewParams} />}
        {activeView === 'ops-planning' && <DesktopPlanning onNavigate={handleNavigate} />}
        {activeView === 'ops-visits' && <DesktopVisits onNavigate={handleNavigate} />}
        {activeView === 'ops-routes' && <DesktopRoutes onNavigate={handleNavigate} />}
        {activeView === 'ops-route-planning' && <DesktopRoutePlanning onNavigate={handleNavigate} />}
        {activeView === 'ops-deliveries' && <DesktopDeliveries onNavigate={handleNavigate} />}
        {activeView === 'ops-applications' && <DesktopApplications onNavigate={handleNavigate} params={viewParams} />}
        {activeView === 'config-patterns' && <DesktopConfig onNavigate={handleNavigate} />}
  
        {/* Legacy / Direct Routes */}
        {activeView === 'financing' && <DesktopFinancing onNavigate={handleNavigate} params={viewParams} />}
        {activeView === 'harvests' && <DesktopHarvests onNavigate={handleNavigate} />}
        {activeView === 'seeds' && <DesktopSeeds onNavigate={handleNavigate} />}
        {activeView === 'dataviz' && <DataVisualization onNavigate={handleNavigate} params={viewParams} />}
        
      </DesktopLayout>
    );
  };

  return (
    <MasterDataProvider>
      <ProducerProvider>
        <ApplicationProvider>
          <PatternProvider>
            <VisitProvider>
              <RouteProvider>
                <CreditProvider>
                  {renderContent()}
                </CreditProvider>
              </RouteProvider>
            </VisitProvider>
          </PatternProvider>
        </ApplicationProvider>
      </ProducerProvider>
    </MasterDataProvider>
  );
}

export default App;
