import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './authContext';
import { useAdminStore } from './adminStore';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminLayout, AdminModule } from './components/AdminLayout';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { OrdersView } from './components/OrdersView';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { FinanceView } from './components/FinanceView';
import { UsersAndRbacView } from './components/UsersAndRbacView';
import { SettingsView } from './components/SettingsView';
import { AuditLogsView } from './components/AuditLogsView';
import { SetupGuideModal } from './components/SetupGuideModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { EmiManagementView } from './components/EmiManagementView';
import { CustomerDueReportView } from './components/CustomerDueReportView';
import { SupplierManagementView } from './components/SupplierManagementView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { ReportsView } from './components/ReportsView';
import { ZonesAndSoftwareManagerView } from './components/ZonesAndSoftwareManagerView';
import { ReconditionManagementView } from './components/ReconditionManagementView';
import { SecurityAndDownloadIntelligenceView } from './components/SecurityAndDownloadIntelligenceView';
import { CustomerReviewsAndCommentsView } from './components/CustomerReviewsAndCommentsView';
import { DataCenterView } from './components/DataCenterView';
import { ServiceZoneView } from './components/service/ServiceZoneView';
import { SecurityCommandCenterView } from './components/SecurityCommandCenterView';
import { ServiceRequestsView } from './components/ServiceRequestsView';
import { LatitudeInventoryView } from './components/LatitudeInventoryView';
import { ProductImageManagerView } from './components/ProductImageManagerView';

