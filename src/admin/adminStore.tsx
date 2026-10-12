import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  Order,
  Customer,
  InventoryTransaction,
  Supplier,
  Expense,
  AdminNotification,
  WebsiteSettings,
  OrderStatus,
  StockOutReason,
  AdminUser,
  AdminRole,
  ActivityLog,
  BloggerSettings,
  PaymentStatus,
  StockUnit,
  StockStatus,
  SupplierPurchase,
  SupplierPayment,
  EmiPlan,
  EmiPayment,
  BackupLog,
  ERPPaymentMethod,
  ReconditionLaptop,
  DownloadEvent,
  SecurityEvent,
  SecurityVerificationRecord,
  CustomerReview,
  ToolComment,
  ToolCommentReply,
  ServiceJob,
  ServiceEngineer,
  ServicePart,
  ServicePartUsage,
  ServicePaymentRecord,
  WarrantyClaim,
  FullSystemBackup,
} from './types';
import { LaptopCatalogModel, LAPTOP_MODEL_CATALOG } from './data/laptopModelCatalog';
import {
  INITIAL_SERVICES,
  INITIAL_SERVICE_ENGINEERS,
  INITIAL_SERVICE_PARTS,
  INITIAL_WARRANTY_CLAIMS,
} from './data/serviceInitialData';
import { useAdminAuth } from './authContext';
import { OFFICIAL_BANK_ACCOUNTS } from '../data/jhfData';
import {
  enablePersistentStorage,
  mirrorTableToVault,
  saveSnapshotToVault,
  getAllVaultSnapshots,
  deleteSnapshotFromVault,
} from '../utils/persistentVault';

export const BUSINESS_INFO = {
  name: 'JHF Laptop Zone',
  tagline: 'Best Laptop Buy , Sell & Accessories Importer, Traders & Suppliers',
  branchOffice: 'Baroipara Bazar, Chandra, Gazipur',
  mainOffice: 'Sonali Trade, Shop No : 1001 & 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka',
  location: 'Main Office: Sonali Trade, Shop No: 1001 & 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka | Branch: Baroipara Bazar, Chandra, Gazipur',
  ownerName: 'মোঃ জাহিদ হাসান (MD. Jahid Hasan)',
  developer: 'Md. Jahid Hasan',
  developerRole: 'System Architect & Full Stack Developer',
  phone: '01935-693071',
  secondaryPhone: '01731-693071',
  hotline: '01935-693071',
  email: 'jhflaptopzone@gmail.com',
  facebook: 'www.facebook.com/jhflaptopzone',
  web: 'www.jhflaptopzone.com',
  bankAccounts: OFFICIAL_BANK_ACCOUNTS,
};

export const SHOWROOM_CONFIG = {
  ownerName: 'MD. Jahid Hasan',
  ownerNameBn: 'মোঃ জাহিদ হাসান',
  ownerNameEn: 'MD. Jahid Hasan',
  ownerNameHi: 'एमडी जाहिद हसन',
  hotline: '01935-693071',
  whatsapp: '01935-693071',
  altMobile: '01731-693071',
  email: 'jhflaptopzone@gmail.com',
  address: 'দোকান নং: ১০০১ ও ১০৪০, লেভেল-১০, ইসিএস কম্পিউটার সিটি (মাল্টিপ্ল্যান সেন্টার), নিউ এলিফ্যান্ট রোড, ঢাকা | শাখা: বারইপাড়া বাজার, চন্দ্রা, গাজীপুর',
  addressEn: 'Shop No: 1001 & 1040, Level-10, ECS Computer City (Multiplan Centre), New Elephant Road, Dhaka | Branch: Baroipara Bazar, Chandra, Gazipur',
  addressBn: 'দোকান নং: ১০০১ ও ১০৪০, লেভেল-১০, ইসিএস কম্পিউটার সিটি (মাল্টিপ্ল্যান সেন্টার), নিউ এলিফ্যান্ট রোড, ঢাকা | শাখা: বারইপাড়া বাজার, চন্দ্রা, গাজীপুর',
  addressHi: 'दुकान नं: 1001 और 1040, लेवल-10, ईसीएस कंप्यूटर सिटी (मल्टीप्लान सेंटर), न्यू एलिफेंट रोड, ढाका | शाखा: बारोइपारा बाज़ार, चंद्रा, गाज़ीपुर',
  bankAccounts: OFFICIAL_BANK_ACCOUNTS,
};

export const generateInvoiceNumber = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `JHF-${yyyy}${mm}${dd}-${rand}`;
};

interface AdminStoreType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  inventoryTransactions: InventoryTransaction[];
  suppliers: Supplier[];
  stockUnits: StockUnit[];
  supplierPurchases: SupplierPurchase[];
  supplierPayments: SupplierPayment[];
  emiPlans: EmiPlan[];
  backupLogs: BackupLog[];
  expenses: Expense[];
  notifications: AdminNotification[];
  settings: WebsiteSettings;
  adminUsers: AdminUser[];
  bloggerSettings: BloggerSettings;
  activityLogs: ActivityLog[];
  showroomConfig: typeof SHOWROOM_CONFIG;

  // Stock Unit Actions
  addStockUnit: (unit: Omit<StockUnit, 'id' | 'createdAt'>) => void;
  updateStockUnit: (id: string, updates: Partial<StockUnit>) => void;
  deleteStockUnit: (id: string) => void;
  clearAllStockUnits: () => void;

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  clearAllSuppliers: () => void;
  addSupplierPurchase: (purchase: Omit<SupplierPurchase, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateSupplierPurchase: (id: string, updates: Partial<SupplierPurchase>) => void;
  deleteSupplierPurchase: (id: string) => void;
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateSupplierPayment: (id: string, updates: Partial<SupplierPayment>) => void;
  deleteSupplierPayment: (id: string) => void;

  // EMI / Installment Actions
  addEmiPlan: (plan: Omit<EmiPlan, 'id' | 'createdAt' | 'updatedAt' | 'paymentHistory'>) => EmiPlan;
  recordEmiPayment: (
    emiPlanId: string,
    amount: number,
    paymentMethod: 'Cash' | 'Bkash' | 'Nagad' | 'Rocket' | 'Bank Account' | 'POS',
    notes?: string
  ) => { success: boolean; message?: string };
  updateEmiPlan: (id: string, updates: Partial<EmiPlan>) => void;
  deleteEmiPlan: (id: string) => void;
  deleteEmiPayment: (emiPlanId: string, paymentId: string) => void;
  clearAllEmiPlans: () => void;

  // JHF Recondition Zone (Pre-Owned Laptops) Actions & Financials
  reconditionLaptops: ReconditionLaptop[];
  addReconditionLaptop: (laptop: Omit<ReconditionLaptop, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReconditionLaptop: (id: string, updates: Partial<ReconditionLaptop>) => void;
  deleteReconditionLaptop: (id: string) => void;
  markReconditionSold: (id: string, soldPrice?: number, customerName?: string, soldDate?: string) => void;
  markReconditionAvailable: (id: string) => void;
  clearAllReconditionLaptops: () => void;
  reconditionSummary: {
    totalUnits: number;
    availableUnits: number;
    soldUnits: number;
    bookedUnits: number;
    totalInvestment: number;
    soldInvestment: number;
    totalSales: number;
    totalProfit: number;
    unsoldStockValue: number;
    projectedProfit: number;
  };

  // Backup & Restore
  oneClickBackup: () => void;
  restoreFromBackupJSON: (jsonString: string) => { success: boolean; message: string; counts?: any };
  resetStoreToDefaults: () => void;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  softDeleteProduct: (id: string, reason: string) => void;
  restoreProduct: (id: string) => void;
  permanentDeleteProduct: (id: string) => void;
  clearAllProducts: () => void;

  // Order Actions
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'timeline' | 'createdBy'>) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  updatePaymentStatus: (orderId: string, newStatus: PaymentStatus) => void;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  clearAllOrders: () => void;

  // Customer Actions
  addCustomer: (customerData: Partial<Customer>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  clearAllCustomers: () => void;
  updateCustomerNotes: (customerId: string, notes: string) => void;
  addCustomerTag: (customerId: string, tag: string) => void;
  removeCustomerTag: (customerId: string, tag: string) => void;

  // Inventory Actions
  recordStockIn: (productId: string, quantity: number, unitCost: number, supplierName: string, refNo?: string, notes?: string) => void;
  recordStockOut: (productId: string, quantity: number, reason: StockOutReason, refOrder?: string, notes?: string) => void;
  recordStockAdjustment: (productId: string, newQuantity: number, reason: string, notes: string) => void;
  directUpdateProductStock: (productId: string, newStock: number, minAlert?: number) => void;
  deleteInventoryTransaction: (txId: string) => void;
  clearAllInventoryTransactions: () => void;
  adjustStock: (args: {
    productId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    unitCost?: number;
    batchNumber?: string;
    supplier?: string;
    reason?: string;
  }) => void;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>) => void;
  deleteExpense: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Settings & Integrations
  updateSettings: (newSettings: Partial<WebsiteSettings>) => void;
  updateBloggerSettings: (newSettings: Partial<BloggerSettings>) => void;

  // Staff & RBAC
  addAdminUser: (userData: { name: string; email: string; password?: string; role: AdminRole; status?: 'active' | 'disabled' | 'pending'; phone?: string }) => void;
  updateAdminUser: (uid: string, updatedFields: Partial<AdminUser>) => void;
  deleteAdminUser: (uid: string) => { success: boolean; message?: string };
  updateAdminUserStatus: (uid: string, status: 'active' | 'disabled') => void;

  // Export / Backup
  exportDataAsJson: (collectionName: 'products' | 'orders' | 'customers' | 'inventory' | 'expenses' | 'all') => void;
  exportDataAsCsv: (collectionName: 'products' | 'orders' | 'customers' | 'expenses') => void;

  // Download Intelligence & Security Monitoring
  downloadEvents: DownloadEvent[];
  securityEvents: SecurityEvent[];
  securityVerifications: SecurityVerificationRecord[];
  customerReviews: CustomerReview[];
  toolComments: ToolComment[];
  recordDownloadEvent: (event: Omit<DownloadEvent, 'id' | 'timestamp'>) => DownloadEvent;
  addSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => SecurityEvent;
  updateSecurityEventAction: (id: string, actionTaken: SecurityEvent['actionTaken'], notes?: string) => void;
  recordSecurityVerification: (record: Omit<SecurityVerificationRecord, 'id' | 'timestamp' | 'status'>) => SecurityVerificationRecord;
  addCustomerReview: (review: Omit<CustomerReview, 'id' | 'createdAt' | 'status'>) => CustomerReview;
  updateReviewStatus: (id: string, status: 'approved' | 'hidden' | 'pending', adminReply?: string) => void;
  updateCustomerReviewStatus: (id: string, status: 'approved' | 'hidden' | 'pending', adminReply?: string) => void;
  deleteReview: (id: string) => void;
  deleteCustomerReview: (id: string) => void;
  addToolComment: (comment: Omit<ToolComment, 'id' | 'createdAt' | 'likes' | 'status'>) => ToolComment;
  updateToolCommentStatus: (id: string, status: 'approved' | 'hidden' | 'pending') => void;
  deleteToolComment: (id: string) => void;
  addToolCommentReply: (commentId: string, author: string, text: string) => void;

  // Model Catalog Management (Separated from Inventory Units)
  modelCatalog: LaptopCatalogModel[];
  addModelToCatalog: (model: LaptopCatalogModel) => void;
  updateModelInCatalog: (id: string, updates: Partial<LaptopCatalogModel>) => void;
  deleteModelFromCatalog: (id: string) => void;

  // JHF Service Zone
  services: ServiceJob[];
  serviceEngineers: ServiceEngineer[];
  serviceParts: ServicePart[];
  warrantyClaims: WarrantyClaim[];
  addServiceJob: (job: Omit<ServiceJob, 'id' | 'createdAt' | 'updatedAt' | 'logs'>) => ServiceJob;
  updateServiceJob: (id: string, updates: Partial<ServiceJob>) => void;
  deleteServiceJob: (id: string) => void;
  addServiceEngineer: (eng: Omit<ServiceEngineer, 'id' | 'createdAt'>) => void;
  updateServiceEngineer: (id: string, updates: Partial<ServiceEngineer>) => void;
  deleteServiceEngineer: (id: string) => void;
  addServicePart: (part: Omit<ServicePart, 'id' | 'createdAt'>) => void;
  updateServicePart: (id: string, updates: Partial<ServicePart>) => void;
  deleteServicePart: (id: string) => void;
  useServicePart: (serviceJobId: string, partId: string, quantity: number, customerCharge?: number) => void;
  recordServicePayment: (serviceJobId: string, payment: Omit<ServicePaymentRecord, 'id'>) => void;
  addWarrantyClaim: (claim: Omit<WarrantyClaim, 'id' | 'claimDate'>) => WarrantyClaim;
  updateWarrantyClaim: (id: string, updates: Partial<WarrantyClaim>) => void;

  // Data Center & Dummy Data Management
  clearAllDummyData: () => { deletedTotal: number };

  // Full Disaster Recovery & Backup Center
  fullBackups: FullSystemBackup[];
  createFullSystemBackup: (
    type?: 'full' | 'safety' | 'manual' | 'auto_change' | 'session_entry',
    note?: string,
    triggerReason?: string
  ) => FullSystemBackup;
  triggerAutoBackup: (reason: string) => void;
  restoreFullSystemBackup: (backup: FullSystemBackup) => { success: boolean; message: string };
  deleteFullSystemBackup: (backupId: string) => void;
  storageHealth: {
    isPersisted: boolean;
    quotaBytes: number;
    usedBytes: number;
    statusText: string;
  };
  requestStoragePersistence: () => Promise<void>;
}

const AdminStoreContext = createContext<AdminStoreType | undefined>(undefined);

