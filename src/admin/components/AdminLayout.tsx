import React, { useState } from 'react';
import { useAdminAuth } from '../authContext';
import { useAdminStore } from '../adminStore';
import {
  LayoutDashboard,
  Laptop,
  ShoppingCart,
  Users,
  TrendingUp,
  Boxes,
  FileText,
  MessageSquare,
  DollarSign,
  BarChart3,
  Settings,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Plus,
  ExternalLink,
  HelpCircle,
  Database,
  Moon,
  Sun,
  Trash2,
  PackagePlus,
  PackageMinus,
  RefreshCw,
  Printer,
  CreditCard,
  FileSpreadsheet,
  Truck,
  FolderOpen,
  Sparkles,
  Wrench,
  Disc,
  Download,
  ShieldAlert,
  Clock,
  Globe,
  Activity,
  Terminal,
  HardDrive,
  Server,
  Star,
} from 'lucide-react';
import { SalesInvoiceModal } from './SalesInvoiceModal';
import { CommandPaletteModal } from './CommandPaletteModal';

export type AdminModule =
  | 'dashboard'
  | 'recondition'
  | 'products'
  | 'add_product'
  | 'trash_products'
  | 'orders'
  | 'customers'
  | 'sales'
  | 'reviews'
  | 'comments'
  | 'emi'
  | 'due_report'
  | 'suppliers'
  | 'inventory'
  | 'stock_in'
  | 'stock_out'
  | 'reports'
  | 'backup'
  | 'hosting_panel'
  | 'testing_zone'
  | 'os_zone'
  | 'software_zone'
  | 'media_cards'
  | 'zones_downloads'
  | 'security_downloads'
  | 'finance'
  | 'finance_revenue'
  | 'finance_expenses'
  | 'analytics'
  | 'security_center'
  | 'security_ip'
  | 'security_risk'
  | 'data_center'
  | 'users'
  | 'settings'
  | 'logs'
  // JHF SERVICE ZONE
  | 'service_dashboard'
  | 'service_new'
  | 'service_active'
  | 'service_estimates'
  | 'service_engineers'
  | 'service_parts'
  | 'service_warranty'
  | 'service_invoices'
  | 'service_reports';