interface AdminPanelProps {
  onSwitchToWebsite: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSwitchToWebsite }) => {
  const { currentUser, isInitialized } = useAdminAuth();
  const { createFullSystemBackup } = useAdminStore();

  const [currentModule, setCurrentModule] = useState<AdminModule>('dashboard');
  const [moduleNavTick, setModuleNavTick] = useState(0);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);
  const [firebaseConfigOpen, setFirebaseConfigOpen] = useState(false);

  const handleSelectModule = (module: AdminModule) => {
    setCurrentModule(module);
    setModuleNavTick((t) => t + 1);
  };

  // Auto Session-Entry Backup when Admin enters Admin Panel
  useEffect(() => {
    if (currentUser) {
      const sessionKey = `jhf_session_bkp_${currentUser.uid || currentUser.email}_${new Date().toISOString().slice(0, 10)}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'recorded');
        createFullSystemBackup(
          'session_entry',
          `Admin Portal Session Started by ${currentUser.name}`,
          `Admin Session Login: ${currentUser.name}`
        );
      }
    }
  }, [currentUser]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xs font-semibold">Initializing JHF Enterprise Admin Portal...</div>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Enterprise Login Page
  if (!currentUser) {
    return (
      <>
        <AdminLoginPage
          onOpenSetupGuide={() => setSetupGuideOpen(true)}
          onOpenFirebaseConfig={() => setFirebaseConfigOpen(true)}
          onBackToWebsite={onSwitchToWebsite}
        />
        <SetupGuideModal
          isOpen={setupGuideOpen}
          onClose={() => setSetupGuideOpen(false)}
          onOpenConfig={() => setFirebaseConfigOpen(true)}
        />
        <FirebaseConfigModal
          isOpen={firebaseConfigOpen}
          onClose={() => setFirebaseConfigOpen(false)}
        />
      </>
    );
  }

  // Logged in -> Render Main Admin Dashboard
  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard':
      case 'analytics':
        return <DashboardView onNavigate={setCurrentModule} />;
      case 'recondition':
        return <ReconditionManagementView />;
      case 'products':
      case 'add_product':
        return (
          <ProductsView
            initialTrashMode={false}
            navigationTick={moduleNavTick}
            onOpenLatitudeImport={() => handleSelectModule('latitude_inventory')}
            onOpenImageManager={() => handleSelectModule('image_manager')}
          />
        );
      case 'image_manager':
        return <ProductImageManagerView />;
      case 'latitude_inventory':
        return <LatitudeInventoryView />;
      case 'trash_products':
        return <ProductsView initialTrashMode={true} navigationTick={moduleNavTick} />;
      case 'orders':
      case 'sales':
        return <OrdersView />;
      case 'emi':
        return <EmiManagementView />;
      case 'due_report':
        return <CustomerDueReportView />;
      case 'suppliers':
        return <SupplierManagementView />;
      case 'reports':
        return <ReportsView />;
      case 'hosting_panel':
      case 'backup':
        return <BackupRestoreView />;
      case 'testing_zone':
        return <ZonesAndSoftwareManagerView initialZone="testing" />;
      case 'os_zone':
        return <ZonesAndSoftwareManagerView initialZone="os" />;
      case 'software_zone':
        return <ZonesAndSoftwareManagerView initialZone="software" />;
      case 'media_cards':
        return <ZonesAndSoftwareManagerView initialZone="cards" />;
      case 'zones_downloads':
        return <ZonesAndSoftwareManagerView initialZone="software" />;
      case 'customers':
        return <CustomersView />;
      case 'inventory':
        return <InventoryView initialAction="none" navigationTick={moduleNavTick} />;
      case 'stock_in':
        return <InventoryView initialAction="stock_in" navigationTick={moduleNavTick} />;
      case 'stock_out':
        return <InventoryView initialAction="stock_out" navigationTick={moduleNavTick} />;
      case 'security_downloads':
        return <SecurityAndDownloadIntelligenceView />;
      case 'comments':
      case 'reviews':
        return <CustomerReviewsAndCommentsView />;
      case 'finance':
      case 'finance_revenue':
      case 'finance_expenses':
        return <FinanceView />;
      case 'users':
        return <UsersAndRbacView />;
      case 'settings':
        return <SettingsView />;
      case 'logs':
        return <AuditLogsView />;
      case 'data_center':
        return <DataCenterView />;
      case 'security_center':
        return <SecurityCommandCenterView initialSubTab="center" navigationTick={moduleNavTick} />;
      case 'security_ip':
        return <SecurityCommandCenterView initialSubTab="ip" navigationTick={moduleNavTick} />;
      case 'security_risk':
        return <SecurityCommandCenterView initialSubTab="risk" navigationTick={moduleNavTick} />;
      case 'service_requests':
        return <ServiceRequestsView />;
      case 'service_dashboard':
        return (
          <ServiceZoneView
            initialTab="dashboard"
            navigationTick={moduleNavTick}
            onTabChange={(tab) => setCurrentModule(`service_${tab}` as AdminModule)}
          />
        );
      case 'service_new':
        return (
          <ServiceZoneView
            initialTab="new"
            navigationTick={moduleNavTick}
            onTabChange={(tab) => setCurrentModule(`service_${tab}` as AdminModule)}
          />
        );
      case 'service_active':
        return (
          <ServiceZoneView
            initialTab="active"
            navigationTick={moduleNavTick}
            onTabChange={(tab) => setCurrentModule(`service_${tab}` as AdminModule)}
          />
        );
      case 'service_estimates':
        return (
          <ServiceZoneView
            initialTab="estimates"
            navigationTick={moduleNavTick}
            onTabChange={(tab) => setCurrentModule(`service_${tab}` as AdminModule)}
          />
        );
      case 'service_engineers':
        return (
          <ServiceZoneView
            initialTab="engineers"
            navigationTick={moduleNavTick}
            onTabChange={(tab) => setCurrentModule(`service_${tab}` as AdminModule)}
          />
        );
      case 'service_parts':
        return (
          <ServiceZoneView
            initialTab="parts"
            navigationTick={moduleNavTick}
            onTabChange={(tab) => setCurrentModule(`service_${tab}` as AdminModule)}
          />
        );
      case 'service_warranty':
        return (
          <ServiceZoneView
            initialTab="warranty"
            navigationTick={moduleNavTick}
            onTabChange={(tab) => setCurrentModule(`service_${tab}` as AdminModule)}
          />
        );
      case 'service_invoices':
        return (
          <ServiceZoneView
            initialTab="invoices"
            navigationTick={moduleNavTick}
            onTabChange={(tab) => setCurrentModule(`service_${tab}` as AdminModule)}
          />
        );
      case 'service_reports':
        return (
          <ServiceZoneView
            initialTab="reports"
            navigationTick={moduleNavTick}
            onTabChange={(tab) => setCurrentModule(`service_${tab}` as AdminModule)}
          />
        );
      default:
        return <DashboardView onNavigate={handleSelectModule} />;
    }
  };

  return (
    <>
      <AdminLayout
        currentModule={currentModule}
        setCurrentModule={handleSelectModule}
        onOpenSetupGuide={() => setSetupGuideOpen(true)}
        onOpenFirebaseConfig={() => setFirebaseConfigOpen(true)}
        onSwitchToWebsite={onSwitchToWebsite}
      >
        {renderModuleContent()}
      </AdminLayout>

      <SetupGuideModal
        isOpen={setupGuideOpen}
        onClose={() => setSetupGuideOpen(false)}
        onOpenConfig={() => setFirebaseConfigOpen(true)}
      />
      <FirebaseConfigModal
        isOpen={firebaseConfigOpen}
        onClose={() => setFirebaseConfigOpen(false)}
      />
    </>
  );
};