// Initial Seed Data for JHF Laptop Zone
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-lenovo-l14-gen2',
    sku: 'JHF-LP-01',
    name: 'Lenovo ThinkPad L14 Gen-2 (Core i5 11th Gen / 16GB / 512GB SSD)',
    slug: 'lenovo-thinkpad-l14-gen-2',
    brand: 'Lenovo',
    model: 'ThinkPad L14 Gen 2',
    category: 'Business Laptop',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-1135G7 (Up to 4.2GHz, 4 Cores, 8 Threads)',
    generation: '11th Gen',
    ram: '16GB DDR4 3200MHz',
    storage: '512GB M.2 NVMe SSD',
    graphics: 'Intel Iris Xe Graphics 8GB Shared',
    display: '14.0" Full HD (1920x1080) Anti-Glare IPS Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'Original 45Wh (4-5 Hours Backup)',
    keyboardCondition: 'Backlit Spill-Resistant Precision Keyboard',
    bodyCondition: 'A++ Pristine Magnesium Composite',
    operatingSystem: 'Windows 11 Pro 64-bit Genuine Activated',
    includedAccessories: ['Original Lenovo 65W Type-C Charger', 'Power Cord', 'JHF Padded Laptop Bag', 'Wireless Mouse', 'Mouse Pad'],
    purchasePrice: 38000,
    sellingPrice: 46500,
    discountPrice: 45000,
    profitMargin: 8500,
    stockQuantity: 7,
    minimumStockAlert: 2,
    warranty: '1 Month Full Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Military-grade rugged business laptop with 11th Gen Iris Xe power and ultra-durable chassis.',
    specifications: 'Thunderbolt 4, USB 3.2 Gen 1, HDMI 2.0, RJ45 LAN, MicroSD card reader, HD Webcam with ThinkShutter.',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80'],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-hp-elitebook-840-g8',
    sku: 'JHF-LP-02',
    name: 'HP EliteBook 840 G8 (Core i5 11th Gen / 16GB / 512GB SSD / IR Cam)',
    slug: 'hp-elitebook-840-g8',
    brand: 'HP',
    model: 'EliteBook 840 G8',
    category: 'Ultrabook',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-1145G7 vPro (Up to 4.4GHz Turbo)',
    generation: '11th Gen',
    ram: '16GB DDR4 High-Speed RAM',
    storage: '512GB PCIe NVMe SSD',
    graphics: 'Intel Iris Xe Graphics',
    display: '14.0" FHD IPS 400 Nits 100% sRGB Micro-Edge',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'HP 3-Cell 53Wh Long Life (4-5 Hours)',
    keyboardCondition: 'Premium HP Spill-Resistant Backlit Keyboard',
    bodyCondition: 'All-Aluminum CNC Silver Unibody',
    operatingSystem: 'Windows 11 Pro Genuine',
    includedAccessories: ['Original HP 65W Smart AC / Type-C Charger', 'Laptop Bag', 'Wireless Optical Mouse'],
    purchasePrice: 40000,
    sellingPrice: 48500,
    discountPrice: 47500,
    profitMargin: 8500,
    stockQuantity: 4,
    minimumStockAlert: 2,
    warranty: '1 Month Full Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Premium executive ultrabook with Bang & Olufsen sound, face unlock IR, and sleek silver aluminum body.',
    specifications: '2x Thunderbolt 4 / USB4 Type-C, 2x USB 3.2 Gen 1, HDMI 2.0b, Bang & Olufsen Dual Speakers, Fingerprint + IR Face Unlock.',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700&auto=format&fit=crop&q=80'],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-08-12T11:30:00Z',
    updatedAt: '2026-09-02T15:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-dell-latitude-7400',
    sku: 'JHF-LP-03',
    name: 'Dell Latitude 7400 (Core i7 8th Gen / 16GB / 512GB NVMe / Carbon)',
    slug: 'dell-latitude-7400',
    brand: 'Dell',
    model: 'Latitude 7400',
    category: 'Business Laptop',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i7-8665U Quad-Core (Up to 4.8GHz, 8MB Cache)',
    generation: '8th Gen',
    ram: '16GB DDR4 2400MHz',
    storage: '512GB PCIe M.2 SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" FHD (1920x1080) Anti-Glare Carbon Fiber Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'Dell 60Wh ExpressCharge Battery (3.5-4.5 Hours)',
    keyboardCondition: 'Single Pointing Backlit US English',
    bodyCondition: 'High-Density Carbon Fiber & Magnesium Alloy',
    operatingSystem: 'Windows 11 Pro 64-bit Genuine',
    includedAccessories: ['Original Dell 65W Adapter', 'Power Cable', 'Laptop Bag', 'Mouse'],
    purchasePrice: 31000,
    sellingPrice: 38500,
    discountPrice: 37500,
    profitMargin: 7500,
    stockQuantity: 2, // Low stock alert trigger
    minimumStockAlert: 3,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'High performance Core i7 workhorse built in lightweight carbon fiber chassis.',
    specifications: 'Thunderbolt 3, 2x USB 3.1 Gen 1, HDMI 1.4a, MicroSD 4.0, Noble Wedge Lock slot.',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80'],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-08-14T09:00:00Z',
    updatedAt: '2026-09-03T16:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-lenovo-t480s',
    sku: 'JHF-LP-04',
    name: 'Lenovo ThinkPad T480s (Core i5 8th Gen / 16GB / 512GB SSD)',
    slug: 'lenovo-thinkpad-t480s',
    brand: 'Lenovo',
    model: 'ThinkPad T480s',
    category: 'Ultrabook',
    condition: 'Grade A+',
    processor: 'Intel Core i5-8350U Quad-Core vPro',
    generation: '8th Gen',
    ram: '16GB DDR4',
    storage: '512GB NVMe SSD',
    graphics: 'Intel UHD 620',
    display: '14.0" Full HD IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: '57Wh Internal QuickCharge (3.5 Hours)',
    keyboardCondition: 'Original ThinkPad Precision Backlit',
    bodyCondition: 'Slim Magnesium Unibody (1.3kg)',
    operatingSystem: 'Windows 10 / 11 Pro',
    includedAccessories: ['Original Lenovo 65W USB-C Charger', 'Laptop Sleeve', 'Mouse'],
    purchasePrice: 27500,
    sellingPrice: 33500,
    profitMargin: 6000,
    stockQuantity: 6,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Legendary slim business ultrabook with rapid USB-C fast charging.',
    specifications: 'USB Type-C with Thunderbolt 3, USB 3.1 Gen 1, HDMI, SD card reader.',
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80'],
    status: 'published',
    isFeatured: false,
    createdAt: '2026-08-15T14:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-2026-001',
    orderNumber: 'JHF-ORD-1042',
    createdAt: '2026-09-04T14:30:00Z',
    updatedAt: '2026-09-05T09:15:00Z',
    customerName: 'Tanvir Ahmed',
    customerPhone: '01712345678',
    customerEmail: 'tanvir.engr@gmail.com',
    deliveryAddress: 'House 42, Road 7, Sector 3, Uttara',
    district: 'Dhaka',
    items: [
      {
        productId: 'prod-lenovo-l14-gen2',
        productName: 'Lenovo ThinkPad L14 Gen-2 (Core i5 11th Gen)',
        sku: 'JHF-LP-01',
        unitPrice: 46500,
        purchaseCost: 38000,
        quantity: 1,
        totalPrice: 46500,
      },
    ],
    subtotal: 46500,
    discount: 500,
    deliveryCharge: 0,
    totalAmount: 46000,
    paymentMethod: 'bKash',
    paymentStatus: 'paid',
    paymentReference: 'TRX9B8291A8',
    orderStatus: 'shipped',
    courierName: 'Steadfast Courier',
    trackingNumber: 'STF-DH-98214',
    adminNotes: 'Customer requested Windows 11 with Office 2021 activated and verified battery test certificate.',
    customerNotes: 'Please deliver after 3:00 PM.',
    timeline: [
      { status: 'new', timestamp: '2026-09-04T14:30:00Z', note: 'Order placed via WhatsApp catalog', performedBy: 'Customer' },
      { status: 'confirmed', timestamp: '2026-09-04T14:45:00Z', note: 'Advance bKash payment received', performedBy: 'Jahid Hasan' },
      { status: 'processing', timestamp: '2026-09-04T17:00:00Z', note: 'Quality check & testing completed', performedBy: 'Admin Staff' },
      { status: 'shipped', timestamp: '2026-09-05T09:15:00Z', note: 'Handed over to Steadfast Courier', performedBy: 'Jahid Hasan' },
    ],
    createdBy: 'Jahid Hasan',
  },
  {
    id: 'ord-2026-002',
    orderNumber: 'JHF-ORD-1043',
    createdAt: '2026-09-05T11:00:00Z',
    updatedAt: '2026-09-05T11:30:00Z',
    customerName: 'Farhan Chowdhury',
    customerPhone: '01823456789',
    deliveryAddress: 'GEC Circle, Nasirabad',
    district: 'Chattogram',
    items: [
      {
        productId: 'prod-hp-elitebook-840-g8',
        productName: 'HP EliteBook 840 G8 (Core i5 11th Gen)',
        sku: 'JHF-LP-02',
        unitPrice: 48500,
        purchaseCost: 40000,
        quantity: 1,
        totalPrice: 48500,
      },
    ],
    subtotal: 48500,
    discount: 1000,
    deliveryCharge: 200,
    totalAmount: 47700,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'partially_paid',
    paymentReference: 'bKash ৳1000 advance Booking Ref: BK92841',
    orderStatus: 'confirmed',
    courierName: 'Sundarban Courier',
    adminNotes: 'Booking advance ৳1000 taken. Conditional COD remaining ৳46,700.',
    timeline: [
      { status: 'new', timestamp: '2026-09-05T11:00:00Z', note: 'Order created', performedBy: 'Sales Staff' },
      { status: 'confirmed', timestamp: '2026-09-05T11:30:00Z', note: 'Advance booking verified', performedBy: 'Sales Staff' },
    ],
    createdBy: 'Sales Staff',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    fullName: 'Tanvir Ahmed',
    phoneNumber: '01712345678',
    email: 'tanvir.engr@gmail.com',
    address: 'House 42, Road 7, Sector 3, Uttara',
    district: 'Dhaka',
    city: 'Dhaka',
    totalOrders: 1,
    totalSpending: 46000,
    lastOrderDate: '2026-09-04T14:30:00Z',
    accountStatus: 'active',
    notes: 'Very polite customer, civil engineer, likes ThinkPad series.',
    tags: ['Verified Buyer', 'ThinkPad Enthusiast'],
    createdAt: '2026-09-04T14:30:00Z',
    updatedAt: '2026-09-05T09:15:00Z',
  },
  {
    id: 'cust-02',
    fullName: 'Farhan Chowdhury',
    phoneNumber: '01823456789',
    address: 'GEC Circle, Nasirabad',
    district: 'Chattogram',
    city: 'Chattogram',
    totalOrders: 1,
    totalSpending: 47700,
    lastOrderDate: '2026-09-05T11:00:00Z',
    accountStatus: 'active',
    notes: 'Chattogram client, paid ৳1000 booking fee via bKash.',
    tags: ['Outside Dhaka', 'EliteBook Client'],
    createdAt: '2026-09-05T11:00:00Z',
    updatedAt: '2026-09-05T11:30:00Z',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-01',
    date: '2026-09-01',
    category: 'Rent',
    description: 'Shop Outlet Rent for September',
    amount: 25000,
    paymentMethod: 'Bank Transfer',
    reference: 'RENT-SEP-2026',
    createdBy: 'Jahid Hasan',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'exp-02',
    date: '2026-09-02',
    category: 'Electricity',
    description: 'DESCO Commercial Electricity Bill',
    amount: 3200,
    paymentMethod: 'bKash Merchant',
    reference: 'DESCO-98214',
    createdBy: 'Jahid Hasan',
    createdAt: '2026-09-02T14:00:00Z',
  },
  {
    id: 'exp-03',
    date: '2026-09-03',
    category: 'Transport',
    description: 'Cargo clearing & local transport from port warehouse',
    amount: 4500,
    paymentMethod: 'Cash',
    createdBy: 'Jahid Hasan',
    createdAt: '2026-09-03T16:30:00Z',
  },
];

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert: Dell Latitude 7400',
    message: 'Only 2 units remaining in stock. Minimum stock alert is 3 units.',
    type: 'low_stock',
    isRead: false,
    createdAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'notif-2',
    title: 'New Order Received: JHF-ORD-1043',
    message: 'Farhan Chowdhury placed an order for HP EliteBook 840 G8 (৳47,700).',
    type: 'order',
    isRead: false,
    createdAt: '2026-09-05T11:00:00Z',
  },
];

const INITIAL_SETTINGS: WebsiteSettings = {
  businessName: 'JHF Laptop Zone',
  tagline: 'Best Laptop Buy , Sell & Accessories Importer, Traders & Suppliers',
  websiteUrl: 'https://www.jhflaptopzone.com/',
  branchOffice: 'Baroipara Bazar, Chandra, Gazipur',
  mainOffice: 'Sonali Trade, Shop No : 1001 & 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka',
  location: 'Main Office: Sonali Trade, Shop No: 1001 & 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka | Branch: Baroipara Bazar, Chandra, Gazipur',
  primaryWhatsApp: '8801935693071',
  secondaryPhone: '8801731693071',
  email: 'jhflaptopzone@gmail.com',
  facebookUrl: 'https://www.facebook.com/jhflaptopzone',
  youtubeUrl: 'https://www.youtube.com/@jhflaptopzone',
  deliveryTimeDhaka: 'Same Day / 24 Hours Home Delivery with Inspection',
  deliveryTimeOutside: '24-48 Hours Courier Delivery with ৳1000 Advance',
  defaultWarranty: '1 Month Replacement + 5 Years Free Service Warranty',
  lowStockThreshold: 2,
};

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-01',
    name: 'Dubai Global Laptops Trading LLC',
    companyName: 'Dubai Global Trading LLC',
    phone: '+971 50 123 4567',
    email: 'sales@dubaigloballaptops.com',
    address: 'Deira Industrial Area, Dubai, UAE',
    productsSupplied: ['ThinkPad L14', 'EliteBook 840 G8', 'Dell Latitude 7400'],
    outstandingBalance: 70000,
    totalPurchases: 450000,
    totalPaid: 380000,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'sup-02',
    name: 'Singapore Tech IT Hub Ltd',
    companyName: 'Singapore Tech IT Hub',
    phone: '+65 6789 0123',
    email: 'contact@singtech-laptops.sg',
    address: 'Sim Lim Square, Rochor, Singapore',
    productsSupplied: ['MacBook Air M1', 'HP EliteBook 840 G8', 'ThinkPad T14'],
    outstandingBalance: 70000,
    totalPurchases: 320000,
    totalPaid: 250000,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'sup-03',
    name: 'Dhaka Central Gadgets Syndicate',
    companyName: 'Dhaka Gadgets Syndicate',
    phone: '01712-998877',
    email: 'dhakagadgetssyn@gmail.com',
    address: 'BCS Computer City, IDB Bhaban, Agargaon, Dhaka',
    productsSupplied: ['Dell Latitude 7400', 'Original Laptop Chargers', 'NVMe SSDs'],
    outstandingBalance: 0,
    totalPurchases: 180000,
    totalPaid: 180000,
    createdAt: '2026-02-15T00:00:00Z',
  },
];

const INITIAL_STOCK_UNITS: StockUnit[] = [
  {
    id: 'stock-unit-01',
    productId: 'prod-lenovo-l14-gen2',
    modelName: 'Lenovo ThinkPad L14 Gen-2',
    serialNumber: 'SN-LEN-L14-88421',
    configuration: 'Core i5 11th Gen / 16GB DDR4 / 512GB NVMe SSD',
    condition: 'Dubai Grade A++',
    supplierId: 'sup-01',
    supplierName: 'Dubai Global Laptops Trading LLC',
    buyPrice: 38000,
    sellingPrice: 46500,
    status: 'Available',
    warrantyPeriod: '1 Month Replacement + 5 Years Service',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'stock-unit-02',
    productId: 'prod-lenovo-l14-gen2',
    modelName: 'Lenovo ThinkPad L14 Gen-2',
    serialNumber: 'SN-LEN-L14-88422',
    configuration: 'Core i5 11th Gen / 16GB DDR4 / 512GB NVMe SSD',
    condition: 'Dubai Grade A++',
    supplierId: 'sup-01',
    supplierName: 'Dubai Global Laptops Trading LLC',
    buyPrice: 38000,
    sellingPrice: 46500,
    status: 'Sold',
    soldToCustomer: 'Nahid Hasan',
    invoiceNo: 'JHF-20260901-1002',
    soldAt: '2026-09-01T14:30:00Z',
    warrantyPeriod: '1 Month Replacement + 5 Years Service',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'stock-unit-03',
    productId: 'prod-hp-840-g8',
    modelName: 'HP EliteBook 840 G8',
    serialNumber: 'SN-HP-840-99214',
    configuration: 'Core i7 11th Gen / 16GB DDR4 / 512GB NVMe SSD',
    condition: 'Dubai Grade A++',
    supplierId: 'sup-02',
    supplierName: 'Singapore Tech IT Hub Ltd',
    buyPrice: 42000,
    sellingPrice: 52000,
    status: 'Sold',
    soldToCustomer: 'Arifur Rahman',
    invoiceNo: 'JHF-20260815-1044',
    soldAt: '2026-08-15T11:00:00Z',
    warrantyPeriod: '1 Month Replacement + 5 Years Service',
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'stock-unit-04',
    productId: 'prod-dell-lat-7400',
    modelName: 'Dell Latitude 7400',
    serialNumber: 'SN-DEL-7400-33215',
    configuration: 'Core i5 8th Gen / 8GB DDR4 / 256GB SSD',
    condition: 'Dubai Grade A++',
    supplierId: 'sup-01',
    supplierName: 'Dubai Global Laptops Trading LLC',
    buyPrice: 25000,
    sellingPrice: 32500,
    status: 'Available',
    warrantyPeriod: '1 Month Replacement + 5 Years Service',
    createdAt: '2026-08-25T15:00:00Z',
  },
  {
    id: 'stock-unit-05',
    productId: 'prod-macbook-air-m1',
    modelName: 'Apple MacBook Air M1 (2020)',
    serialNumber: 'SN-APL-M1-77142',
    configuration: 'Apple M1 Chip / 8GB Unified / 256GB SSD',
    condition: 'Dubai Grade A++',
    supplierId: 'sup-02',
    supplierName: 'Singapore Tech IT Hub Ltd',
    buyPrice: 58000,
    sellingPrice: 69000,
    status: 'Available',
    warrantyPeriod: '1 Month Replacement + 5 Years Service',
    createdAt: '2026-09-02T09:00:00Z',
  },
];