interface AdminLayoutProps {
  currentModule: AdminModule;
  setCurrentModule: (module: AdminModule) => void;
  onOpenSetupGuide: () => void;
  onOpenFirebaseConfig: () => void;
  onSwitchToWebsite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentModule,
  setCurrentModule,
  onOpenSetupGuide,
  onOpenFirebaseConfig,
  onSwitchToWebsite,
  children,
}) => {
  const {
    currentUser,
    logout,
    isFirebaseLive,
    hasPermission,
    inactivitySecondsLeft,
    resetInactivityTimer,
  } = useAdminAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    products,
    orders,
    emiPlans,
    reconditionSummary,
    services,
    serviceParts,
    warrantyClaims,
    fullBackups,
  } = useAdminStore();

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const lowStockCount = products.filter((p) => !p.isDeleted && p.stockQuantity <= p.minimumStockAlert).length;
  const pendingOrdersCount = orders.filter((o) => ['new', 'pending'].includes(o.orderStatus)).length;
  const overdueEmiCount = (emiPlans || []).filter((p) => p.isOverdue || p.status === 'overdue').length;
  const activeServicesCount = (services || []).filter((s) => s.status !== 'DELIVERED').length;
  const warrantyClaimsCount = (warrantyClaims || []).length;

  const roleBadgeColor = {
    super_admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    admin: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    manager: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    sales_staff: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    inventory_staff: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    customer_support: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    content_editor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    viewer: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  }[currentUser?.role || 'viewer'];

  const navItems = [
    {
      group: 'COMMAND CENTER',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'Dashboard' },
      ],
    },
    {
      group: 'SALES',
      items: [
        { id: 'orders', label: 'Orders', icon: ShoppingCart, count: pendingOrdersCount, countColor: 'bg-rose-500', permission: 'Orders' },
        { id: 'products', label: 'Products', icon: Laptop, permission: 'Products' },
        { id: 'inventory', label: 'Inventory', icon: Boxes, count: lowStockCount, countColor: 'bg-amber-500', permission: 'Inventory' },
        { id: 'customers', label: 'Customers', icon: Users, permission: 'Customers' },
        { id: 'reviews', label: 'Reviews', icon: Star, permission: 'Comments' },
        { id: 'comments', label: 'Comments', icon: MessageSquare, permission: 'Comments' },
      ],
    },
    {
      group: 'DOWNLOADS',
      items: [
        { id: 'software_zone', label: 'Software', icon: Download, permission: 'Blogger Posts' },
        { id: 'testing_zone', label: 'Testing Tools', icon: Wrench, permission: 'Blogger Posts' },
        { id: 'os_zone', label: 'Operating Systems', icon: Disc, permission: 'Blogger Posts' },
        { id: 'security_downloads', label: 'Download Intelligence', icon: ShieldAlert, permission: 'Settings' },
      ],
    },
    {
      group: 'JHF SERVICE ZONE',
      items: [
        { id: 'service_dashboard', label: 'Service Dashboard', icon: Wrench, permission: 'Products' },
        { id: 'service_new', label: 'New Service', icon: Plus, permission: 'Products' },
        { id: 'service_active', label: 'Active Services', icon: Clock, count: activeServicesCount, countColor: 'bg-blue-500', permission: 'Products' },
        { id: 'service_estimates', label: 'Estimates', icon: DollarSign, permission: 'Sales' },
        { id: 'service_engineers', label: 'Engineers', icon: Users, permission: 'Products' },
        { id: 'service_parts', label: 'Service Parts', icon: HardDrive, permission: 'Inventory' },
        { id: 'service_warranty', label: 'Warranty', icon: ShieldCheck, count: warrantyClaimsCount, countColor: 'bg-purple-500', permission: 'Products' },
        { id: 'service_invoices', label: 'Service Invoices', icon: Printer, permission: 'Sales' },
        { id: 'service_reports', label: 'Service Reports', icon: FileText, permission: 'Analytics' },
      ],
    },
    {
      group: 'FINANCE',
      items: [
        { id: 'finance', label: 'Revenue & Expenses', icon: DollarSign, permission: 'Finance' },
        { id: 'emi', label: 'EMI Plans', icon: CreditCard, count: overdueEmiCount, countColor: 'bg-rose-500', permission: 'Sales' },
        { id: 'due_report', label: 'Customer Due', icon: FileSpreadsheet, permission: 'Sales' },
        { id: 'suppliers', label: 'Suppliers', icon: Truck, permission: 'Inventory' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'Analytics' },
      ],
    },
    {
      group: 'SECURITY',
      items: [
        { id: 'security_center', label: 'Security Center', icon: Activity, permission: 'Settings' },
        { id: 'security_ip', label: 'IP Activity', icon: Globe, permission: 'Settings' },
        { id: 'security_risk', label: 'Risk Monitor', icon: AlertTriangle, permission: 'Settings' },
        { id: 'logs', label: 'Audit Logs', icon: ClipboardList, permission: 'Settings' },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'users', label: 'Users & Roles', icon: ShieldCheck, permission: 'Users' },
        { id: 'hosting_panel', label: 'Hosting & Server (cPanel)', icon: Server, permission: 'Settings' },
        {
          id: 'backup',
          label: 'Backup & Restore',
          icon: Database,
          count: fullBackups.length,
          countColor: 'bg-emerald-600',
          permission: 'Settings',
        },
        { id: 'data_center', label: 'Data Center', icon: HardDrive, permission: 'Settings' },
        { id: 'settings', label: 'Settings', icon: Settings, permission: 'Settings' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-300 hover:text-white p-1 rounded-lg bg-slate-800"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
            <span className="text-blue-500">JHF</span> ADMIN
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Inactivity Auto-Logout Timer */}
          <button
            onClick={resetInactivityTimer}
            title="5-minute auto-logout timer. Tap to reset."
            className={`flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg border transition ${
              inactivitySecondsLeft <= 60
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse font-bold'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            <Clock className={`w-3 h-3 ${inactivitySecondsLeft <= 60 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span>{formatSeconds(inactivitySecondsLeft)}</span>
          </button>

          <button
            onClick={() => setCurrentModule('backup')}
            className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 text-[11px] font-bold"
            title="cPanel & Backup"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xs:inline">Backup</span>
          </button>

          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifs.length}
              </span>
            )}
          </button>
          <button
            onClick={onSwitchToWebsite}
            className="text-[11px] bg-blue-600/20 text-blue-400 font-semibold px-2.5 py-1 rounded-lg border border-blue-500/30"
          >
            Website
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 bg-slate-900/95 md:bg-slate-900 border-r border-slate-800 w-64 flex flex-col transition-transform duration-300 backdrop-blur-md ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm">
                JHF
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white leading-tight">JHF LAPTOP ZONE</h1>
                <p className="text-[10px] font-semibold text-blue-400 tracking-wider">ADMIN CONTROL</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Pill */}
        <div className="px-4 pt-3 pb-1">
          <div
            onClick={onOpenFirebaseConfig}
            className="cursor-pointer bg-slate-950/70 hover:bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isFirebaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              ></span>
              <div className="text-[11px] leading-tight">
                <div className="text-slate-300 font-semibold group-hover:text-blue-300">
                  {isFirebaseLive ? 'Cloud Firestore' : 'Local Storage Mode'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isFirebaseLive ? 'Live Sync Active' : 'Click to connect Firebase'}
                </div>
              </div>
            </div>
            <Database className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((group) => (
            <div key={group.group}>
              <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider mb-1.5 uppercase">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const allowed = hasPermission(item.permission);
                  const isActive = currentModule === item.id;
                  const Icon = item.icon;

                  if (!allowed) return null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentModule(item.id as AdminModule);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${
                            item.countColor || 'bg-blue-500'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">@{currentUser?.email}</div>
                <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded border ${roleBadgeColor}`}>
                  {currentUser?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* 5-Min Idle Policy Status */}
          <div className="mb-2 px-2 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${inactivitySecondsLeft <= 60 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-slate-300">5m Auto-Logout</span>
            </span>
            <span className={`font-bold ${inactivitySecondsLeft <= 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {formatSeconds(inactivitySecondsLeft)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onSwitchToWebsite}
              className="w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold py-1.5 rounded-lg transition"
            >
              Public Site
            </button>
            <button
              onClick={logout}
              className="w-full text-center bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-[11px] font-semibold py-1.5 rounded-lg border border-rose-500/20 transition flex items-center justify-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Desktop Top Navigation */}
        <header className="hidden md:flex bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="relative w-full flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-1.5 text-xs text-slate-400 transition cursor-pointer font-mono"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Command Center (Product, Orders, SOC, Customer)...</span>
              </div>
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700 text-emerald-400 rounded">
                Ctrl + K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* 5-Minute Inactivity Auto-Logout Badge */}
            <button
              onClick={resetInactivityTimer}
              title="Auto-logout after 5 minutes of inactivity. Click to keep session active."
              className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono transition cursor-pointer ${
                inactivitySecondsLeft <= 60
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-md shadow-rose-950 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Clock className={`w-3.5 h-3.5 ${inactivitySecondsLeft <= 60 ? 'text-rose-400 animate-spin' : 'text-emerald-400'}`} />
                <span className="hidden xl:inline text-[11px] text-slate-400">AUTO-LOGOUT:</span>
                <span className={`font-bold tracking-wider ${inactivitySecondsLeft <= 60 ? 'text-rose-400 font-black' : 'text-emerald-400'}`}>
                  {formatSeconds(inactivitySecondsLeft)}
                </span>
              </div>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  inactivitySecondsLeft <= 60 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                }`}
              />
            </button>

            {/* Sales Invoice Button */}
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition font-bold shadow-md shadow-emerald-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Sales Invoice</span>
            </button>

            {/* Quick Hosting & Backup Button */}
            <button
              onClick={() => setCurrentModule('backup')}
              className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl border border-indigo-500/30 flex items-center gap-1.5 transition font-bold"
              title="Full Site & Database Backup / Hosting cPanel"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">cPanel / Backup</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="10-Year Safe Vault Active" />
            </button>

            {/* Setup Guide Button */}
            <button
              onClick={onOpenSetupGuide}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Firebase Guide</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center relative transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="font-bold text-white">Notifications ({unreadNotifs.length})</span>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-slate-500 text-center py-4">No notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition ${
                            notif.isRead
                              ? 'bg-slate-950/40 border-slate-800/40 text-slate-400'
                              : 'bg-blue-500/10 border-blue-500/20 text-slate-200'
                          }`}
                        >
                          <div className="font-bold text-white text-[11px] mb-0.5">{notif.title}</div>
                          <div className="text-[10px] text-slate-400 leading-tight">{notif.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Back to Public Site */}
            <button
              onClick={onSwitchToWebsite}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Store</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Injection */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

      </div>

      {/* Global Sales Invoice Modal */}
      {isInvoiceModalOpen && (
        <SalesInvoiceModal
          order={null}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}

      {/* 5-Minute Inactivity Warning Floating Alert Modal */}
      {inactivitySecondsLeft <= 60 && inactivitySecondsLeft > 0 && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] bg-[#0d121a] border-2 border-rose-500/90 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-bounce">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs font-bold text-white tracking-wider">সেশন সমাপ্তির সতর্কবার্তা</span>
                <span className="text-xs font-black text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40">
                  {inactivitySecondsLeft}s
                </span>
              </div>
              <p className="text-slate-200 text-xs mt-1.5 leading-snug">
                ৫ মিনিট কোনো কার্যক্রম না থাকায় আর <strong>{inactivitySecondsLeft} সেকেন্ড</strong> পর অ্যাডমিন প্যানেল স্বয়ংক্রিয়ভাবে লগআউট হয়ে যাবে।
              </p>
              <p className="text-slate-400 text-[10px] font-mono mt-0.5">
                Session closing in {inactivitySecondsLeft}s due to inactivity. Re-enter password to log in again.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={resetInactivityTimer}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-1.5 px-3 rounded-lg text-xs transition shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Stay Logged In (চালু রাখুন)</span>
                </button>
                <button
                  onClick={logout}
                  className="bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold py-1.5 px-3 rounded-lg text-xs transition border border-rose-500/30 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