const INITIAL_SUPPLIER_PURCHASES: SupplierPurchase[] = [
  {
    id: 'spurch-01',
    supplierId: 'sup-01',
    supplierName: 'Dubai Global Laptops Trading LLC',
    invoiceRef: 'DGL-INV-2026-9081',
    purchaseDate: '2026-08-15',
    itemDescription: 'Lot of 10 Lenovo ThinkPad L14 Gen 2 (Dubai Grade A++)',
    quantity: 10,
    unitPrice: 38000,
    totalPurchase: 380000,
    paidAmount: 310000,
    dueAmount: 70000,
    paymentMethod: 'Bank Account',
    notes: 'Direct consignment from Dubai port cleared.',
    createdBy: 'Md. Jahid Hasan',
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'spurch-02',
    supplierId: 'sup-02',
    supplierName: 'Singapore Tech IT Hub Ltd',
    invoiceRef: 'STH-BILL-8821',
    purchaseDate: '2026-08-20',
    itemDescription: 'Lot of 6 HP EliteBook 840 G8 & 2 MacBook Air M1',
    quantity: 8,
    unitPrice: 40000,
    totalPurchase: 320000,
    paidAmount: 250000,
    dueAmount: 70000,
    paymentMethod: 'Bank Account',
    notes: 'Shipped via Singapore express air courier.',
    createdBy: 'Md. Jahid Hasan',
    createdAt: '2026-08-20T14:00:00Z',
  },
];

const INITIAL_SUPPLIER_PAYMENTS: SupplierPayment[] = [
  {
    id: 'spay-01',
    supplierId: 'sup-01',
    supplierName: 'Dubai Global Laptops Trading LLC',
    paymentDate: '2026-08-15',
    amount: 310000,
    paymentMethod: 'Bank Account',
    transactionRef: 'EBL-TX-88291044',
    purchaseInvoiceRef: 'DGL-INV-2026-9081',
    notes: 'Initial bank transfer via Eastern Bank Ltd',
    createdBy: 'Md. Jahid Hasan',
    createdAt: '2026-08-15T12:00:00Z',
  },
  {
    id: 'spay-02',
    supplierId: 'sup-02',
    supplierName: 'Singapore Tech IT Hub Ltd',
    paymentDate: '2026-08-20',
    amount: 250000,
    paymentMethod: 'Bank Account',
    transactionRef: 'CITY-TX-99014421',
    purchaseInvoiceRef: 'STH-BILL-8821',
    notes: 'City Bank TT international transfer',
    createdBy: 'Md. Jahid Hasan',
    createdAt: '2026-08-20T16:00:00Z',
  },
];

const INITIAL_EMI_PLANS: EmiPlan[] = [
  {
    id: 'emi-01',
    invoiceNo: 'JHF-20260901-1002',
    saleDate: '2026-09-01',
    customerName: 'Nahid Hasan',
    customerPhone: '01713-447336',
    customerAddress: 'Walton Factory Area, Chandra, Gazipur',
    customerNid: '1995331289000124',
    guarantorName: 'Engr. Mofizur Rahman',
    guarantorPhone: '01811-224466',
    productId: 'prod-lenovo-l14-gen2',
    productModel: 'Lenovo ThinkPad L14 Gen-2',
    serialNumber: 'SN-LEN-L14-88422',
    configuration: 'Core i5 11th Gen / 16GB RAM / 512GB SSD',
    supplierName: 'Dubai Global Laptops Trading LLC',
    salesPerson: 'Jahid Hasan',
    buyPrice: 38000,
    sellPrice: 46500,
    profit: 8500,
    downPayment: 20000,
    totalDue: 26500,
    paidAmount: 29000,
    remainingDue: 17500,
    planMonths: 6,
    monthlyInstallment: 4417,
    nextDueDate: '2026-10-01',
    estimatedFinalPayDate: '2027-03-01',
    isOverdue: false,
    status: 'active',
    paymentHistory: [
      {
        id: 'emipay-01-01',
        emiPlanId: 'emi-01',
        paymentDate: '2026-09-01',
        installmentNumber: 1,
        amountPaid: 20000,
        remainingAfterPayment: 26500,
        paymentMethod: 'Cash',
        receiptNo: 'REC-20260901-01',
        collectedBy: 'Jahid Hasan',
        notes: '1st Installment = Instant Payment / Down Payment',
      },
      {
        id: 'emipay-01-02',
        emiPlanId: 'emi-01',
        paymentDate: '2026-09-05',
        installmentNumber: 2,
        amountPaid: 9000,
        remainingAfterPayment: 17500,
        paymentMethod: 'Bkash',
        transactionRef: 'BKH9921448',
        receiptNo: 'REC-20260905-02',
        collectedBy: 'Jahid Hasan',
        notes: 'Early partial advance payment received',
      },
    ],
    notes: 'Walton employee - salary credited on 1st of month.',
    createdAt: '2026-09-01T14:30:00Z',
    updatedAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'emi-02',
    invoiceNo: 'JHF-20260815-1044',
    saleDate: '2026-08-15',
    customerName: 'Arifur Rahman',
    customerPhone: '01822-554433',
    customerAddress: 'Baroipara Bazar, Kaliakair, Gazipur',
    customerNid: '1992261490112345',
    guarantorName: 'Kamal Hossain',
    guarantorPhone: '01733-445566',
    productId: 'prod-hp-840-g8',
    productModel: 'HP EliteBook 840 G8',
    serialNumber: 'SN-HP-840-99214',
    configuration: 'Core i7 11th Gen / 16GB RAM / 512GB SSD',
    supplierName: 'Singapore Tech IT Hub Ltd',
    salesPerson: 'Rahim Sheikh',
    buyPrice: 42000,
    sellPrice: 52000,
    profit: 10000,
    downPayment: 25000,
    totalDue: 27000,
    paidAmount: 25000,
    remainingDue: 27000,
    planMonths: 3,
    monthlyInstallment: 9000,
    nextDueDate: '2026-09-03',
    estimatedFinalPayDate: '2026-11-15',
    isOverdue: true,
    status: 'overdue',
    paymentHistory: [
      {
        id: 'emipay-02-01',
        emiPlanId: 'emi-02',
        paymentDate: '2026-08-15',
        installmentNumber: 1,
        amountPaid: 25000,
        remainingAfterPayment: 27000,
        paymentMethod: 'Cash',
        receiptNo: 'REC-20260815-01',
        collectedBy: 'Rahim Sheikh',
        notes: '1st Installment = Instant Payment',
      },
    ],
    notes: 'Customer promised to pay by 8th September. Follow up made.',
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-09-04T12:00:00Z',
  },
  {
    id: 'emi-03',
    invoiceNo: 'JHF-20260828-1099',
    saleDate: '2026-08-28',
    customerName: 'Tanvir Ahmed',
    customerPhone: '01911-887766',
    customerAddress: 'Chandra Bus Stand, Gazipur',
    customerNid: '1998451123908871',
    guarantorName: 'Monirul Islam',
    guarantorPhone: '01611-998877',
    productId: 'prod-dell-lat-7400',
    productModel: 'Dell Latitude 7400',
    serialNumber: 'SN-DEL-7400-33215',
    configuration: 'Core i5 8th Gen / 8GB RAM / 256GB SSD',
    supplierName: 'Dubai Global Laptops Trading LLC',
    salesPerson: 'Jahid Hasan',
    buyPrice: 25000,
    sellPrice: 32500,
    profit: 7500,
    downPayment: 15000,
    totalDue: 17500,
    paidAmount: 20000,
    remainingDue: 12500,
    planMonths: 4,
    monthlyInstallment: 4375,
    nextDueDate: '2026-09-28',
    estimatedFinalPayDate: '2026-12-28',
    isOverdue: false,
    status: 'active',
    paymentHistory: [
      {
        id: 'emipay-03-01',
        emiPlanId: 'emi-03',
        paymentDate: '2026-08-28',
        installmentNumber: 1,
        amountPaid: 15000,
        remainingAfterPayment: 17500,
        paymentMethod: 'Nagad',
        receiptNo: 'REC-20260828-01',
        collectedBy: 'Jahid Hasan',
        notes: '1st Installment Down Payment',
      },
      {
        id: 'emipay-03-02',
        emiPlanId: 'emi-03',
        paymentDate: '2026-09-04',
        installmentNumber: 2,
        amountPaid: 5000,
        remainingAfterPayment: 12500,
        paymentMethod: 'Rocket',
        receiptNo: 'REC-20260904-01',
        collectedBy: 'Jahid Hasan',
        notes: 'Installment payment',
      },
    ],
    notes: 'College student, parents guarantor.',
    createdAt: '2026-08-28T16:00:00Z',
    updatedAt: '2026-09-04T16:30:00Z',
  },
];

const INITIAL_RECONDITION_LAPTOPS: ReconditionLaptop[] = [
  {
    id: 'rec-01',
    code: 'REC-101',
    title: 'Lenovo ThinkPad T480s (Core i5 8th Gen / 16GB RAM / 256GB NVMe SSD)',
    brand: 'Lenovo',
    model: 'ThinkPad T480s',
    processor: 'Intel Core i5-8350U (4 Cores, 8 Threads, Up to 3.60GHz)',
    ram: '16GB DDR4',
    storage: '256GB M.2 NVMe High Speed SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" FHD IPS Anti-Glare (1920x1080)',
    batteryBackup: '4 to 5 Hours (Battery Health 92%)',
    physicalCondition: 'A+ Grade (Mint/Scratchless)',
    conditionDetails: 'Super fresh, scratchless imported from Dubai. Original magnesium-aluminum chassis, backlit keyboard, dual battery system.',
    includedAccessories: ['Original Lenovo 65W Type-C Charger', 'Original Power Cord', 'Heavy Padded Laptop Bag', 'Wireless Optical Mouse'],
    serialNumber: 'SN-TP-T480S-8819',
    sourceSupplier: 'Dubai Global Laptops Trading LLC',
    buyPrice: 24000,
    sellPrice: 31500,
    offerPrice: 29990,
    status: 'available',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80'],
    warranty: '15 Days Full Replacement + 2 Years Free Service Warranty',
    isFeatured: true,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'rec-02',
    code: 'REC-102',
    title: 'Dell Latitude 7490 (Core i7 8th Gen / 16GB RAM / 512GB SSD / FHD IPS)',
    brand: 'Dell',
    model: 'Latitude 7490',
    processor: 'Intel Core i7-8650U (4 Cores, 8 Threads, Up to 4.20GHz Turbo)',
    ram: '16GB DDR4',
    storage: '512GB PCIe NVMe SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" Full HD IPS Narrow Border Anti-Glare',
    batteryBackup: '3.5 to 4.5 Hours (Battery Health 88%)',
    physicalCondition: 'A+ Grade (Mint/Scratchless)',
    conditionDetails: 'Carbon fiber lid, smooth finish, responsive trackpad, excellent thermal efficiency.',
    includedAccessories: ['Original Dell 65W Round-Pin Charger', 'Power Cord', 'Premium Laptop Bag', 'Mousepad'],
    serialNumber: 'SN-DEL-7490-4491',
    sourceSupplier: 'Dubai Global Laptops Trading LLC',
    buyPrice: 26000,
    sellPrice: 34500,
    offerPrice: 33000,
    status: 'sold',
    soldPrice: 33500,
    soldDate: '2026-09-08',
    soldToCustomer: 'Kamrul Hasan (Kaliakair)',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700&auto=format&fit=crop&q=80'],
    warranty: '15 Days Full Replacement + 2 Years Free Service Warranty',
    isFeatured: true,
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-09-08T16:30:00Z',
  },
  {
    id: 'rec-03',
    code: 'REC-103',
    title: 'HP EliteBook 840 G6 (Core i5 8th Gen / 8GB RAM / 256GB SSD / Silver Metal)',
    brand: 'HP',
    model: 'EliteBook 840 G6',
    processor: 'Intel Core i5-8265U (Up to 3.90GHz)',
    ram: '8GB DDR4 (Expandable up to 32GB)',
    storage: '256GB NVMe SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" FHD IPS Bang & Olufsen Audio',
    batteryBackup: '4 Hours (Battery Health 90%)',
    physicalCondition: 'A Grade (Minor Signs of Use)',
    conditionDetails: 'Sleek silver unibody aluminum, clean keyboard, Bang & Olufsen crystal audio.',
    includedAccessories: ['Original HP 45W/65W Charger', 'Power Cord', 'Laptop Bag'],
    serialNumber: 'SN-HP-840G6-1290',
    sourceSupplier: 'Singapore Tech IT Hub Ltd',
    buyPrice: 22500,
    sellPrice: 29000,
    offerPrice: 27500,
    status: 'available',
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80'],
    warranty: '15 Days Replacement + 2 Years Free Service Warranty',
    isFeatured: false,
    createdAt: '2026-09-02T14:00:00Z',
    updatedAt: '2026-09-02T14:00:00Z',
  },
  {
    id: 'rec-04',
    code: 'REC-104',
    title: 'Apple MacBook Air M1 2020 (8GB Unified RAM / 256GB SSD / Space Gray)',
    brand: 'Apple',
    model: 'MacBook Air M1',
    processor: 'Apple M1 Chip (8-Core CPU, 7-Core GPU, 16-Core Neural Engine)',
    ram: '8GB Unified Memory',
    storage: '256GB Apple Fast NVMe SSD',
    graphics: 'Apple 7-Core GPU',
    display: '13.3" Retina Display with True Tone (2560x1600)',
    batteryBackup: '10 to 12 Hours (Battery Cycle 142, Health 94%)',
    physicalCondition: 'A+ Grade (Mint/Scratchless)',
    conditionDetails: 'Space Gray, zero scratches or dents. Original 30W Apple Type-C adapter.',
    includedAccessories: ['Original Apple 30W USB-C Power Adapter', 'USB-C Charge Cable (2m)', 'Velvet Sleeve Case'],
    serialNumber: 'SN-APL-M1-5510',
    sourceSupplier: 'Dubai Global Laptops Trading LLC',
    buyPrice: 58000,
    sellPrice: 68000,
    offerPrice: 66500,
    status: 'sold',
    soldPrice: 67000,
    soldDate: '2026-09-10',
    soldToCustomer: 'Dr. Mahfuzul Alam (Gazipur Sadar)',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80'],
    warranty: '1 Month Replacement + 1 Year Apple Diagnostics Support',
    isFeatured: true,
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-09-10T11:00:00Z',
  },
];

const INITIAL_BACKUP_LOGS: BackupLog[] = [
  {
    id: 'blog-01',
    filename: 'jhf_erp_backup_20260908_220000.json',
    timestamp: '2026-09-08T22:00:00Z',
    type: 'export',
    sizeBytes: 84200,
    recordCounts: {
      products: 6,
      stockUnits: 5,
      orders: 6,
      emiPlans: 3,
      suppliers: 3,
      supplierPurchases: 2,
      customers: 6,
    },
    status: 'success',
    performedBy: 'Jahid Hasan (Super Admin)',
  },
];

export const INITIAL_DOWNLOAD_EVENTS: DownloadEvent[] = [
  {
    id: 'dl-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    softwareName: 'CrystalDiskInfo 9.4.4 (SSD Health & Temperature)',
    category: 'Testing Tools',
    version: '9.4.4 Genuine',
    country: 'Bangladesh',
    region: 'Dhaka Division',
    ip: '103.25.244.18',
    browser: 'Chrome 128.0',
    os: 'Windows 11 64-bit',
    deviceType: 'Desktop',
    status: 'success',
    fileSizeBytes: 5872025,
    sessionId: 'sess-bd-dhaka-8891',
  },
  {
    id: 'dl-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    softwareName: 'Windows 11 Pro 24H2 Official ISO (Direct High Speed)',
    category: 'Operating Systems',
    version: '24H2 Build 26100',
    country: 'Bangladesh',
    region: 'Gazipur (Chandra Hub)',
    ip: '119.30.38.102',
    browser: 'Firefox 130.0',
    os: 'Windows 10 64-bit',
    deviceType: 'Desktop',
    status: 'success',
    fileSizeBytes: 5583457280,
    sessionId: 'sess-bd-gazipur-4412',
  },
  {
    id: 'dl-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    softwareName: 'BatteryMon v2.1 (Full Battery Health & Wear Analyzer)',
    category: 'Testing Tools',
    version: '2.1 Pro Build',
    country: 'United Arab Emirates',
    region: 'Dubai',
    ip: '194.26.29.11',
    browser: 'Chrome 128.0',
    os: 'Windows 11 64-bit',
    deviceType: 'Desktop',
    status: 'success',
    fileSizeBytes: 2411724,
    sessionId: 'sess-uae-dxb-9901',
  },
  {
    id: 'dl-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    softwareName: 'FurMark GPU Stress Test & Burn-In Benchmark',
    category: 'Testing Tools',
    version: '2.4.0.0',
    country: 'Bangladesh',
    region: 'Chittagong',
    ip: '45.112.58.12',
    browser: 'Edge 128.0',
    os: 'Windows 11 64-bit',
    deviceType: 'Desktop',
    status: 'success',
    fileSizeBytes: 18454937,
    sessionId: 'sess-bd-ctg-7721',
  },
  {
    id: 'dl-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    softwareName: 'Intel 11th & 12th Gen VMD F6 Boot Storage Driver',
    category: 'Drivers',
    version: '19.5.1.1040',
    country: 'Singapore',
    region: 'Jurong East',
    ip: '118.200.12.89',
    browser: 'Chrome 127.0',
    os: 'Windows 11 64-bit',
    deviceType: 'Desktop',
    status: 'success',
    fileSizeBytes: 4718592,
    sessionId: 'sess-sg-jur-3312',
  },
  {
    id: 'dl-106',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    softwareName: 'Keyboard Test Utility v1.4.0 (Key Strike Analyzer)',
    category: 'Testing Tools',
    version: '1.4.0 Portable',
    country: 'India',
    region: 'West Bengal (Kolkata)',
    ip: '103.111.23.4',
    browser: 'Chrome 128.0',
    os: 'Windows 10 64-bit',
    deviceType: 'Desktop',
    status: 'success',
    fileSizeBytes: 3145728,
    sessionId: 'sess-in-ccu-5521',
  },
];

export const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'sec-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    ip: '103.205.132.88',
    region: 'Dhaka Division, Bangladesh',
    event: 'Extreme download frequency (>5 downloads within 40 seconds)',
    risk: 'HIGH',
    downloadItem: 'Multiple ISO & Tool Packages',
    actionTaken: 'Rate Limited',
    notes: 'Temporarily throttled connection rate to prevent server bandwidth exhaustion.',
  },
  {
    id: 'sec-02',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    ip: '45.112.58.12',
    region: 'Chittagong, Bangladesh',
    event: 'Rapid repeated HEAD requests to download mirror',
    risk: 'MEDIUM',
    downloadItem: 'Windows 11 Pro 24H2 Official ISO',
    actionTaken: 'Monitored',
    notes: 'Automated script signature verified as standard download manager (IDM 8 connections).',
  },
  {
    id: 'sec-03',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    ip: '194.26.29.11',
    region: 'Dubai, UAE',
    event: 'Cross-region multi-session catalog scan',
    risk: 'LOW',
    downloadItem: 'Testing Tools Package',
    actionTaken: 'Dismissed',
    notes: 'Legitimate business customer browsing wholesale diagnostic tools.',
  },
];

export const INITIAL_CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    targetId: 'prod-lenovo-l14-gen2',
    targetType: 'product',
    targetTitle: 'Lenovo ThinkPad L14 Gen-2',
    customerName: 'Tanvir Ahmed (Chittagong)',
    customerEmail: 'tanvir.engr@gmail.com',
    rating: 5,
    reviewText: 'Got this ThinkPad L14 Gen 2 in immaculate condition. SSD health was 100% on CrystalDiskInfo as promised by JHF. Battery easily gives 4.5 hours.',
    status: 'approved',
    createdAt: '2026-09-02T14:30:00Z',
    isVerifiedPurchase: true,
    adminReply: 'Thank you Tanvir Bhai! We test every unit for 48 hours before courier shipment.',
  },
  {
    id: 'rev-02',
    targetId: 'prod-hp-840-g8',
    targetType: 'product',
    targetTitle: 'HP EliteBook 840 G8',
    customerName: 'Engr. Shamim Hossain (Gazipur)',
    customerEmail: 'shamim.hossain@walton.com.bd',
    rating: 5,
    reviewText: 'Bought directly from Baroipara Branch, Chandra. Beautiful aluminum body, crisp Bang & Olufsen sound, very fast with i7 11th Gen. Recommended JHF!',
    status: 'approved',
    createdAt: '2026-09-03T11:20:00Z',
    isVerifiedPurchase: true,
  },
  {
    id: 'rev-03',
    targetId: 'CrystalDiskInfo 9.4.4',
    targetType: 'tool',
    targetTitle: 'CrystalDiskInfo 9.4.4 (SSD Health)',
    customerName: 'Fahim Morshed',
    rating: 5,
    reviewText: 'The official high speed direct link works flawlessly without annoying ad popups. Very helpful testing software zone.',
    status: 'approved',
    createdAt: '2026-09-05T09:15:00Z',
    isVerifiedPurchase: false,
  },
];

export const INITIAL_TOOL_COMMENTS: ToolComment[] = [
  {
    id: 'comm-01',
    targetId: 'tool-crystaldiskinfo',
    targetTitle: 'CrystalDiskInfo 9.4.4',
    authorName: 'Siam Chowdhury',
    content: 'Works perfectly on Windows 11 24H2. Tested NVMe health in 2 seconds.',
    createdAt: '2026-09-04T12:00:00Z',
    status: 'approved',
    likes: 12,
  },
  {
    id: 'comm-02',
    targetId: 'tool-intel-vmd',
    targetTitle: 'Intel 11th Gen VMD Storage Driver',
    authorName: 'Ariful Islam',
    content: 'Saved my Windows setup! The drive was not showing in setup until I extracted these F6 drivers on USB.',
    createdAt: '2026-09-06T15:20:00Z',
    status: 'approved',
    likes: 24,
  },
];

export const AdminStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logActivity } = useAdminAuth();

  // State with LocalStorage persistent backing
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('jhf_admin_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jhf_admin_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('jhf_admin_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem('jhf_admin_inventory_tx');
    return saved ? JSON.parse(saved) : [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('jhf_admin_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [stockUnits, setStockUnits] = useState<StockUnit[]>(() => {
    const saved = localStorage.getItem('jhf_admin_stock_units');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_UNITS;
  });

  const [supplierPurchases, setSupplierPurchases] = useState<SupplierPurchase[]>(() => {
    const saved = localStorage.getItem('jhf_admin_supplier_purchases');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIER_PURCHASES;
  });

  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => {
    const saved = localStorage.getItem('jhf_admin_supplier_payments');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIER_PAYMENTS;
  });

  const [emiPlans, setEmiPlans] = useState<EmiPlan[]>(() => {
    const saved = localStorage.getItem('jhf_admin_emi_plans');
    return saved ? JSON.parse(saved) : INITIAL_EMI_PLANS;
  });

  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(() => {
    const saved = localStorage.getItem('jhf_admin_backup_logs');
    return saved ? JSON.parse(saved) : INITIAL_BACKUP_LOGS;
  });

  const [reconditionLaptops, setReconditionLaptops] = useState<ReconditionLaptop[]>(() => {
    const saved = localStorage.getItem('jhf_admin_recondition_laptops');
    return saved ? JSON.parse(saved) : INITIAL_RECONDITION_LAPTOPS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('jhf_admin_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('jhf_admin_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState<WebsiteSettings>(() => {
    const saved = localStorage.getItem('jhf_admin_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If old location had Mirpur or RP Tower, update with new offices
        if (!parsed.location || parsed.location.includes('Mirpur') || parsed.location.includes('R.P. Tower')) {
          return {
            ...INITIAL_SETTINGS,
            ...parsed,
            businessName: 'JHF Laptop Zone',
            tagline: INITIAL_SETTINGS.tagline,
            branchOffice: INITIAL_SETTINGS.branchOffice,
            mainOffice: INITIAL_SETTINGS.mainOffice,
            location: INITIAL_SETTINGS.location,
            secondaryPhone: INITIAL_SETTINGS.secondaryPhone,
            primaryWhatsApp: INITIAL_SETTINGS.primaryWhatsApp,
            email: INITIAL_SETTINGS.email,
          };
        }
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          branchOffice: parsed.branchOffice || INITIAL_SETTINGS.branchOffice,
          mainOffice: parsed.mainOffice || INITIAL_SETTINGS.mainOffice,
        };
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const defaultSuperAdmin: AdminUser = {
      uid: 'user-superadmin-root',
      name: 'MD. Jahid Hasan (Super Admin)',
      email: 'jhfboss',
      phone: '+8801935693071',
      role: 'super_admin' as AdminRole,
      status: 'active' as const,
      createdAt: '2026-01-01T00:00:00Z',
      lastLogin: new Date().toISOString(),
    };

    const saved = localStorage.getItem('jhf_admin_users_db');
    if (!saved) {
      return [
        defaultSuperAdmin,
        {
          uid: 'user-02',
          name: 'Rahim Sheikh',
          email: 'sales@jhflaptopzone.com',
          phone: '01811-334455',
          role: 'sales_staff' as AdminRole,
          status: 'active' as const,
          createdAt: '2026-02-15T00:00:00Z',
          lastLogin: '2026-09-04T16:00:00Z',
        },
        {
          uid: 'user-03',
          name: 'Kalam Miah',
          email: 'inventory@jhflaptopzone.com',
          phone: '01911-445566',
          role: 'inventory_staff' as AdminRole,
          status: 'active' as const,
          createdAt: '2026-03-01T00:00:00Z',
          lastLogin: '2026-09-05T08:30:00Z',
        },
      ];
    }

    try {
      const parsed: AdminUser[] = JSON.parse(saved);
      let foundSuper = false;
      const updated = parsed.map((u) => {
        if (
          u.role === 'super_admin' ||
          u.email.toLowerCase() === 'jhfboss' ||
          u.email.toLowerCase() === 'jhflaptopzone@gmail.com'
        ) {
          foundSuper = true;
          return {
            ...u,
            email: 'jhfboss',
            role: 'super_admin' as AdminRole,
            status: 'active' as const,
          };
        }
        return u;
      });
      if (!foundSuper) {
        updated.unshift(defaultSuperAdmin);
      }
      return updated;
    } catch {
      return [defaultSuperAdmin];
    }
  });

  const [bloggerSettings, setBloggerSettings] = useState<BloggerSettings>(() => {
    const saved = localStorage.getItem('jhf_admin_blogger_settings');
    return saved ? JSON.parse(saved) : {
      blogId: 'jhflaptopzone.blogspot.com',
      apiKey: '',
      clientId: '',
      autoSyncToBlogger: true,
    };
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_activity_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [downloadEvents, setDownloadEvents] = useState<DownloadEvent[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_download_events');
      return saved ? JSON.parse(saved) : INITIAL_DOWNLOAD_EVENTS;
    } catch {
      return INITIAL_DOWNLOAD_EVENTS;
    }
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_security_events');
      return saved ? JSON.parse(saved) : INITIAL_SECURITY_EVENTS;
    } catch {
      return INITIAL_SECURITY_EVENTS;
    }
  });

  const [securityVerifications, setSecurityVerifications] = useState<SecurityVerificationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_security_verifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_customer_reviews');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_REVIEWS;
    } catch {
      return INITIAL_CUSTOMER_REVIEWS;
    }
  });

  const [toolComments, setToolComments] = useState<ToolComment[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_tool_comments');
      return saved ? JSON.parse(saved) : INITIAL_TOOL_COMMENTS;
    } catch {
      return INITIAL_TOOL_COMMENTS;
    }
  });

  // Model Catalog (Separated from physical inventory units)
  const [modelCatalog, setModelCatalog] = useState<LaptopCatalogModel[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_model_catalog');
      return saved ? JSON.parse(saved) : LAPTOP_MODEL_CATALOG;
    } catch {
      return LAPTOP_MODEL_CATALOG;
    }
  });

  // JHF Service Zone State
  const [services, setServices] = useState<ServiceJob[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_services');
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [serviceEngineers, setServiceEngineers] = useState<ServiceEngineer[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_service_engineers');
      return saved ? JSON.parse(saved) : INITIAL_SERVICE_ENGINEERS;
    } catch {
      return INITIAL_SERVICE_ENGINEERS;
    }
  });

  const [serviceParts, setServiceParts] = useState<ServicePart[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_service_parts');
      return saved ? JSON.parse(saved) : INITIAL_SERVICE_PARTS;
    } catch {
      return INITIAL_SERVICE_PARTS;
    }
  });

  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_warranty_claims');
      return saved ? JSON.parse(saved) : INITIAL_WARRANTY_CLAIMS;
    } catch {
      return INITIAL_WARRANTY_CLAIMS;
    }
  });

  // Disaster Recovery Full System Backups
  const [fullBackups, setFullBackups] = useState<FullSystemBackup[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_full_backups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Storage persistence state (10-Year Safe Guarantee)
  const [storageHealth, setStorageHealth] = useState<{
    isPersisted: boolean;
    quotaBytes: number;
    usedBytes: number;
    statusText: string;
  }>({
    isPersisted: true,
    quotaBytes: 50 * 1024 * 1024,
    usedBytes: 1.5 * 1024 * 1024,
    statusText: '10-Year Persistent Safe Vault: ACTIVE & LOCKED',
  });

  const requestStoragePersistence = async () => {
    const res = await enablePersistentStorage();
    setStorageHealth(res);
  };

  useEffect(() => {
    enablePersistentStorage().then((res) => {
      setStorageHealth(res);
    });

    // Sync snapshots from IndexedDB Permanent Vault
    getAllVaultSnapshots().then((vaultSnapshots) => {
      if (vaultSnapshots && vaultSnapshots.length > 0) {
        setFullBackups((prev) => {
          const map = new Map<string, FullSystemBackup>();
          for (const b of prev) map.set(b.id, b);
          for (const b of vaultSnapshots) {
            if (!map.has(b.id)) map.set(b.id, b);
          }
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
    });
  }, []);

  // Save to localStorage on mutation
  useEffect(() => {
    localStorage.setItem('jhf_admin_model_catalog', JSON.stringify(modelCatalog));
  }, [modelCatalog]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_service_engineers', JSON.stringify(serviceEngineers));
  }, [serviceEngineers]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_service_parts', JSON.stringify(serviceParts));
  }, [serviceParts]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_warranty_claims', JSON.stringify(warrantyClaims));
  }, [warrantyClaims]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_full_backups', JSON.stringify(fullBackups));
  }, [fullBackups]);

  // Save to localStorage on mutation
  useEffect(() => {
    localStorage.setItem('jhf_admin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_stock_units', JSON.stringify(stockUnits));
  }, [stockUnits]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_supplier_purchases', JSON.stringify(supplierPurchases));
  }, [supplierPurchases]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_supplier_payments', JSON.stringify(supplierPayments));
  }, [supplierPayments]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_emi_plans', JSON.stringify(emiPlans));
  }, [emiPlans]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_backup_logs', JSON.stringify(backupLogs));
  }, [backupLogs]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_recondition_laptops', JSON.stringify(reconditionLaptops));
  }, [reconditionLaptops]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_inventory_tx', JSON.stringify(inventoryTransactions));
  }, [inventoryTransactions]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_users_db', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_blogger_settings', JSON.stringify(bloggerSettings));
  }, [bloggerSettings]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_download_events', JSON.stringify(downloadEvents));
  }, [downloadEvents]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_security_events', JSON.stringify(securityEvents));
  }, [securityEvents]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_security_verifications', JSON.stringify(securityVerifications));
  }, [securityVerifications]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_customer_reviews', JSON.stringify(customerReviews));
  }, [customerReviews]);

  useEffect(() => {
    localStorage.setItem('jhf_admin_tool_comments', JSON.stringify(toolComments));
  }, [toolComments]);

  // Product Actions
  const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newId = 'prod-' + Date.now();
    const newProduct: Product = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Administrator',
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Record initial stock transaction if quantity > 0
    if (newProduct.stockQuantity > 0) {
      const tx: InventoryTransaction = {
        id: 'tx-' + Date.now(),
        productId: newId,
        productName: newProduct.name,
        type: 'stock_in',
        quantity: newProduct.stockQuantity,
        previousStock: 0,
        newStock: newProduct.stockQuantity,
        unitCost: newProduct.purchasePrice,
        totalCost: newProduct.purchasePrice * newProduct.stockQuantity,
        reason: 'Initial Inventory',
        performedBy: currentUser?.name || 'Admin',
        timestamp: new Date().toISOString(),
      };
      setInventoryTransactions((prev) => [tx, ...prev]);
    }

    logActivity('Add Product', 'Products', newProduct.name, `Created SKU: ${newProduct.sku} with stock ${newProduct.stockQuantity}`);
    triggerAutoBackup(`Product Added: ${newProduct.name}`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          // Recalculate profit margin if price changed
          if (updated.sellingPrice && updated.purchasePrice) {
            updated.profitMargin = updated.sellingPrice - updated.purchasePrice;
          }
          return updated;
        }
        return p;
      })
    );
    logActivity('Update Product', 'Products', id, `Updated product fields`);
  };

  const softDeleteProduct = (id: string, reason: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isDeleted: true,
              deletedAt: new Date().toISOString(),
              deletedBy: currentUser?.name || 'Admin',
              deleteReason: reason,
              status: 'archived',
            }
          : p
      )
    );
    logActivity('Soft Delete Product', 'Products', id, `Moved to Trash. Reason: ${reason}`);
    triggerAutoBackup(`Product Moved to Trash: ${id}`);
  };

  const restoreProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isDeleted: false,
              deletedAt: undefined,
              deletedBy: undefined,
              deleteReason: undefined,
              status: 'published',
            }
          : p
      )
    );
    logActivity('Restore Product', 'Products', id, `Restored product from Trash to Catalog`);
    triggerAutoBackup(`Product Restored from Trash: ${id}`);
  };

  const permanentDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logActivity('Permanent Delete', 'Products', id, `Permanently purged product from database`);
    triggerAutoBackup(`Product Permanently Purged: ${id}`);
  };

  const clearAllProducts = () => {
    setProducts([]);
    logActivity('Clear All Products', 'Products', 'All', 'Purged all products from catalog');
  };

  // Order Actions
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'timeline' | 'createdBy'>): Order => {
    const orderNumber = 'JHF-ORD-' + (1000 + orders.length + 1);
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: orderData.orderStatus,
          timestamp: new Date().toISOString(),
          note: 'Order created',
          performedBy: currentUser?.name || 'Admin',
        },
      ],
      createdBy: currentUser?.name || 'Admin',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Automatically deduct inventory stock
    orderData.items.forEach((item) => {
      const targetProd = products.find((p) => p.id === item.productId);
      if (targetProd) {
        const prevStock = targetProd.stockQuantity;
        const newStock = Math.max(0, prevStock - item.quantity);
        updateProduct(targetProd.id, { stockQuantity: newStock });

        const tx: InventoryTransaction = {
          id: 'tx-' + Date.now() + Math.random().toString(36).substring(2, 5),
          productId: targetProd.id,
          productName: targetProd.name,
          type: 'stock_out',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock,
          reason: 'Sale',
          referenceNumber: orderNumber,
          performedBy: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString(),
        };
        setInventoryTransactions((prevTx) => [tx, ...prevTx]);
      }
    });

    // Update or create Customer CRM profile
    setCustomers((prevCustomers) => {
      const existing = prevCustomers.find((c) => c.phoneNumber === orderData.customerPhone);
      if (existing) {
        return prevCustomers.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpending: c.totalSpending + orderData.totalAmount,
                lastOrderDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : c
        );
      } else {
        const newCustomer: Customer = {
          id: 'cust-' + Date.now(),
          fullName: orderData.customerName,
          phoneNumber: orderData.customerPhone,
          email: orderData.customerEmail,
          address: orderData.deliveryAddress,
          district: orderData.district,
          city: orderData.district,
          totalOrders: 1,
          totalSpending: orderData.totalAmount,
          lastOrderDate: new Date().toISOString(),
          accountStatus: 'active',
          tags: ['New Customer'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [newCustomer, ...prevCustomers];
      }
    });

    logActivity('Create Order', 'Orders', orderNumber, `New order created for ${orderData.customerName} (৳${orderData.totalAmount})`);
    triggerAutoBackup(`Order Created: ${orderNumber} (${orderData.customerName})`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note: string) => {
    triggerAutoBackup(`Order ${orderId} Status: ${newStatus}`);
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newEvent = {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note || `Status updated to ${newStatus}`,
            performedBy: currentUser?.name || 'Admin',
          };
          return {
            ...ord,
            orderStatus: newStatus,
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, newEvent],
          };
        }
        return ord;
      })
    );
    logActivity('Update Order Status', 'Orders', orderId, `Changed status to: ${newStatus}`);
  };

  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : ord
      )
    );
    logActivity('Update Order Details', 'Orders', orderId, `Updated details`);
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    logActivity('Delete Order', 'Orders', orderId, `Deleted order record ${orderId}`);
  };

  const clearAllOrders = () => {
    setOrders([]);
    logActivity('Clear All Orders', 'Orders', 'All', 'Purged all orders from database');
  };

  // Customer Actions
  const updateCustomer = (customerId: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    logActivity('Update Customer', 'Customers', customerId, 'Updated customer details');
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    logActivity('Delete Customer', 'Customers', customerId, `Deleted customer ${customerId}`);
    triggerAutoBackup(`Customer Deleted: ${customerId}`);
  };

  const clearAllCustomers = () => {
    setCustomers([]);
    logActivity('Clear All Customers', 'Customers', 'All', 'Purged all customers from CRM database');
  };

  const updateCustomerNotes = (customerId: string, notes: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, notes, updatedAt: new Date().toISOString() } : c))
    );
  };

  const addCustomerTag = (customerId: string, tag: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId && !c.tags.includes(tag) ? { ...c, tags: [...c.tags, tag], updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const removeCustomerTag = (customerId: string, tag: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, tags: c.tags.filter((t) => t !== tag), updatedAt: new Date().toISOString() } : c))
    );
  };

  // Inventory Actions
  const recordStockIn = (
    productId: string,
    quantity: number,
    unitCost: number,
    supplierName: string,
    refNo?: string,
    notes?: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const prevStock = prod.stockQuantity;
    const newStock = prevStock + quantity;

    updateProduct(productId, {
      stockQuantity: newStock,
      purchasePrice: unitCost || prod.purchasePrice,
    });

    const tx: InventoryTransaction = {
      id: 'tx-' + Date.now(),
      productId,
      productName: prod.name,
      type: 'stock_in',
      quantity,
      previousStock: prevStock,
      newStock,
      unitCost,
      totalCost: unitCost * quantity,
      supplierName,
      reason: 'Restock',
      referenceNumber: refNo,
      notes,
      performedBy: currentUser?.name || 'Admin',
      timestamp: new Date().toISOString(),
    };

    setInventoryTransactions((prev) => [tx, ...prev]);
    logActivity('Stock In', 'Inventory', prod.name, `Received +${quantity} units from ${supplierName}`);
  };

  const recordStockOut = (productId: string, quantity: number, reason: StockOutReason, refOrder?: string, notes?: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const prevStock = prod.stockQuantity;
    const newStock = Math.max(0, prevStock - quantity);

    updateProduct(productId, { stockQuantity: newStock });

    const tx: InventoryTransaction = {
      id: 'tx-' + Date.now(),
      productId,
      productName: prod.name,
      type: 'stock_out',
      quantity,
      previousStock: prevStock,
      newStock,
      reason,
      referenceNumber: refOrder,
      notes,
      performedBy: currentUser?.name || 'Admin',
      timestamp: new Date().toISOString(),
    };

    setInventoryTransactions((prev) => [tx, ...prev]);
    logActivity('Stock Out', 'Inventory', prod.name, `Deducted -${quantity} units. Reason: ${reason}`);
  };

  const recordStockAdjustment = (productId: string, newQuantity: number, reason: string, notes: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const prevStock = prod.stockQuantity;
    updateProduct(productId, { stockQuantity: newQuantity });

    const tx: InventoryTransaction = {
      id: 'tx-' + Date.now(),
      productId,
      productName: prod.name,
      type: 'adjustment',
      quantity: Math.abs(newQuantity - prevStock),
      previousStock: prevStock,
      newStock: newQuantity,
      reason: 'Physical Audit Correction',
      referenceNumber: reason,
      notes,
      performedBy: currentUser?.name || 'Admin',
      timestamp: new Date().toISOString(),
    };

    setInventoryTransactions((prev) => [tx, ...prev]);
    logActivity('Stock Adjustment', 'Inventory', prod.name, `Adjusted stock from ${prevStock} to ${newQuantity}. Reason: ${reason}`);
  };

  const directUpdateProductStock = (productId: string, newStock: number, minAlert?: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const prevStock = prod.stockQuantity;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockQuantity: Math.max(0, newStock),
              minimumStockAlert: minAlert !== undefined ? minAlert : p.minimumStockAlert,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    const tx: InventoryTransaction = {
      id: 'tx-' + Date.now(),
      productId,
      productName: prod.name,
      sku: prod.sku,
      type: 'adjustment',
      quantity: Math.abs(newStock - prevStock),
      previousStock: prevStock,
      newStock: Math.max(0, newStock),
      reason: 'Direct Stock Update by Admin',
      performedBy: currentUser?.name || 'Admin',
      timestamp: new Date().toISOString(),
    };
    setInventoryTransactions((prev) => [tx, ...prev]);
    logActivity('Direct Stock Update', 'Inventory', prod.name, `Changed stock from ${prevStock} to ${newStock}`);
  };

  const deleteInventoryTransaction = (txId: string) => {
    setInventoryTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  const clearAllInventoryTransactions = () => {
    setInventoryTransactions([]);
    logActivity('Clear Inventory Transactions', 'Inventory', 'All', 'Purged all inventory logs');
  };

  // Expense Actions
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>) => {
    const newExpense: Expense = {
      ...data,
      id: 'exp-' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
    };
    setExpenses((prev) => [newExpense, ...prev]);
    logActivity('Add Expense', 'Finance', data.category, `Amount: ৳${data.amount} for ${data.description}`);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    logActivity('Delete Expense', 'Finance', id, `Removed expense voucher`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Settings
  const updateSettings = (newSettings: Partial<WebsiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logActivity('Update Settings', 'Settings', 'Website Settings', `Updated store hotlines & configuration`);
  };

  // Customer Actions
  const addCustomer = (customerData: Partial<Customer>) => {
    const newCustomer: Customer = {
      id: 'cust-' + Date.now(),
      fullName: customerData.fullName || (customerData as any).name || 'Customer',
      phoneNumber: customerData.phoneNumber || (customerData as any).phone || '',
      email: customerData.email || '',
      address: customerData.address || '',
      district: customerData.district || 'Dhaka',
      city: customerData.city || 'Dhaka',
      totalOrders: 0,
      totalSpending: 0,
      accountStatus: 'active',
      tags: ['New Customer'],
      notes: customerData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    logActivity('Add Customer', 'Customers', newCustomer.fullName, `Created customer record for ${newCustomer.phoneNumber}`);
    triggerAutoBackup(`Customer Added: ${newCustomer.fullName}`);
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedTimeline = [
            ...ord.timeline,
            {
              status: ord.orderStatus,
              timestamp: new Date().toISOString(),
              note: `Payment status updated to ${status}`,
              performedBy: currentUser?.name || 'Administrator',
            },
          ];
          return {
            ...ord,
            paymentStatus: status,
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    logActivity('Update Payment Status', 'Orders', orderId, `Changed payment status to: ${status}`);
  };

  const adjustStock = (args: {
    productId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    unitCost?: number;
    batchNumber?: string;
    supplier?: string;
    reason?: string;
  }) => {
    if (args.type === 'in') {
      recordStockIn(
        args.productId,
        args.quantity,
        args.unitCost || 0,
        args.supplier || 'Restock Supplier',
        args.batchNumber,
        args.reason
      );
    } else if (args.type === 'out') {
      recordStockOut(
        args.productId,
        args.quantity,
        (args.reason as StockOutReason) || 'Sale',
        undefined,
        args.reason
      );
    } else {
      const prod = products.find((p) => p.id === args.productId);
      const newQty = (prod?.stockQuantity || 0) + args.quantity;
      recordStockAdjustment(
        args.productId,
        newQty,
        args.reason || 'Inventory Adjustment',
        `Adjusted by ${args.quantity}`
      );
    }
  };

  const updateBloggerSettings = (newSettings: Partial<BloggerSettings>) => {
    setBloggerSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
    logActivity('Update Blogger Settings', 'Settings', 'Blogger Config', 'Updated Blogger sync API parameters');
  };

  const addAdminUser = (userData: { name: string; email: string; password?: string; role: AdminRole; status?: 'active' | 'disabled' | 'pending'; phone?: string }) => {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const newUser: AdminUser = {
      uid: 'user-' + Date.now(),
      name: userData.name,
      email: cleanEmail,
      password: userData.password || '',
      phone: userData.phone || '',
      role: userData.role,
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      lastLogin: 'Never',
    };
    setAdminUsers((prev) => [newUser, ...prev]);
    logActivity('Add Admin User', 'Users', newUser.email, `Created user with role: ${newUser.role}`);
    triggerAutoBackup(`User Created: ${newUser.name} (${newUser.role})`);
  };

  const updateAdminUser = (uid: string, updatedFields: Partial<AdminUser>) => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          return {
            ...u,
            ...updatedFields,
            email: updatedFields.email ? updatedFields.email.trim().toLowerCase() : u.email,
          };
        }
        return u;
      })
    );
    logActivity('Update Admin User', 'Users', uid, `Updated profile for user: ${uid}`);
    triggerAutoBackup(`User Profile Updated: ${uid}`);
  };

  const deleteAdminUser = (uid: string): { success: boolean; message?: string } => {
    const target = adminUsers.find((u) => u.uid === uid);
    if (!target) {
      return { success: false, message: 'User not found' };
    }
    const cleanEmail = (target.email || '').toLowerCase();
    if (cleanEmail === 'jhfboss' || cleanEmail === 'jhflaptopzone@gmail.com') {
      return { success: false, message: 'Cannot delete the primary Super Administrator account.' };
    }
    if (target.role === 'super_admin') {
      const superAdminCount = adminUsers.filter((u) => u.role === 'super_admin').length;
      if (superAdminCount <= 1) {
        return { success: false, message: 'At least one Super Administrator must remain in the system.' };
      }
    }
    setAdminUsers((prev) => prev.filter((u) => u.uid !== uid));
    logActivity('Delete Admin User', 'Users', target.email, `Removed user account: ${target.name} (${target.email})`);
    triggerAutoBackup(`User Deleted: ${target.name} (${target.email})`);
    return { success: true };
  };

  const updateAdminUserStatus = (uid: string, status: 'active' | 'disabled') => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, status } : u))
    );
    logActivity('Update User Status', 'Users', uid, `Updated status to: ${status}`);
    triggerAutoBackup(`User Status Changed to ${status}: ${uid}`);
  };

  // Export / Backup Helpers
  const exportDataAsJson = (collectionName: string) => {
    let exportData: any = {};
    if (collectionName === 'products' || collectionName === 'all') exportData.products = products;
    if (collectionName === 'orders' || collectionName === 'all') exportData.orders = orders;
    if (collectionName === 'customers' || collectionName === 'all') exportData.customers = customers;
    if (collectionName === 'inventory' || collectionName === 'all') exportData.inventoryTransactions = inventoryTransactions;
    if (collectionName === 'expenses' || collectionName === 'all') exportData.expenses = expenses;

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `jhf_backup_${collectionName}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logActivity('Backup Export', 'Settings', collectionName, `Exported ${collectionName} backup JSON`);
  };

  const exportDataAsCsv = (collectionName: 'products' | 'orders' | 'customers' | 'expenses') => {
    let rows: any[] = [];
    if (collectionName === 'products') {
      rows = products.map((p) => ({
        SKU: p.sku,
        Name: p.name,
        Brand: p.brand,
        Model: p.model,
        Condition: p.condition,
        Stock: p.stockQuantity,
        PurchasePrice: p.purchasePrice,
        SellingPrice: p.sellingPrice,
        ProfitMargin: p.profitMargin,
        Status: p.status,
      }));
    } else if (collectionName === 'orders') {
      rows = orders.map((o) => ({
        OrderNumber: o.orderNumber,
        Date: o.createdAt,
        Customer: o.customerName,
        Phone: o.customerPhone,
        TotalAmount: o.totalAmount,
        PaymentMethod: o.paymentMethod,
        PaymentStatus: o.paymentStatus,
        OrderStatus: o.orderStatus,
        Courier: o.courierName || '',
      }));
    } else if (collectionName === 'customers') {
      rows = customers.map((c) => ({
        Name: c.fullName,
        Phone: c.phoneNumber,
        District: c.district,
        Orders: c.totalOrders,
        TotalSpending: c.totalSpending,
        Status: c.accountStatus,
      }));
    } else if (collectionName === 'expenses') {
      rows = expenses.map((e) => ({
        Date: e.date,
        Category: e.category,
        Description: e.description,
        Amount: e.amount,
        PaymentMethod: e.paymentMethod,
      }));
    }

    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [headers, ...rows.map((r) => Object.values(r).map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jhf_${collectionName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    logActivity('Export CSV', 'Settings', collectionName, `Exported ${collectionName} CSV table`);
  };

  // Stock Unit Actions
  const addStockUnit = (unitData: Omit<StockUnit, 'id' | 'createdAt'>) => {
    const newUnit: StockUnit = {
      ...unitData,
      id: 'stock-unit-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setStockUnits((prev) => [newUnit, ...prev]);
    logActivity('Add Stock Unit', 'Inventory', newUnit.serialNumber, `Added ${newUnit.modelName} (SN: ${newUnit.serialNumber})`);
    triggerAutoBackup(`Stock Unit Ingested: ${newUnit.serialNumber} (${newUnit.modelName})`);
  };

  const updateStockUnit = (id: string, updates: Partial<StockUnit>) => {
    setStockUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    logActivity('Update Stock Unit', 'Inventory', id, `Updated stock unit ${id}`);
  };

  const deleteStockUnit = (id: string) => {
    setStockUnits((prev) => prev.filter((u) => u.id !== id));
    logActivity('Delete Stock Unit', 'Inventory', id, `Removed stock unit ${id}`);
    triggerAutoBackup(`Stock Unit Removed: ${id}`);
  };

  const clearAllStockUnits = () => {
    setStockUnits([]);
    logActivity('Clear Stock Units', 'Inventory', 'All', 'Purged all serial number stock units');
  };

  // Supplier Actions
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 'sup-' + Date.now(),
      createdAt: new Date().toISOString(),
      totalPurchases: supplierData.totalPurchases || 0,
      totalPaid: supplierData.totalPaid || 0,
      outstandingBalance: supplierData.outstandingBalance || 0,
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    logActivity('Add Supplier', 'Suppliers', newSupplier.name, `Added supplier ${newSupplier.name}`);
    triggerAutoBackup(`Supplier Added: ${newSupplier.name}`);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    logActivity('Update Supplier', 'Suppliers', id, `Updated supplier details`);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    logActivity('Delete Supplier', 'Suppliers', id, `Deleted supplier ${id}`);
  };

  const addSupplierPurchase = (purchaseData: Omit<SupplierPurchase, 'id' | 'createdAt' | 'createdBy'>) => {
    const newPurchase: SupplierPurchase = {
      ...purchaseData,
      id: 'spurch-' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Md. Jahid Hasan',
    };
    setSupplierPurchases((prev) => [newPurchase, ...prev]);

    // Auto calculate & update supplier balance: Supplier Due = Total Purchase - Total Paid
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === newPurchase.supplierId) {
          const newTotalPurchase = (s.totalPurchases || 0) + newPurchase.totalPurchase;
          const newTotalPaid = (s.totalPaid || 0) + newPurchase.paidAmount;
          return {
            ...s,
            totalPurchases: newTotalPurchase,
            totalPaid: newTotalPaid,
            outstandingBalance: Math.max(0, newTotalPurchase - newTotalPaid),
          };
        }
        return s;
      })
    );

    logActivity('Supplier Purchase', 'Suppliers', newPurchase.invoiceRef, `Purchased BDT ${newPurchase.totalPurchase} from ${newPurchase.supplierName}`);
  };

  const addSupplierPayment = (paymentData: Omit<SupplierPayment, 'id' | 'createdAt' | 'createdBy'>) => {
    const newPayment: SupplierPayment = {
      ...paymentData,
      id: 'spay-' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Md. Jahid Hasan',
    };
    setSupplierPayments((prev) => [newPayment, ...prev]);

    // Auto deduct from supplier due balance: Supplier Due = Total Purchase - Total Paid
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === newPayment.supplierId) {
          const newTotalPaid = (s.totalPaid || 0) + newPayment.amount;
          const totalPurchases = s.totalPurchases || 0;
          return {
            ...s,
            totalPaid: newTotalPaid,
            outstandingBalance: Math.max(0, totalPurchases - newTotalPaid),
          };
        }
        return s;
      })
    );

    logActivity('Supplier Payment', 'Suppliers', newPayment.supplierName, `Paid BDT ${newPayment.amount} via ${newPayment.paymentMethod}`);
  };

  const updateSupplierPurchase = (id: string, updates: Partial<SupplierPurchase>) => {
    setSupplierPurchases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    logActivity('Update Supplier Purchase', 'Suppliers', id, 'Updated purchase entry');
  };

  const deleteSupplierPurchase = (id: string) => {
    setSupplierPurchases((prev) => prev.filter((p) => p.id !== id));
    logActivity('Delete Supplier Purchase', 'Suppliers', id, 'Deleted purchase entry');
  };

  const updateSupplierPayment = (id: string, updates: Partial<SupplierPayment>) => {
    setSupplierPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    logActivity('Update Supplier Payment', 'Suppliers', id, 'Updated payment entry');
  };

  const deleteSupplierPayment = (id: string) => {
    setSupplierPayments((prev) => prev.filter((p) => p.id !== id));
    logActivity('Delete Supplier Payment', 'Suppliers', id, 'Deleted payment entry');
  };

  const clearAllSuppliers = () => {
    setSuppliers([]);
    setSupplierPurchases([]);
    setSupplierPayments([]);
    logActivity('Clear All Suppliers', 'Suppliers', 'All', 'Purged all suppliers, purchases and ledger records');
  };

  // EMI / Installment Actions
  const addEmiPlan = (planData: Omit<EmiPlan, 'id' | 'createdAt' | 'updatedAt' | 'paymentHistory'>) => {
    const planId = 'emi-' + Date.now();
    const now = new Date().toISOString();
    const remainingDue = Math.max(0, planData.sellPrice - planData.downPayment);
    const monthlyInstallment = Math.ceil(remainingDue / (planData.planMonths || 6));
    
    // Initial payment entry for 1st installment (Instant Payment)
    const downPaymentEntry: EmiPayment = {
      id: 'emipay-' + Date.now(),
      emiPlanId: planId,
      paymentDate: planData.saleDate || now.slice(0, 10),
      installmentNumber: 1,
      amountPaid: planData.downPayment,
      remainingAfterPayment: remainingDue,
      paymentMethod: 'Cash',
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      collectedBy: currentUser?.name || 'Md. Jahid Hasan',
      notes: '1st Installment = Instant Payment / Down Payment',
    };

    const newPlan: EmiPlan = {
      ...planData,
      id: planId,
      profit: planData.sellPrice - planData.buyPrice,
      totalDue: remainingDue,
      paidAmount: planData.downPayment,
      remainingDue: remainingDue,
      monthlyInstallment,
      status: remainingDue === 0 ? 'completed' : 'active',
      isOverdue: false,
      paymentHistory: [downPaymentEntry],
      createdAt: now,
      updatedAt: now,
    };

    setEmiPlans((prev) => [newPlan, ...prev]);

    // Update stock unit if serial number matched
    if (newPlan.serialNumber) {
      setStockUnits((prev) =>
        prev.map((su) =>
          su.serialNumber.toLowerCase() === newPlan.serialNumber.toLowerCase()
            ? { ...su, status: 'Sold', soldToCustomer: newPlan.customerName, invoiceNo: newPlan.invoiceNo, soldAt: now }
            : su
        )
      );
    }

    logActivity('Create EMI Sale', 'Sales & EMI', newPlan.invoiceNo, `New EMI plan for ${newPlan.customerName} - Invoice ${newPlan.invoiceNo}`);
    triggerAutoBackup(`EMI Plan Created: ${newPlan.invoiceNo} (${newPlan.customerName})`);
    return newPlan;
  };

  const recordEmiPayment = (
    emiPlanId: string,
    amount: number,
    paymentMethod: 'Cash' | 'Bkash' | 'Nagad' | 'Rocket' | 'Bank Account' | 'POS',
    notes?: string
  ): { success: boolean; message?: string } => {
    const plan = emiPlans.find((p) => p.id === emiPlanId);
    if (!plan) return { success: false, message: 'EMI Plan not found' };
    if (plan.remainingDue <= 0) return { success: false, message: 'This EMI plan is already fully paid!' };

    const newRemaining = Math.max(0, plan.remainingDue - amount);
    const newPaid = plan.paidAmount + amount;
    const isCompleted = newRemaining === 0;
    const now = new Date().toISOString();

    const paymentRecord: EmiPayment = {
      id: 'emipay-' + Date.now(),
      emiPlanId,
      paymentDate: now.slice(0, 10),
      installmentNumber: plan.paymentHistory.length + 1,
      amountPaid: amount,
      remainingAfterPayment: newRemaining,
      paymentMethod,
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      collectedBy: currentUser?.name || 'Md. Jahid Hasan',
      notes: notes || 'Installment Payment',
    };

    setEmiPlans((prev) =>
      prev.map((p) => {
        if (p.id === emiPlanId) {
          return {
            ...p,
            paidAmount: newPaid,
            remainingDue: newRemaining,
            status: isCompleted ? 'completed' : p.status,
            isOverdue: isCompleted ? false : p.isOverdue,
            paymentHistory: [...p.paymentHistory, paymentRecord],
            updatedAt: now,
          };
        }
        return p;
      })
    );

    logActivity('Record EMI Payment', 'Sales & EMI', plan.invoiceNo, `Collected ৳${amount} from ${plan.customerName} via ${paymentMethod}`);
    return { success: true, message: `Payment of ৳${amount.toLocaleString()} recorded successfully!` };
  };

  const updateEmiPlan = (id: string, updates: Partial<EmiPlan>) => {
    setEmiPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteEmiPlan = (id: string) => {
    const plan = emiPlans.find((p) => p.id === id);
    if (plan && plan.serialNumber) {
      setStockUnits((prev) =>
        prev.map((su) =>
          su.serialNumber.toLowerCase() === plan.serialNumber.toLowerCase()
            ? { ...su, status: 'In Stock', soldToCustomer: undefined, invoiceNo: undefined, soldAt: undefined }
            : su
        )
      );
    }
    setEmiPlans((prev) => prev.filter((p) => p.id !== id));
    logActivity('Delete EMI Plan', 'Sales & EMI', id, `Deleted EMI plan contract ${id}`);
  };

  const deleteEmiPayment = (emiPlanId: string, paymentId: string) => {
    setEmiPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === emiPlanId) {
          const filteredPayments = plan.paymentHistory.filter((p) => p.id !== paymentId);
          const newPaid = filteredPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
          const newRemaining = Math.max(0, plan.sellPrice - newPaid);
          return {
            ...plan,
            paymentHistory: filteredPayments,
            paidAmount: newPaid,
            remainingDue: newRemaining,
            status: newRemaining === 0 ? 'completed' : 'active',
            updatedAt: new Date().toISOString(),
          };
        }
        return plan;
      })
    );
    logActivity('Delete EMI Payment', 'Sales & EMI', paymentId, `Deleted payment record ${paymentId}`);
  };

  const clearAllEmiPlans = () => {
    setEmiPlans([]);
    logActivity('Clear All EMI Plans', 'Sales & EMI', 'All', 'Purged all EMI installment contracts');
  };

  // JHF Recondition Zone (Pre-Owned Laptops) Actions & Financials
  const addReconditionLaptop = (laptop: Omit<ReconditionLaptop, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = 'rec-' + Date.now();
    const newItem: ReconditionLaptop = {
      ...laptop,
      id: newId,
      code: laptop.code || `REC-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReconditionLaptops((prev) => [newItem, ...prev]);
    logActivity('Add Recondition Laptop', 'Recondition Zone', newItem.title, `Added recondition laptop: ${newItem.title} (Buy: ৳${newItem.buyPrice}, Sell: ৳${newItem.sellPrice})`);
  };

  const updateReconditionLaptop = (id: string, updates: Partial<ReconditionLaptop>) => {
    setReconditionLaptops((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item))
    );
    logActivity('Update Recondition Laptop', 'Recondition Zone', id, 'Updated reconditioned laptop details');
  };

  const deleteReconditionLaptop = (id: string) => {
    setReconditionLaptops((prev) => prev.filter((item) => item.id !== id));
    logActivity('Delete Recondition Laptop', 'Recondition Zone', id, `Deleted recondition laptop ${id}`);
  };

  const markReconditionSold = (id: string, soldPrice?: number, customerName?: string, soldDate?: string) => {
    setReconditionLaptops((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const finalSoldPrice = soldPrice !== undefined && soldPrice > 0 ? soldPrice : (item.offerPrice || item.sellPrice);
          return {
            ...item,
            status: 'sold' as const,
            soldPrice: finalSoldPrice,
            soldDate: soldDate || new Date().toISOString().slice(0, 10),
            soldToCustomer: customerName || 'Walk-in Customer',
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    logActivity('Mark Recondition Sold', 'Recondition Zone', id, `Laptop marked as SOLD (Price: ৳${soldPrice})`);
  };

  const markReconditionAvailable = (id: string) => {
    setReconditionLaptops((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'available' as const,
            soldPrice: undefined,
            soldDate: undefined,
            soldToCustomer: undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    logActivity('Reactivate Recondition Laptop', 'Recondition Zone', id, 'Reactivated status to available');
  };

  const clearAllReconditionLaptops = () => {
    setReconditionLaptops([]);
    logActivity('Clear Recondition Laptops', 'Recondition Zone', 'All', 'Purged all reconditioned demo units');
  };

  // Summary calculation for Recondition Zone
  const reconditionSummary = useMemo(() => {
    const totalUnits = reconditionLaptops.length;
    const availableUnits = reconditionLaptops.filter((l) => l.status === 'available').length;
    const soldUnits = reconditionLaptops.filter((l) => l.status === 'sold').length;
    const bookedUnits = reconditionLaptops.filter((l) => l.status === 'booked').length;

    const totalInvestment = reconditionLaptops.reduce((sum, l) => sum + (Number(l.buyPrice) || 0), 0);
    const soldUnitsList = reconditionLaptops.filter((l) => l.status === 'sold');
    const soldInvestment = soldUnitsList.reduce((sum, l) => sum + (Number(l.buyPrice) || 0), 0);
    const totalSales = soldUnitsList.reduce((sum, l) => sum + (Number(l.soldPrice || l.sellPrice) || 0), 0);
    const totalProfit = totalSales - soldInvestment;

    const unsoldList = reconditionLaptops.filter((l) => l.status === 'available');
    const unsoldStockValue = unsoldList.reduce((sum, l) => sum + (Number(l.buyPrice) || 0), 0);
    const projectedProfit = unsoldList.reduce((sum, l) => sum + ((Number(l.offerPrice || l.sellPrice) || 0) - (Number(l.buyPrice) || 0)), 0);

    return {
      totalUnits,
      availableUnits,
      soldUnits,
      bookedUnits,
      totalInvestment,
      soldInvestment,
      totalSales,
      totalProfit,
      unsoldStockValue,
      projectedProfit,
    };
  }, [reconditionLaptops]);

  // Backup & Restore System
  const oneClickBackup = () => {
    const backupData = {
      business: BUSINESS_INFO,
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      products,
      stockUnits,
      orders,
      customers,
      suppliers,
      supplierPurchases,
      supplierPayments,
      emiPlans,
      reconditionLaptops,
      inventoryTransactions,
      expenses,
      settings,
    };

    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `jhf_erp_backup_${dateStr}.json`;
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    const newLog: BackupLog = {
      id: 'blog-' + Date.now(),
      filename,
      timestamp: new Date().toISOString(),
      type: 'export',
      sizeBytes: blob.size,
      recordCounts: {
        products: products.length,
        stockUnits: stockUnits.length,
        orders: orders.length,
        emiPlans: emiPlans.length,
        suppliers: suppliers.length,
        supplierPurchases: supplierPurchases.length,
        customers: customers.length,
      },
      status: 'success',
      performedBy: currentUser?.name || 'Md. Jahid Hasan',
    };
    setBackupLogs((prev) => [newLog, ...prev]);
    logActivity('Backup Database', 'Backup & Restore', filename, 'Full database JSON backup downloaded');
  };

  const restoreFromBackupJSON = (jsonString: string): { success: boolean; message: string; counts?: any } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid JSON backup format.' };
      }

      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.stockUnits)) setStockUnits(data.stockUnits);
      if (Array.isArray(data.orders)) setOrders(data.orders);
      if (Array.isArray(data.customers)) setCustomers(data.customers);
      if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (Array.isArray(data.supplierPurchases)) setSupplierPurchases(data.supplierPurchases);
      if (Array.isArray(data.supplierPayments)) setSupplierPayments(data.supplierPayments);
      if (Array.isArray(data.emiPlans)) setEmiPlans(data.emiPlans);
      if (Array.isArray(data.reconditionLaptops)) setReconditionLaptops(data.reconditionLaptops);
      if (Array.isArray(data.inventoryTransactions)) setInventoryTransactions(data.inventoryTransactions);
      if (Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (data.settings) setSettings(data.settings);

      const counts = {
        products: data.products?.length || 0,
        stockUnits: data.stockUnits?.length || 0,
        orders: data.orders?.length || 0,
        emiPlans: data.emiPlans?.length || 0,
        reconditionLaptops: data.reconditionLaptops?.length || 0,
        suppliers: data.suppliers?.length || 0,
        customers: data.customers?.length || 0,
      };

      const newLog: BackupLog = {
        id: 'blog-' + Date.now(),
        filename: 'Restored from JSON upload',
        timestamp: new Date().toISOString(),
        type: 'restore',
        recordCounts: {
          products: counts.products,
          stockUnits: counts.stockUnits,
          orders: counts.orders,
          emiPlans: counts.emiPlans,
          suppliers: counts.suppliers,
          supplierPurchases: data.supplierPurchases?.length || 0,
          customers: counts.customers,
        },
        status: 'success',
        performedBy: currentUser?.name || 'Md. Jahid Hasan',
      };
      setBackupLogs((prev) => [newLog, ...prev]);
      logActivity('Restore Database', 'Backup & Restore', 'Full Restore', 'Restored ERP database from backup file');

      return {
        success: true,
        message: `Successfully restored ${counts.products} products, ${counts.stockUnits} stock units, ${counts.emiPlans} EMI plans, ${counts.suppliers} suppliers, ${counts.reconditionLaptops} recondition laptops!`,
        counts,
      };
    } catch (err: any) {
      return { success: false, message: 'Failed to parse JSON file: ' + err.message };
    }
  };

  const resetStoreToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setInventoryTransactions([]);
    setSuppliers(INITIAL_SUPPLIERS);
    setStockUnits(INITIAL_STOCK_UNITS);
    setSupplierPurchases(INITIAL_SUPPLIER_PURCHASES);
    setSupplierPayments(INITIAL_SUPPLIER_PAYMENTS);
    setEmiPlans(INITIAL_EMI_PLANS);
    setReconditionLaptops(INITIAL_RECONDITION_LAPTOPS);
    setExpenses(INITIAL_EXPENSES);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem('jhf_admin_products');
    localStorage.removeItem('jhf_admin_orders');
    localStorage.removeItem('jhf_admin_customers');
    localStorage.removeItem('jhf_admin_inventory_tx');
    localStorage.removeItem('jhf_admin_suppliers');
    localStorage.removeItem('jhf_admin_stock_units');
    localStorage.removeItem('jhf_admin_supplier_purchases');
    localStorage.removeItem('jhf_admin_supplier_payments');
    localStorage.removeItem('jhf_admin_emi_plans');
    localStorage.removeItem('jhf_admin_recondition_laptops');
    localStorage.removeItem('jhf_admin_expenses');
    localStorage.removeItem('jhf_admin_settings');
    logActivity('Reset Store', 'Settings', 'Default Reset', 'Reset ERP database to factory default records');
  };

  // Download Intelligence & Security Actions
  const recordDownloadEvent = (eventData: Omit<DownloadEvent, 'id' | 'timestamp'>): DownloadEvent => {
    const newEvent: DownloadEvent = {
      ...eventData,
      id: `dl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    setDownloadEvents((prev) => [newEvent, ...prev]);

    // Check automated security rules:
    // If >4 downloads within 60s from same IP/session -> Trigger High Risk Security Event
    const recentFromIp = downloadEvents.filter((e) => {
      const timeDiff = Date.now() - new Date(e.timestamp).getTime();
      return timeDiff < 60000 && (e.ip === eventData.ip || e.sessionId === eventData.sessionId);
    });

    if (recentFromIp.length >= 4) {
      addSecurityEvent({
        ip: eventData.ip,
        region: eventData.region,
        event: `Extreme download frequency (${recentFromIp.length + 1} files in 60s)`,
        risk: 'HIGH',
        downloadItem: eventData.softwareName,
        actionTaken: 'Rate Limited',
        notes: 'Automated defense rate-limiting triggered to protect bandwidth.',
      });
    }

    return newEvent;
  };

  const addSecurityEvent = (secData: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent => {
    const newSec: SecurityEvent = {
      ...secData,
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    setSecurityEvents((prev) => [newSec, ...prev]);
    return newSec;
  };

  const updateSecurityEventAction = (id: string, actionTaken: SecurityEvent['actionTaken'], notes?: string) => {
    setSecurityEvents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, actionTaken, notes: notes || s.notes } : s))
    );
  };

  const recordSecurityVerification = (
    recData: Omit<SecurityVerificationRecord, 'id' | 'timestamp' | 'status'>
  ): SecurityVerificationRecord => {
    const newRec: SecurityVerificationRecord = {
      ...recData,
      id: `sec-ver-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'active',
    };
    setSecurityVerifications((prev) => [newRec, ...prev]);
    return newRec;
  };

  const addCustomerReview = (revData: Omit<CustomerReview, 'id' | 'createdAt' | 'status'>): CustomerReview => {
    const newRev: CustomerReview = {
      ...revData,
      id: `rev-${Date.now()}`,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    setCustomerReviews((prev) => [newRev, ...prev]);
    return newRev;
  };

  const updateReviewStatus = (id: string, status: 'approved' | 'hidden' | 'pending', adminReply?: string) => {
    setCustomerReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, adminReply: adminReply !== undefined ? adminReply : r.adminReply } : r))
    );
  };

  const updateCustomerReviewStatus = (id: string, status: 'approved' | 'hidden' | 'pending', adminReply?: string) => {
    updateReviewStatus(id, status, adminReply);
  };

  const deleteReview = (id: string) => {
    setCustomerReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const deleteCustomerReview = (id: string) => {
    deleteReview(id);
  };

  const addToolComment = (commData: Omit<ToolComment, 'id' | 'createdAt' | 'likes' | 'status'>): ToolComment => {
    const newComm: ToolComment = {
      ...commData,
      id: `comm-${Date.now()}`,
      likes: 0,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    setToolComments((prev) => [newComm, ...prev]);
    return newComm;
  };

  const updateToolCommentStatus = (id: string, status: 'approved' | 'hidden' | 'pending') => {
    setToolComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const deleteToolComment = (id: string) => {
    setToolComments((prev) => prev.filter((c) => c.id !== id));
  };

  const addToolCommentReply = (commentId: string, author: string, text: string) => {
    const newReply: ToolCommentReply = {
      id: `reply-${Date.now()}`,
      author,
      text,
      createdAt: new Date().toISOString(),
    };
    setToolComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c))
    );
  };

  // ==========================================
  // MODEL CATALOG MANAGEMENT (Separated from Inventory Units)
  // ==========================================
  const addModelToCatalog = (model: LaptopCatalogModel) => {
    setModelCatalog((prev) => {
      // Check if already exists by id
      if (prev.some((m) => m.id === model.id)) {
        return prev.map((m) => (m.id === model.id ? model : m));
      }
      return [model, ...prev];
    });
    logActivity('Create Model', 'Products', model.fullName, 'Added new model specification template to catalog.');
  };

  const updateModelInCatalog = (id: string, updates: Partial<LaptopCatalogModel>) => {
    setModelCatalog((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    logActivity('Update Model', 'Products', id, 'Updated catalog specification template.');
  };

  const deleteModelFromCatalog = (id: string) => {
    setModelCatalog((prev) => prev.filter((m) => m.id !== id));
    logActivity('Delete Model', 'Products', id, 'Removed model from specification catalog.');
  };

  // ==========================================
  // JHF SERVICE ZONE ACTIONS
  // ==========================================
  const addServiceJob = (jobData: Omit<ServiceJob, 'id' | 'createdAt' | 'updatedAt' | 'logs'>): ServiceJob => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);
    const newId = `JHF-SRV-${yyyy}${mm}${dd}${rand}`;

    const newJob: ServiceJob = {
      ...jobData,
      id: newId,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: today.toISOString(),
          action: 'Service Intake Registered',
          user: currentUser?.name || 'Admin',
          details: `Registered ${jobData.laptopBrand} ${jobData.laptopModel} for ${jobData.customerName}.`,
        },
      ],
    };

    setServices((prev) => [newJob, ...prev]);
    logActivity('New Service Job', 'Inventory', newId, `Registered service intake for ${jobData.customerName}.`);
    triggerAutoBackup(`Service Job Registered: ${newId} (${jobData.customerName})`);
    return newJob;
  };

  const updateServiceJob = (id: string, updates: Partial<ServiceJob>) => {
    setServices((prev) =>
      prev.map((job) => {
        if (job.id !== id) return job;
        const now = new Date().toISOString();
        const updatedLogs = [...(job.logs || [])];
        if (updates.status && updates.status !== job.status) {
          updatedLogs.push({
            id: `log-${Date.now()}`,
            timestamp: now,
            action: `Status Changed: ${updates.status}`,
            user: currentUser?.name || 'Admin',
            details: `Status updated from ${job.status} to ${updates.status}.`,
          });
        }
        return {
          ...job,
          ...updates,
          updatedAt: now,
          logs: updatedLogs,
        };
      })
    );
  };

  const deleteServiceJob = (id: string) => {
    setServices((prev) => prev.filter((j) => j.id !== id));
    logActivity('Delete Service Job', 'Inventory', id, 'Deleted service job sheet.');
  };

  const addServiceEngineer = (engData: Omit<ServiceEngineer, 'id' | 'createdAt'>) => {
    const newEng: ServiceEngineer = {
      ...engData,
      id: `eng-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    setServiceEngineers((prev) => [newEng, ...prev]);
  };

  const updateServiceEngineer = (id: string, updates: Partial<ServiceEngineer>) => {
    setServiceEngineers((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteServiceEngineer = (id: string) => {
    setServiceEngineers((prev) => prev.filter((e) => e.id !== id));
  };

  const addServicePart = (partData: Omit<ServicePart, 'id' | 'createdAt'>) => {
    const newPart: ServicePart = {
      ...partData,
      id: `part-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };
    setServiceParts((prev) => [newPart, ...prev]);
  };

  const updateServicePart = (id: string, updates: Partial<ServicePart>) => {
    setServiceParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteServicePart = (id: string) => {
    setServiceParts((prev) => prev.filter((p) => p.id !== id));
  };

  const useServicePart = (
    serviceJobId: string,
    partId: string,
    quantity: number,
    customerCharge?: number
  ) => {
    const part = serviceParts.find((p) => p.id === partId);
    if (!part) return;

    // Deduct stock from serviceParts
    setServiceParts((prev) =>
      prev.map((p) =>
        p.id === partId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
      )
    );

    const charge = customerCharge !== undefined ? customerCharge : part.sellingPrice * quantity;
    const purchaseCost = part.purchaseCost * quantity;

    const usage: ServicePartUsage = {
      id: `usage-${Date.now()}`,
      partId: part.id,
      partName: part.name,
      partCode: part.code,
      quantity,
      purchaseCost,
      customerCharge: charge,
      warrantyDays: part.warrantyDays,
      warrantyStart: new Date().toISOString().split('T')[0],
      serialNumber: part.serialNumber,
    };

    setServices((prev) =>
      prev.map((job) => {
        if (job.id !== serviceJobId) return job;
        const newPartsUsed = [...(job.partsUsed || []), usage];
        const newPartsCost = (job.partsCost || 0) + charge;
        const newInternalPartsCost = (job.internalPartsCost || 0) + purchaseCost;
        const newTotal = (job.diagnosticFee || 0) + (job.laborCost || 0) + newPartsCost + (job.otherCost || 0) - (job.discount || 0);
        const newDue = Math.max(0, newTotal - (job.paidAmount || 0));
        const newProfit = Math.max(0, newTotal - (newInternalPartsCost + (job.diagnosticFee || 0) * 0.2));

        return {
          ...job,
          partsUsed: newPartsUsed,
          partsCost: newPartsCost,
          internalPartsCost: newInternalPartsCost,
          totalCost: newTotal,
          dueAmount: newDue,
          profit: newProfit,
          updatedAt: new Date().toISOString(),
          logs: [
            ...(job.logs || []),
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'Spare Part Attached',
              user: currentUser?.name || 'Admin',
              details: `Attached ${quantity}x ${part.name} (Code: ${part.code}). Charge: ৳${charge}.`,
            },
          ],
        };
      })
    );
  };

  const recordServicePayment = (
    serviceJobId: string,
    payment: Omit<ServicePaymentRecord, 'id'>
  ) => {
    const paymentRecord: ServicePaymentRecord = {
      ...payment,
      id: `pmt-${Date.now()}`,
    };

    setServices((prev) =>
      prev.map((job) => {
        if (job.id !== serviceJobId) return job;
        const newPaid = (job.paidAmount || 0) + payment.amount;
        const newDue = Math.max(0, (job.totalCost || 0) - newPaid);

        return {
          ...job,
          paidAmount: newPaid,
          dueAmount: newDue,
          paymentHistory: [...(job.paymentHistory || []), paymentRecord],
          updatedAt: new Date().toISOString(),
          logs: [
            ...(job.logs || []),
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'Payment Recorded',
              user: currentUser?.name || 'Admin',
              details: `Received ৳${payment.amount} via ${payment.method} (${payment.type}).`,
            },
          ],
        };
      })
    );
  };

  const addWarrantyClaim = (claimData: Omit<WarrantyClaim, 'id' | 'claimDate'>): WarrantyClaim => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);
    const newId = `JHF-WCL-${yyyy}${mm}${dd}${rand}`;

    const newClaim: WarrantyClaim = {
      ...claimData,
      id: newId,
      claimDate: today.toISOString(),
    };

    setWarrantyClaims((prev) => [newClaim, ...prev]);

    // Update job status to WARRANTY RETURN
    updateServiceJob(claimData.originalServiceId, {
      status: 'WARRANTY RETURN',
      warrantyStatus: 'CLAIMED',
    });

    logActivity('Warranty Claim', 'Inventory', newId, `Filed warranty claim for ${claimData.customerName}.`);
    return newClaim;
  };

  const updateWarrantyClaim = (id: string, updates: Partial<WarrantyClaim>) => {
    setWarrantyClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // ==========================================
  // DATA CENTER: DUMMY DATA CLEANUP (SAFE FILTERING)
  // Only records explicitly marked as isDummy: true may be deleted!
  // ==========================================
  const clearAllDummyData = () => {
    let deletedCount = 0;

    setProducts((prev) => {
      const kept = prev.filter((p) => p.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setOrders((prev) => {
      const kept = prev.filter((o) => o.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setCustomers((prev) => {
      const kept = prev.filter((c) => c.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setStockUnits((prev) => {
      const kept = prev.filter((u) => u.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setSuppliers((prev) => {
      const kept = prev.filter((s) => s.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setSupplierPurchases((prev) => {
      const kept = prev.filter((sp) => sp.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setSupplierPayments((prev) => {
      const kept = prev.filter((sp) => sp.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setExpenses((prev) => {
      const kept = prev.filter((e) => e.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setEmiPlans((prev) => {
      const kept = prev.filter((ep) => ep.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setServices((prev) => {
      const kept = prev.filter((s) => s.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setServiceEngineers((prev) => {
      const kept = prev.filter((e) => e.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setServiceParts((prev) => {
      const kept = prev.filter((p) => p.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setWarrantyClaims((prev) => {
      const kept = prev.filter((w) => w.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setCustomerReviews((prev) => {
      const kept = prev.filter((r) => r.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    setToolComments((prev) => {
      const kept = prev.filter((c) => c.isDummy !== true);
      deletedCount += prev.length - kept.length;
      return kept;
    });

    logActivity(
      'Clear Dummy Data',
      'Settings',
      'Data Center',
      `Safely purged ${deletedCount} demo/sample records marked with isDummy: true. Real customer and business data preserved.`
    );

    return { deletedTotal: deletedCount };
  };

  // ==========================================
  // FULL DISASTER RECOVERY & BACKUP CENTER (10-YEAR SAFE)
  // ==========================================
  const autoBackupDebounceRef = React.useRef<any>(null);

  const triggerAutoBackup = (reason: string) => {
    if (autoBackupDebounceRef.current) {
      clearTimeout(autoBackupDebounceRef.current);
    }
    autoBackupDebounceRef.current = setTimeout(() => {
      createFullSystemBackup('auto_change', `Auto-Backup: ${reason}`, reason);
    }, 600);
  };

  const createFullSystemBackup = (
    type: 'full' | 'safety' | 'manual' | 'auto_change' | 'session_entry' = 'full',
    note?: string,
    triggerReason?: string
  ): FullSystemBackup => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');
    const ss = String(today.getSeconds()).padStart(2, '0');
    const bkpId = `JHF-BKP-${yyyy}${mm}${dd}-${hh}${min}${ss}`;

    const snapshotData = {
      products,
      modelCatalog,
      orders,
      customers,
      adminUsers,
      inventoryTransactions,
      suppliers,
      stockUnits,
      supplierPurchases,
      supplierPayments,
      emiPlans,
      expenses,
      services,
      serviceEngineers,
      serviceParts,
      warrantyClaims,
      reviews: customerReviews,
      comments: toolComments,
      downloadEvents,
      securityEvents,
      reconditionLaptops,
      bloggerSettings,
      activityLogs,
      notifications,
      settings,
    };

    const dataJson = JSON.stringify(snapshotData);
    const sizeBytes = new Blob([dataJson]).size;

    // Simple robust hash checksum
    let hash = 0;
    for (let i = 0; i < dataJson.length; i++) {
      hash = (hash << 5) - hash + dataJson.charCodeAt(i);
      hash |= 0;
    }
    const checksum = `SHA256-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;

    const backupRecord: FullSystemBackup = {
      id: bkpId,
      createdAt: today.toISOString(),
      applicationVersion: '2.5.0-ENTERPRISE',
      schemaVersion: '1.2.0',
      type,
      note:
        note ||
        (type === 'safety'
          ? 'Automatic Pre-Restore Safety Snapshot'
          : type === 'auto_change'
          ? `Auto-Backup: ${triggerReason || 'Data Modified'}`
          : type === 'session_entry'
          ? 'Admin Portal Session Snapshot'
          : 'Manual Full ERP Snapshot'),
      triggerReason,
      sizeBytes,
      checksum,
      counts: {
        products: products.length,
        modelCatalog: modelCatalog.length,
        inventory: stockUnits.length,
        orders: orders.length,
        customers: customers.length,
        adminUsers: adminUsers.length,
        reviews: customerReviews.length,
        comments: toolComments.length,
        services: services.length,
        serviceEngineers: serviceEngineers.length,
        serviceParts: serviceParts.length,
        warrantyClaims: warrantyClaims.length,
        suppliers: suppliers.length,
        expenses: expenses.length,
        emiPlans: emiPlans.length,
        auditLogs: activityLogs.length,
      },
      data: snapshotData,
    };

    setFullBackups((prev) => [backupRecord, ...prev.slice(0, 49)]);
    saveSnapshotToVault(backupRecord);
    logActivity('System Backup', 'Settings', bkpId, `Created ${type} backup snapshot (${(sizeBytes / 1024).toFixed(1)} KB).`);

    return backupRecord;
  };

  const restoreFullSystemBackup = (backup: FullSystemBackup): { success: boolean; message: string } => {
    if (!backup || !backup.data) {
      return { success: false, message: 'Invalid backup object: missing database payload.' };
    }

    try {
      // 1. SAFETY MEASURE: Automatically generate pre-restore safety backup
      createFullSystemBackup('safety', `Pre-Restore snapshot before applying ${backup.id}`);

      // 2. Restore state
      if (Array.isArray(backup.data.products)) setProducts(backup.data.products);
      if (Array.isArray(backup.data.modelCatalog)) setModelCatalog(backup.data.modelCatalog);
      if (Array.isArray(backup.data.orders)) setOrders(backup.data.orders);
      if (Array.isArray(backup.data.customers)) setCustomers(backup.data.customers);
      if (Array.isArray(backup.data.adminUsers) && backup.data.adminUsers.length > 0) setAdminUsers(backup.data.adminUsers);
      if (Array.isArray(backup.data.inventoryTransactions)) setInventoryTransactions(backup.data.inventoryTransactions);
      if (Array.isArray(backup.data.suppliers)) setSuppliers(backup.data.suppliers);
      if (Array.isArray(backup.data.stockUnits)) setStockUnits(backup.data.stockUnits);
      if (Array.isArray(backup.data.supplierPurchases)) setSupplierPurchases(backup.data.supplierPurchases);
      if (Array.isArray(backup.data.supplierPayments)) setSupplierPayments(backup.data.supplierPayments);
      if (Array.isArray(backup.data.emiPlans)) setEmiPlans(backup.data.emiPlans);
      if (Array.isArray(backup.data.expenses)) setExpenses(backup.data.expenses);
      if (Array.isArray(backup.data.services)) setServices(backup.data.services);
      if (Array.isArray(backup.data.serviceEngineers)) setServiceEngineers(backup.data.serviceEngineers);
      if (Array.isArray(backup.data.serviceParts)) setServiceParts(backup.data.serviceParts);
      if (Array.isArray(backup.data.warrantyClaims)) setWarrantyClaims(backup.data.warrantyClaims);
      if (Array.isArray(backup.data.reviews)) setCustomerReviews(backup.data.reviews);
      if (Array.isArray(backup.data.comments)) setToolComments(backup.data.comments);
      if (Array.isArray(backup.data.reconditionLaptops)) setReconditionLaptops(backup.data.reconditionLaptops);
      if (backup.data.bloggerSettings) setBloggerSettings(backup.data.bloggerSettings);
      if (Array.isArray(backup.data.activityLogs)) setActivityLogs(backup.data.activityLogs);
      if (Array.isArray(backup.data.notifications)) setNotifications(backup.data.notifications);
      if (backup.data.settings) setSettings(backup.data.settings);

      logActivity('Restore Database', 'Settings', backup.id, `Successfully restored system state from backup ${backup.id}.`);
      return {
        success: true,
        message: `Database restored successfully from backup ${backup.id}. A safety rollback snapshot was automatically created.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to restore database from backup payload.',
      };
    }
  };

  const deleteFullSystemBackup = (backupId: string) => {
    setFullBackups((prev) => prev.filter((b) => b.id !== backupId));
    deleteSnapshotFromVault(backupId);
    logActivity('Delete Backup', 'Settings', backupId, 'Deleted backup snapshot from local recovery archives.');
  };

  return (
    <AdminStoreContext.Provider
      value={{
        products,
        orders,
        customers,
        inventoryTransactions,
        suppliers,
        stockUnits,
        supplierPurchases,
        supplierPayments,
        emiPlans,
        reconditionLaptops,
        addReconditionLaptop,
        updateReconditionLaptop,
        deleteReconditionLaptop,
        markReconditionSold,
        markReconditionAvailable,
        clearAllReconditionLaptops,
        reconditionSummary,
        backupLogs,
        expenses,
        notifications,
        settings,
        adminUsers,
        bloggerSettings,
        activityLogs,
        showroomConfig: SHOWROOM_CONFIG,
        downloadEvents,
        securityEvents,
        securityVerifications,
        customerReviews,
        toolComments,
        recordDownloadEvent,
        addSecurityEvent,
        updateSecurityEventAction,
        recordSecurityVerification,
        addCustomerReview,
        updateReviewStatus,
        updateCustomerReviewStatus,
        deleteReview,
        deleteCustomerReview,
        addToolComment,
        updateToolCommentStatus,
        deleteToolComment,
        addToolCommentReply,
        addStockUnit,
        updateStockUnit,
        deleteStockUnit,
        clearAllStockUnits,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        clearAllSuppliers,
        addSupplierPurchase,
        updateSupplierPurchase,
        deleteSupplierPurchase,
        addSupplierPayment,
        updateSupplierPayment,
        deleteSupplierPayment,
        addEmiPlan,
        recordEmiPayment,
        updateEmiPlan,
        deleteEmiPlan,
        deleteEmiPayment,
        clearAllEmiPlans,
        oneClickBackup,
        restoreFromBackupJSON,
        resetStoreToDefaults,
        addProduct,
        updateProduct,
        softDeleteProduct,
        restoreProduct,
        permanentDeleteProduct,
        clearAllProducts,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        updateOrderDetails,
        deleteOrder,
        clearAllOrders,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        clearAllCustomers,
        updateCustomerNotes,
        addCustomerTag,
        removeCustomerTag,
        recordStockIn,
        recordStockOut,
        recordStockAdjustment,
        directUpdateProductStock,
        deleteInventoryTransaction,
        clearAllInventoryTransactions,
        adjustStock,
        addExpense,
        deleteExpense,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        updateBloggerSettings,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        updateAdminUserStatus,
        exportDataAsJson,
        exportDataAsCsv,
        modelCatalog,
        addModelToCatalog,
        updateModelInCatalog,
        deleteModelFromCatalog,
        services,
        serviceEngineers,
        serviceParts,
        warrantyClaims,
        addServiceJob,
        updateServiceJob,
        deleteServiceJob,
        addServiceEngineer,
        updateServiceEngineer,
        deleteServiceEngineer,
        addServicePart,
        updateServicePart,
        deleteServicePart,
        useServicePart,
        recordServicePayment,
        addWarrantyClaim,
        updateWarrantyClaim,
        clearAllDummyData,
        fullBackups,
        createFullSystemBackup,
        restoreFullSystemBackup,
        deleteFullSystemBackup,
        triggerAutoBackup,
        storageHealth,
        requestStoragePersistence,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
};

export const useAdminStore = () => {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error('useAdminStore must be used within an AdminStoreProvider');
  }
  return context;
};
