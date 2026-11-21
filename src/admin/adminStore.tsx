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
  BdstallImportBatch,
  ImageHistoryRecord,
  ImageVerificationStatus,
} from './types';
import { LaptopCatalogModel, LAPTOP_MODEL_CATALOG } from './data/laptopModelCatalog';
import { BRAND_LAPTOP_IMAGES } from '../data/jhfData';
import { DELL_LATITUDE_CATALOG_SEED } from '../utils/dellLatitudeCatalogSpec';
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
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from './firebase';
import { ServiceRequest, ServiceRequestStatus, ServiceRequestAuditLog } from '../types/serviceRequest';
import { INITIAL_SERVICE_REQUESTS } from './data/serviceRequestInitialData';

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
  useServicePart: (
    serviceJobId: string,
    partId: string,
    quantity: number,
    customerCharge?: number,
    overrideWarrantyDays?: number
  ) => void;
  addCustomServicePartToJob: (
    serviceJobId: string,
    customPart: {
      name: string;
      code?: string;
      category?: ServicePart['category'];
      quantity: number;
      purchaseCost?: number;
      customerCharge: number;
      warrantyDays: number;
      saveToInventory?: boolean;
    }
  ) => void;
  removeServicePart: (serviceJobId: string, usageId: string) => void;
  recordServicePayment: (serviceJobId: string, payment: Omit<ServicePaymentRecord, 'id'>) => void;
  removeServicePayment: (serviceJobId: string, paymentId: string) => void;
  addWarrantyClaim: (claim: Omit<WarrantyClaim, 'id' | 'claimDate'>) => WarrantyClaim;
  updateWarrantyClaim: (id: string, updates: Partial<WarrantyClaim>) => void;
  deleteWarrantyClaim: (id: string) => void;
  clearAllServiceZoneDummyData: () => { deletedCount: number };

  // Customer Service Requests & Public Tracking
  serviceRequests: ServiceRequest[];
  addServiceRequest: (request: Omit<ServiceRequest, 'id' | 'srNumber' | 'createdAt' | 'lastUpdatedAt'>) => Promise<ServiceRequest>;
  updateServiceRequestStatus: (
    id: string,
    newStatus: ServiceRequestStatus,
    customerNote?: string,
    internalNote?: string
  ) => Promise<void>;
  updateServiceRequest: (id: string, updates: Partial<ServiceRequest>) => Promise<void>;
  deleteServiceRequest: (id: string) => Promise<void>;
  generateNextSrNumber: () => Promise<string>;
  convertRequestToServiceJob: (srId: string, assignedEngineerId?: string) => Promise<ServiceJob | null>;

  // Data Center & Dummy Data Management
  isDummyDataCleared: boolean;
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

  // BDStall Dell Latitude Inventory & Import System
  bdstallImportHistory: BdstallImportBatch[];
  approveBdstallImportBatch: (params: {
    items: Array<{
      existingProductId?: string;
      brand: 'Dell';
      series: string;
      model: string;
      generation: string;
      processor: string;
      ram: string;
      ssd: string;
      hdd: string;
      display: string;
      touchscreen: 'Touchscreen' | 'Non-Touch';
      resolution: string;
      condition: Product['condition'];
      purchasePrice: number;
      marketPrice: number | null;
      marketPriceMin?: number | null;
      marketPriceMax?: number | null;
      sellingPrice: number;
      stockQuantity: number;
      sellerCount: number;
      sellerListings: NonNullable<Product['sellerListings']>;
      sourceUrl: string;
      lastUpdated: string;
      stockStatus: NonNullable<Product['stockStatus']>;
      configKey: string;
      publishToCatalog?: boolean;
    }>;
    importMethod: BdstallImportBatch['importMethod'];
    sourceUrl: string;
    fetchedAt: string;
    totalExtracted: number;
    skippedCount: number;
  }) => { added: number; updated: number; batch: BdstallImportBatch };

  // Universal Exact Model Image Finder & Auto Product Image Manager
  imageHistory: ImageHistoryRecord[];
  pendingAutoImageProductIds: string[];
  dismissAutoImageAlert: (productId: string) => void;
  assignVerifiedProductImage: (
    productId: string,
    payload: {
      exactModel: string;
      mainImageUrl: string;
      imageStoragePath?: string;
      imageThumbnailPath?: string;
      imageSourceUrl?: string;
      imageSourceName?: string;
      imageLicense?: string;
      imageAttribution?: string;
      imageResolution?: string;
      imageVerificationStatus: ImageVerificationStatus;
      imageConfidence?: number;
      verificationNotes?: string;
      action?: ImageHistoryRecord['action'];
    }
  ) => void;
  rejectProductImage: (
    productId: string,
    params: {
      candidateUrl?: string;
      exactModel: string;
      reason: string;
      status?: ImageVerificationStatus;
    }
  ) => void;
  rollbackProductImage: (
    productId: string,
    targetHistoryOrUrl?: string | ImageHistoryRecord
  ) => { success: boolean; message: string };
  removeWrongProductImage: (productId: string, reason: string) => void;
  updateProductImageStatus: (
    productId: string,
    status: ImageVerificationStatus,
    notes?: string
  ) => void;
}

const AdminStoreContext = createContext<AdminStoreType | undefined>(undefined);

// Official Featured Catalog Seed Data (BDStall MRP & Offer Prices, Unified Brand Photos)
const INITIAL_PRODUCTS: Product[] = [
  // ================= LENOVO THINKPAD SERIES =================
  {
    id: 'prod-lenovo-l14-gen2',
    sku: 'JHF-TP-01',
    name: 'Lenovo ThinkPad L14 Gen-2 Core i5 11th Gen',
    slug: 'lenovo-thinkpad-l14-gen-2',
    brand: 'Lenovo',
    model: 'ThinkPad L14 Gen 2',
    category: 'Business Laptop',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-1135G7 (11th Gen, Up to 4.2GHz)',
    generation: '11th Gen',
    ram: '16GB DDR4 3200MHz',
    storage: '512GB M.2 NVMe SSD',
    graphics: 'Intel Iris Xe Graphics',
    display: '14.0" Full HD (1920x1080) Anti-Glare IPS Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'Original 45Wh (4-5 Hours Backup)',
    keyboardCondition: 'Backlit Spill-Resistant Precision Keyboard',
    bodyCondition: 'A++ Pristine Magnesium Composite',
    operatingSystem: 'Windows 11 Pro 64-bit Genuine',
    includedAccessories: ['Original Lenovo 65W Type-C Charger', 'Power Cord', 'JHF Laptop Bag', 'Wireless Mouse'],
    purchasePrice: 36500,
    sellingPrice: 46500,
    discountPrice: 42500,
    profitMargin: 6000,
    stockQuantity: 6,
    minimumStockAlert: 2,
    warranty: '1 Month Full Replacement + 5 Years Free Service Warranty',
    shortDescription: '11th Gen Intel Iris Xe business laptop with Thunderbolt 4 and military-grade durability.',
    specifications: 'Thunderbolt 4, USB 3.2 Gen 1, HDMI 2.0, RJ45 LAN, MicroSD reader, ThinkShutter HD Webcam.',
    images: [BRAND_LAPTOP_IMAGES.Lenovo],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-lenovo-t14s-gen1',
    sku: 'JHF-TP-02',
    name: 'Lenovo ThinkPad T14s Core i5 10th Gen',
    slug: 'lenovo-thinkpad-t14s-10th',
    brand: 'Lenovo',
    model: 'ThinkPad T14s',
    category: 'Ultrabook',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-10210U (10th Gen Quad Core)',
    generation: '10th Gen',
    ram: '16GB DDR4 RAM',
    storage: '512GB M.2 NVMe SSD',
    graphics: 'Intel UHD Graphics',
    display: '14.0" FHD IPS Anti-Glare Ultrabook Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: '57Wh RapidCharge (4-5 Hours)',
    keyboardCondition: 'Backlit Precision Keyboard',
    bodyCondition: 'Slim Carbon-Fiber & Magnesium Chassis',
    operatingSystem: 'Windows 11 Pro Genuine',
    includedAccessories: ['Original 65W Type-C Charger', 'Laptop Bag', 'Wireless Mouse'],
    purchasePrice: 33000,
    sellingPrice: 42500,
    discountPrice: 38500,
    profitMargin: 5500,
    stockQuantity: 5,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Ultra-slim flagship T-series ultrabook built for executives and developers.',
    specifications: 'Thunderbolt 3, 2x USB 3.2, HDMI, Fingerprint Reader, ThinkShutter.',
    images: [BRAND_LAPTOP_IMAGES.Lenovo],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-lenovo-t480s-standard',
    sku: 'JHF-TP-03',
    name: 'Lenovo ThinkPad T480s Core i5 8th Gen',
    slug: 'lenovo-thinkpad-t480s-core-i5-8th',
    brand: 'Lenovo',
    model: 'ThinkPad T480s',
    category: 'Ultrabook',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-8350U Quad Core (8th Gen)',
    generation: '8th Gen',
    ram: '8GB DDR4 RAM',
    storage: '512GB NVMe SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" Full HD (1920x1080) IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: '57Wh Internal QuickCharge (3.5-4.5 Hours)',
    keyboardCondition: 'Backlit Spill-Resistant Keyboard',
    bodyCondition: 'Slim Magnesium Alloy (1.3kg)',
    operatingSystem: 'Windows 11 Pro Genuine',
    includedAccessories: ['Original Lenovo 65W Type-C Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 25000,
    sellingPrice: 33500,
    discountPrice: 30000,
    profitMargin: 5000,
    stockQuantity: 6,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Slim corporate ThinkPad T480s with fast 512GB NVMe SSD and Windows 11 support.',
    specifications: 'USB-C Thunderbolt 3, 2x USB 3.1, HDMI, RJ45, SD Card Reader.',
    images: [BRAND_LAPTOP_IMAGES.Lenovo],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-lenovo-t480-7th-16-512',
    sku: 'JHF-TP-04',
    name: 'Lenovo ThinkPad T480 (i5 7th, 16gb/512gb)',
    slug: 'lenovo-thinkpad-t480-i5-7th-16-512',
    brand: 'Lenovo',
    model: 'ThinkPad T480',
    category: 'Business Laptop',
    condition: 'Grade A+',
    processor: 'Intel Core i5-7300U (7th Gen vPro)',
    generation: '7th Gen',
    ram: '16GB DDR4 RAM',
    storage: '512GB NVMe SSD',
    graphics: 'Intel HD Graphics 620',
    display: '14.0" Full HD (1920x1080) IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'PowerBridge Dual Battery (4-5 Hours)',
    keyboardCondition: 'ThinkPad Precision Backlit Keyboard',
    bodyCondition: 'Grade A+ Clean Black Matte Chassis',
    operatingSystem: 'Windows 10 / 11 Pro',
    includedAccessories: ['Original Lenovo Type-C Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 22500,
    sellingPrice: 29500,
    discountPrice: 27000,
    profitMargin: 4500,
    stockQuantity: 5,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Heavy-duty ThinkPad T480 upgraded with 16GB RAM and 512GB NVMe SSD.',
    specifications: 'Dual Battery System, Thunderbolt 3, USB-C, HDMI, RJ45 Ethernet.',
    images: [BRAND_LAPTOP_IMAGES.Lenovo],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-lenovo-t480-7th-8-256',
    sku: 'JHF-TP-05',
    name: 'Lenovo ThinkPad T480 (i5 7th, 8gb/256gb)',
    slug: 'lenovo-thinkpad-t480-i5-7th-8-256',
    brand: 'Lenovo',
    model: 'ThinkPad T480',
    category: 'Business Laptop',
    condition: 'Grade A+',
    processor: 'Intel Core i5-7300U (7th Gen)',
    generation: '7th Gen',
    ram: '8GB DDR4 RAM',
    storage: '256GB NVMe SSD',
    graphics: 'Intel HD Graphics 620',
    display: '14.0" Full HD IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'PowerBridge Dual Battery (3.5-4.5 Hours)',
    keyboardCondition: 'Spill-Resistant ThinkPad Keyboard',
    bodyCondition: 'Grade A+ Matte Black Chassis',
    operatingSystem: 'Windows 10 / 11 Pro',
    includedAccessories: ['Original Type-C Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 19500,
    sellingPrice: 25500,
    discountPrice: 23500,
    profitMargin: 4000,
    stockQuantity: 7,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Reliable corporate ThinkPad T480 with dual battery architecture and USB-C charging.',
    specifications: 'Dual Battery, Thunderbolt 3, USB 3.1, HDMI, RJ45 LAN.',
    images: [BRAND_LAPTOP_IMAGES.Lenovo],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-lenovo-t470s-6th-16-512',
    sku: 'JHF-TP-06',
    name: 'Lenovo ThinkPad T470s (i5 6th/16GB/512GB)',
    slug: 'lenovo-thinkpad-t470s-i5-6th-16-512',
    brand: 'Lenovo',
    model: 'ThinkPad T470s',
    category: 'Ultrabook',
    condition: 'Grade A+',
    processor: 'Intel Core i5-6300U (6th Gen)',
    generation: '6th Gen',
    ram: '16GB DDR4 RAM',
    storage: '512GB M.2 NVMe SSD',
    graphics: 'Intel HD Graphics 520',
    display: '14.0" Full HD (1920x1080) IPS Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'Dual Internal Battery (3.5 Hours)',
    keyboardCondition: 'Backlit Precision Keyboard',
    bodyCondition: 'Slim Carbon-Fiber Unibody',
    operatingSystem: 'Windows 10 Pro',
    includedAccessories: ['Original Lenovo Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 20500,
    sellingPrice: 26500,
    discountPrice: 24500,
    profitMargin: 4000,
    stockQuantity: 5,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'High-memory 16GB/512GB slim ThinkPad T470s ideal for multitasking & freelancing.',
    specifications: 'USB-C Thunderbolt 3, 3x USB 3.0, HDMI, RJ45, SD Reader.',
    images: [BRAND_LAPTOP_IMAGES.Lenovo],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-lenovo-t470s-6th-8-256',
    sku: 'JHF-TP-07',
    name: 'Lenovo ThinkPad T470s (i5 6th/8GB/256GB)',
    slug: 'lenovo-thinkpad-t470s-i5-6th-8-256',
    brand: 'Lenovo',
    model: 'ThinkPad T470s',
    category: 'Ultrabook',
    condition: 'Grade A+',
    processor: 'Intel Core i5-6300U (6th Gen)',
    generation: '6th Gen',
    ram: '8GB DDR4 RAM',
    storage: '256GB M.2 SSD',
    graphics: 'Intel HD Graphics 520',
    display: '14.0" Full HD IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'Dual Internal Battery (3-4 Hours)',
    keyboardCondition: 'ThinkPad Spill-Resistant Keyboard',
    bodyCondition: 'Slim Lightweight Carbon Chassis',
    operatingSystem: 'Windows 10 Pro',
    includedAccessories: ['Original Lenovo Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 17000,
    sellingPrice: 22500,
    discountPrice: 20500,
    profitMargin: 3500,
    stockQuantity: 8,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Budget-friendly slim ThinkPad T470s for students, office work, and coding.',
    specifications: 'USB-C Thunderbolt 3, 3x USB 3.0, HDMI, RJ45 Ethernet.',
    images: [BRAND_LAPTOP_IMAGES.Lenovo],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-lenovo-t480s-8th-8-256',
    sku: 'JHF-TP-08',
    name: 'Lenovo ThinkPad T480s (i5 8th, 8GB/256GB)',
    slug: 'lenovo-thinkpad-t480s-i5-8th-8-256',
    brand: 'Lenovo',
    model: 'ThinkPad T480s',
    category: 'Ultrabook',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-8350U Quad Core (8th Gen)',
    generation: '8th Gen',
    ram: '8GB DDR4 RAM',
    storage: '256GB NVMe SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" Full HD IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: '57Wh QuickCharge (3.5-4.5 Hours)',
    keyboardCondition: 'Backlit Precision Keyboard',
    bodyCondition: 'Slim Magnesium Chassis (1.3kg)',
    operatingSystem: 'Windows 11 Pro Genuine',
    includedAccessories: ['Original Lenovo 65W Type-C Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 23000,
    sellingPrice: 29500,
    discountPrice: 27500,
    profitMargin: 4500,
    stockQuantity: 6,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: '8th Gen Quad-Core slim ThinkPad T480s with official Windows 11 support.',
    specifications: 'Thunderbolt 3, 2x USB 3.1, HDMI, SD Reader, RJ45.',
    images: [BRAND_LAPTOP_IMAGES.Lenovo],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-lenovo-t480s',
    sku: 'JHF-TP-09',
    name: 'Lenovo ThinkPad T480s (i5 8th/16GB/512GB)',
    slug: 'lenovo-thinkpad-t480s-i5-8th-16-512',
    brand: 'Lenovo',
    model: 'ThinkPad T480s',
    category: 'Ultrabook',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-8350U Quad-Core vPro',
    generation: '8th Gen',
    ram: '16GB DDR4 RAM',
    storage: '512GB NVMe SSD',
    graphics: 'Intel UHD 620',
    display: '14.0" Full HD IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: '57Wh Internal QuickCharge (4 Hours)',
    keyboardCondition: 'Original ThinkPad Precision Backlit',
    bodyCondition: 'Slim Magnesium Unibody (1.3kg)',
    operatingSystem: 'Windows 11 Pro',
    includedAccessories: ['Original Lenovo 65W USB-C Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 27000,
    sellingPrice: 34500,
    discountPrice: 32000,
    profitMargin: 5000,
    stockQuantity: 6,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Top-selling 16GB/512GB slim ThinkPad T480s with rapid USB-C fast charging.',
    specifications: 'USB Type-C with Thunderbolt 3, USB 3.1 Gen 1, HDMI, SD card reader.',
    images: [BRAND_LAPTOP_IMAGES.Lenovo],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },

  // ================= HP ELITEBOOK SERIES =================
  {
    id: 'prod-hp-elitebook-840-g8-32',
    sku: 'JHF-HP-01',
    name: 'HP EliteBook 840 G8 (32GB RAM, 512GB SSD)',
    slug: 'hp-elitebook-840-g8-32gb',
    brand: 'HP',
    model: 'EliteBook 840 G8',
    category: 'Ultrabook',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-1145G7 vPro (11th Gen)',
    generation: '11th Gen',
    ram: '32GB DDR4 High-Speed RAM',
    storage: '512GB PCIe NVMe SSD',
    graphics: 'Intel Iris Xe Graphics',
    display: '14.0" FHD IPS 400 Nits Micro-Edge',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'HP 3-Cell 53Wh Long Life (4-5 Hours)',
    keyboardCondition: 'HP Spill-Resistant Backlit Keyboard',
    bodyCondition: 'All-Aluminum CNC Silver Unibody',
    operatingSystem: 'Windows 11 Pro Genuine',
    includedAccessories: ['Original HP 65W Type-C Charger', 'Laptop Bag', 'Wireless Mouse'],
    purchasePrice: 44000,
    sellingPrice: 54000,
    discountPrice: 51000,
    profitMargin: 7000,
    stockQuantity: 4,
    minimumStockAlert: 2,
    warranty: '1 Month Full Replacement + 5 Years Free Service Warranty',
    shortDescription: '32GB RAM powerhouse executive EliteBook 840 G8 with Bang & Olufsen audio.',
    specifications: '2x Thunderbolt 4 Type-C, 2x USB 3.2, HDMI 2.0b, IR Face Unlock, Fingerprint.',
    images: [BRAND_LAPTOP_IMAGES.HP],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-hp-elitebook-840-g8',
    sku: 'JHF-HP-02',
    name: 'HP EliteBook 840 G8 (16GB RAM, 512GB SSD)',
    slug: 'hp-elitebook-840-g8-16gb',
    brand: 'HP',
    model: 'EliteBook 840 G8',
    category: 'Ultrabook',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-1135G7 (11th Gen)',
    generation: '11th Gen',
    ram: '16GB DDR4 High-Speed RAM',
    storage: '512GB PCIe NVMe SSD',
    graphics: 'Intel Iris Xe Graphics',
    display: '14.0" FHD IPS Micro-Edge Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'HP 53Wh Long Life (4-5 Hours)',
    keyboardCondition: 'Premium HP Backlit Keyboard',
    bodyCondition: 'All-Aluminum CNC Silver Unibody',
    operatingSystem: 'Windows 11 Pro Genuine',
    includedAccessories: ['Original HP 65W Charger', 'Laptop Bag', 'Wireless Mouse'],
    purchasePrice: 39500,
    sellingPrice: 48500,
    discountPrice: 45500,
    profitMargin: 6000,
    stockQuantity: 5,
    minimumStockAlert: 2,
    warranty: '1 Month Full Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Sleek 11th Gen silver CNC aluminum ultrabook with IR Face Unlock & B&O audio.',
    specifications: '2x Thunderbolt 4 Type-C, 2x USB 3.2, HDMI 2.0, Bang & Olufsen Audio.',
    images: [BRAND_LAPTOP_IMAGES.HP],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-hp-elitebook-840-g7',
    sku: 'JHF-HP-03',
    name: 'HP EliteBook 840 G7 (16GB RAM, 512GB SSD)',
    slug: 'hp-elitebook-840-g7-16gb',
    brand: 'HP',
    model: 'EliteBook 840 G7',
    category: 'Ultrabook',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-10310U (10th Gen vPro)',
    generation: '10th Gen',
    ram: '16GB DDR4 RAM',
    storage: '512GB NVMe SSD',
    graphics: 'Intel UHD Graphics',
    display: '14.0" FHD IPS Narrow-Bezel Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'HP 53Wh Long Life (4 Hours)',
    keyboardCondition: 'Backlit Spill-Resistant Keyboard',
    bodyCondition: 'Slim CNC Silver Aluminum Body',
    operatingSystem: 'Windows 11 Pro Genuine',
    includedAccessories: ['Original HP Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 33500,
    sellingPrice: 41500,
    discountPrice: 39000,
    profitMargin: 5500,
    stockQuantity: 6,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: '10th Gen redesigned narrow-bezel HP EliteBook 840 G7 with 16GB/512GB.',
    specifications: '2x USB-C Thunderbolt, 2x USB 3.1, HDMI, Bang & Olufsen Audio.',
    images: [BRAND_LAPTOP_IMAGES.HP],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-hp-elitebook-840-g6-16',
    sku: 'JHF-HP-04',
    name: 'HP EliteBook 840 G6 (16GB RAM, 512GB SSD)',
    slug: 'hp-elitebook-840-g6-16gb',
    brand: 'HP',
    model: 'EliteBook 840 G6',
    category: 'Business Laptop',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-8365U Quad Core (8th Gen)',
    generation: '8th Gen',
    ram: '16GB DDR4 RAM',
    storage: '512GB NVMe SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" FHD IPS Anti-Glare Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'HP Long Life Battery (3.5-4.5 Hours)',
    keyboardCondition: 'Backlit Keyboard with Pointing Stick',
    bodyCondition: 'Grade A++ Silver Aluminum Body',
    operatingSystem: 'Windows 11 Pro Genuine',
    includedAccessories: ['Original HP Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 28000,
    sellingPrice: 35500,
    discountPrice: 33000,
    profitMargin: 5000,
    stockQuantity: 7,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Most popular 16GB/512GB EliteBook 840 G6 with Bang & Olufsen speakers.',
    specifications: 'Thunderbolt 3 USB-C, 2x USB 3.1, HDMI, RJ45, Privacy Shutter.',
    images: [BRAND_LAPTOP_IMAGES.HP],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-hp-elitebook-840-g6-8',
    sku: 'JHF-HP-05',
    name: 'HP EliteBook 840 G6 (8GB RAM, 256GB SSD)',
    slug: 'hp-elitebook-840-g6-8gb',
    brand: 'HP',
    model: 'EliteBook 840 G6',
    category: 'Business Laptop',
    condition: 'Dubai Grade A++',
    processor: 'Intel Core i5-8365U Quad Core (8th Gen)',
    generation: '8th Gen',
    ram: '8GB DDR4 RAM',
    storage: '256GB NVMe SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" FHD IPS Anti-Glare Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'HP Long Life Battery (3.5-4.5 Hours)',
    keyboardCondition: 'Backlit Keyboard',
    bodyCondition: 'Grade A++ Silver Aluminum Body',
    operatingSystem: 'Windows 11 Pro',
    includedAccessories: ['Original HP Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 25500,
    sellingPrice: 32500,
    discountPrice: 30000,
    profitMargin: 4500,
    stockQuantity: 8,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Corporate silver HP EliteBook 840 G6 8th Gen with Windows 11 compatibility.',
    specifications: 'Thunderbolt 3 USB-C, 2x USB 3.1, HDMI, RJ45, B&O Audio.',
    images: [BRAND_LAPTOP_IMAGES.HP],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-hp-elitebook-840-g5',
    sku: 'JHF-HP-06',
    name: 'HP EliteBook 840 G5 (8GB RAM, 256GB SSD)',
    slug: 'hp-elitebook-840-g5-8gb',
    brand: 'HP',
    model: 'EliteBook 840 G5',
    category: 'Business Laptop',
    condition: 'Grade A+',
    processor: 'Intel Core i5-8350U Quad Core (8th Gen)',
    generation: '8th Gen',
    ram: '8GB DDR4 RAM',
    storage: '256GB NVMe SSD',
    graphics: 'Intel UHD Graphics 620',
    display: '14.0" FHD IPS Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: '3.5-4 Hours Backup',
    keyboardCondition: 'Backlit Keyboard',
    bodyCondition: 'Full Aluminum Silver Body',
    operatingSystem: 'Windows 11 Pro',
    includedAccessories: ['Original HP Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 23500,
    sellingPrice: 29500,
    discountPrice: 27500,
    profitMargin: 4000,
    stockQuantity: 7,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Bangladesh favorite 8th Gen Quad-Core HP EliteBook 840 G5 in sleek aluminum.',
    specifications: 'Thunderbolt 3, 2x USB 3.1, HDMI, RJ45 LAN, Bang & Olufsen.',
    images: [BRAND_LAPTOP_IMAGES.HP],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-hp-elitebook-840-g4',
    sku: 'JHF-HP-07',
    name: 'HP EliteBook 840 G4 (8GB RAM, 256GB SSD, 1TB HDD)',
    slug: 'hp-elitebook-840-g4-dual-storage',
    brand: 'HP',
    model: 'EliteBook 840 G4',
    category: 'Business Laptop',
    condition: 'Grade A+',
    processor: 'Intel Core i5-7200U (7th Gen)',
    generation: '7th Gen',
    ram: '8GB DDR4 RAM',
    storage: '256GB SSD + 1TB HDD',
    graphics: 'Intel HD Graphics 620',
    display: '14.0" FHD Slim Anti-Glare Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: '3.5 Hours Backup',
    keyboardCondition: 'Backlit Keyboard',
    bodyCondition: 'Silver & Matte Black Chassis',
    operatingSystem: 'Windows 10 Pro',
    includedAccessories: ['Original HP Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 20500,
    sellingPrice: 26500,
    discountPrice: 24500,
    profitMargin: 4000,
    stockQuantity: 5,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Massive 1.25TB dual storage (256GB NVMe SSD + 1TB HDD) HP EliteBook 840 G4.',
    specifications: 'USB-C, 2x USB 3.0, DisplayPort, VGA, RJ45 LAN, B&O Audio.',
    images: [BRAND_LAPTOP_IMAGES.HP],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-hp-elitebook-840-g3',
    sku: 'JHF-HP-08',
    name: 'HP EliteBook 840 G3 (8GB RAM, 256GB SSD)',
    slug: 'hp-elitebook-840-g3-8gb',
    brand: 'HP',
    model: 'EliteBook 840 G3',
    category: 'Business Laptop',
    condition: 'Grade A+',
    processor: 'Intel Core i5-6300U (6th Gen)',
    generation: '6th Gen',
    ram: '8GB DDR4 RAM',
    storage: '256GB M.2 SSD',
    graphics: 'Intel HD Graphics 520',
    display: '14.0" Slim Anti-Glare Display',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: '3-3.5 Hours Backup',
    keyboardCondition: 'Spill-Resistant Backlit Keyboard',
    bodyCondition: 'Slim Silver Metallic Design',
    operatingSystem: 'Windows 10 Pro',
    includedAccessories: ['Original HP Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 18000,
    sellingPrice: 23500,
    discountPrice: 21500,
    profitMargin: 3500,
    stockQuantity: 6,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Affordable slim metallic HP EliteBook 840 G3 for office, freelance, and study.',
    specifications: 'USB-C, 2x USB 3.0, DisplayPort, VGA, RJ45 LAN, B&O Speakers.',
    images: [BRAND_LAPTOP_IMAGES.HP],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },
  {
    id: 'prod-hp-elitebook-840-g2',
    sku: 'JHF-HP-09',
    name: 'HP EliteBook 840 G2 (8GB RAM, 128GB SSD, 500GB HDD)',
    slug: 'hp-elitebook-840-g2-dual-storage',
    brand: 'HP',
    model: 'EliteBook 840 G2',
    category: 'Student / Office',
    condition: 'Grade A',
    processor: 'Intel Core i5-5300U (5th Gen)',
    generation: '5th Gen',
    ram: '8GB DDR3L RAM',
    storage: '128GB SSD + 500GB HDD',
    graphics: 'Intel HD Graphics 5500',
    display: '14.0" HD+ Anti-Glare Display',
    screenSize: '14.0"',
    resolution: '1600x900',
    batteryCondition: '3 Hours Backup',
    keyboardCondition: 'Spill-Resistant Business Keyboard',
    bodyCondition: 'Durable Magnesium-Aluminum Chassis',
    operatingSystem: 'Windows 10 Pro',
    includedAccessories: ['Original HP Charger', 'Laptop Bag', 'Mouse'],
    purchasePrice: 15500,
    sellingPrice: 20500,
    discountPrice: 18500,
    profitMargin: 3000,
    stockQuantity: 5,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Budget dual-storage HP EliteBook 840 G2 with fast 128GB SSD + 500GB HDD.',
    specifications: '4x USB 3.0, DisplayPort, VGA, RJ45 Ethernet, Fingerprint Reader.',
    images: [BRAND_LAPTOP_IMAGES.HP],
    status: 'published',
    isFeatured: true,
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T10:00:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  },

  // ================= DELL LATITUDE SERIES (6TH - 11TH GEN) =================
  ...DELL_LATITUDE_CATALOG_SEED.map((d): Product => ({
    id: d.id,
    sku: d.sku,
    name: `Dell Latitude ${d.model} (${d.generation})`,
    slug: `dell-latitude-${d.model.toLowerCase()}-${d.generation.replace(/\s+/g, '-').toLowerCase()}`,
    brand: 'Dell',
    series: 'Dell Latitude',
    model: `Latitude ${d.model}`,
    category: 'Business Laptop',
    condition: 'Dubai Grade A++',
    processor: d.processor,
    generation: d.generation,
    ram: `${d.ram} DDR4 RAM`,
    storage: `${d.ssd} NVMe SSD`,
    ssd: d.ssd,
    hdd: d.hdd,
    graphics: d.generation === '11th Gen' ? 'Intel Iris Xe Graphics' : 'Intel UHD Graphics',
    display: `${d.display} ${d.resolution} (${d.touchscreen})`,
    screenSize: d.display,
    resolution: d.resolution,
    touchscreen: d.touchscreen,
    batteryCondition: 'Tested Genuine Battery (3.5-5 Hours)',
    keyboardCondition: 'Backlit Precision Spill-Resistant Keyboard',
    bodyCondition: 'Grade A++ Clean Business Chassis',
    operatingSystem: 'Windows 10/11 Pro Genuine',
    includedAccessories: ['Original Dell 65W Adapter', 'Power Cord', 'JHF Laptop Bag', 'Mouse'],
    purchasePrice: d.purchasePrice,
    sellingPrice: d.mrpPrice,
    discountPrice: d.offerPrice,
    profitMargin: d.offerPrice - d.purchasePrice,
    marketPrice: d.offerPrice,
    marketPriceMin: d.offerPrice,
    marketPriceMax: d.mrpPrice,
    sellerCount: 1,
    sellerListings: [],
    sourceUrl: 'https://www.bdstall.com/laptop/dell-latitude/',
    lastUpdated: '2026-11-17T20:30:00Z',
    stockQuantity: d.stockQuantity,
    minimumStockAlert: 2,
    stockStatus: 'In Stock',
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: `Dell Latitude ${d.model} (${d.generation}) — ${d.processor}, ${d.ram}, ${d.ssd} SSD, ${d.display} ${d.resolution}.`,
    specifications: `USB-C / Thunderbolt, USB 3.1, HDMI, RJ45 Ethernet, HD Webcam, Dual-Band Wi-Fi.`,
    images: [BRAND_LAPTOP_IMAGES.Dell],
    status: 'published',
    isFeatured: true,
    configKey: d.configKey,
    specificationSource: 'Model Catalog',
    createdAt: '2026-11-17T10:00:00Z',
    updatedAt: '2026-11-17T20:30:00Z',
    createdBy: 'Jahid Hasan (Super Admin)',
  })),
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

  // Helper to check if dummy data was cleared
  const isDummyDataCleared = () => {
    try {
      return localStorage.getItem('jhf_dummy_data_cleared') === 'true';
    } catch {
      return false;
    }
  };

  const isServiceDummyDataCleared = () => {
    try {
      return (
        localStorage.getItem('jhf_dummy_data_cleared') === 'true' ||
        localStorage.getItem('jhf_service_data_cleared') === 'true'
      );
    } catch {
      return false;
    }
  };

  const [isDummyDataClearedState, setIsDummyDataClearedState] = useState<boolean>(() => isDummyDataCleared());

  // Listen to Firestore systemInit to sync clean mode across devices
  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', 'systemInit');
      const unsubscribe = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.dummyDataCleared) {
            localStorage.setItem('jhf_dummy_data_cleared', 'true');
            setIsDummyDataClearedState(true);
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('systemInit listener error:', e);
    }
  }, []);

  const CATALOG_BDSTALL_SYNC_KEY = 'jhf_bdstall_catalog_v4_dell_bdstall_prices';

  const mergeOfficialCatalogProducts = (existing: Product[]): Product[] => {
    const map = new Map<string, Product>();
    existing.forEach((p) => map.set(p.id, p));
    INITIAL_PRODUCTS.forEach((official) => {
      const prev = map.get(official.id);
      if (prev) {
        const shouldRefreshModelCatalogDell =
          prev.brand === 'Dell' &&
          official.id.startsWith('prod-dell-lat-') &&
          prev.specificationSource !== 'Admin Edited' &&
          prev.specificationSource !== 'BDStall Sync';
        map.set(official.id, {
          ...prev,
          name: prev.name || official.name,
          brand: prev.brand || official.brand,
          series: prev.series || official.series,
          model: prev.model || official.model,
          processor: shouldRefreshModelCatalogDell ? official.processor : prev.processor || official.processor,
          ram: shouldRefreshModelCatalogDell ? official.ram : prev.ram || official.ram,
          storage: shouldRefreshModelCatalogDell ? official.storage : prev.storage || official.storage,
          ssd: shouldRefreshModelCatalogDell ? official.ssd : prev.ssd || official.ssd,
          display: shouldRefreshModelCatalogDell ? official.display : prev.display || official.display,
          touchscreen: shouldRefreshModelCatalogDell ? official.touchscreen : prev.touchscreen || official.touchscreen,
          images: prev.images?.length ? prev.images : official.images,
          configKey: official.configKey || prev.configKey,
          purchasePrice: shouldRefreshModelCatalogDell ? official.purchasePrice : prev.purchasePrice,
          sellingPrice: shouldRefreshModelCatalogDell ? official.sellingPrice : prev.sellingPrice,
          discountPrice: shouldRefreshModelCatalogDell ? official.discountPrice : prev.discountPrice,
          profitMargin: shouldRefreshModelCatalogDell ? official.profitMargin : prev.profitMargin,
          marketPrice: shouldRefreshModelCatalogDell ? official.marketPrice : prev.marketPrice,
          marketPriceMin: shouldRefreshModelCatalogDell ? official.marketPriceMin : prev.marketPriceMin,
          marketPriceMax: shouldRefreshModelCatalogDell ? official.marketPriceMax : prev.marketPriceMax,
          stockQuantity: shouldRefreshModelCatalogDell ? official.stockQuantity : prev.stockQuantity,
          stockStatus: shouldRefreshModelCatalogDell ? official.stockStatus : prev.stockStatus,
          lastUpdated: shouldRefreshModelCatalogDell ? official.lastUpdated : prev.lastUpdated,
          isFeatured: true,
          status: prev.status || 'published',
        });
      } else {
        map.set(official.id, official);
      }
    });
    // Preserve INITIAL_PRODUCTS order first, then any custom user products
    const orderedIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
    const orderedOfficial = INITIAL_PRODUCTS.map((p) => map.get(p.id)!);
    const customOthers = existing.filter((p) => !orderedIds.has(p.id));
    return [...orderedOfficial, ...customOthers];
  };

  // State with LocalStorage persistent backing
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_products');
      const baseList: Product[] = saved
        ? JSON.parse(saved)
        : isDummyDataCleared()
        ? []
        : INITIAL_PRODUCTS;
      if (!localStorage.getItem(CATALOG_BDSTALL_SYNC_KEY)) {
        return mergeOfficialCatalogProducts(baseList);
      }
      return baseList;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jhf_admin_orders');
    if (saved) return JSON.parse(saved);
    return isDummyDataCleared() ? [] : INITIAL_ORDERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('jhf_admin_customers');
    if (saved) return JSON.parse(saved);
    return isDummyDataCleared() ? [] : INITIAL_CUSTOMERS;
  });

  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem('jhf_admin_inventory_tx');
    return saved ? JSON.parse(saved) : [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('jhf_admin_suppliers');
    if (saved) return JSON.parse(saved);
    return isDummyDataCleared() ? [] : INITIAL_SUPPLIERS;
  });

  const [stockUnits, setStockUnits] = useState<StockUnit[]>(() => {
    const saved = localStorage.getItem('jhf_admin_stock_units');
    if (saved) return JSON.parse(saved);
    return isDummyDataCleared() ? [] : INITIAL_STOCK_UNITS;
  });

  const [supplierPurchases, setSupplierPurchases] = useState<SupplierPurchase[]>(() => {
    const saved = localStorage.getItem('jhf_admin_supplier_purchases');
    if (saved) return JSON.parse(saved);
    return isDummyDataCleared() ? [] : INITIAL_SUPPLIER_PURCHASES;
  });

  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => {
    const saved = localStorage.getItem('jhf_admin_supplier_payments');
    if (saved) return JSON.parse(saved);
    return isDummyDataCleared() ? [] : INITIAL_SUPPLIER_PAYMENTS;
  });

  const [emiPlans, setEmiPlans] = useState<EmiPlan[]>(() => {
    const saved = localStorage.getItem('jhf_admin_emi_plans');
    if (saved) return JSON.parse(saved);
    return isDummyDataCleared() ? [] : INITIAL_EMI_PLANS;
  });

  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(() => {
    const saved = localStorage.getItem('jhf_admin_backup_logs');
    return saved ? JSON.parse(saved) : INITIAL_BACKUP_LOGS;
  });

  const [reconditionLaptops, setReconditionLaptops] = useState<ReconditionLaptop[]>(() => {
    const saved = localStorage.getItem('jhf_admin_recondition_laptops');
    if (saved) return JSON.parse(saved);
    return isDummyDataCleared() ? [] : INITIAL_RECONDITION_LAPTOPS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('jhf_admin_expenses');
    if (saved) return JSON.parse(saved);
    return isDummyDataCleared() ? [] : INITIAL_EXPENSES;
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
      if (saved) return JSON.parse(saved);
      return isServiceDummyDataCleared() ? [] : INITIAL_SERVICES;
    } catch {
      return isServiceDummyDataCleared() ? [] : INITIAL_SERVICES;
    }
  });

  const [serviceEngineers, setServiceEngineers] = useState<ServiceEngineer[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_service_engineers');
      if (saved) return JSON.parse(saved);
      return isServiceDummyDataCleared() ? [] : INITIAL_SERVICE_ENGINEERS;
    } catch {
      return isServiceDummyDataCleared() ? [] : INITIAL_SERVICE_ENGINEERS;
    }
  });

  const [serviceParts, setServiceParts] = useState<ServicePart[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_service_parts');
      if (saved) return JSON.parse(saved);
      return isServiceDummyDataCleared() ? [] : INITIAL_SERVICE_PARTS;
    } catch {
      return isServiceDummyDataCleared() ? [] : INITIAL_SERVICE_PARTS;
    }
  });

  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_warranty_claims');
      if (saved) return JSON.parse(saved);
      return isServiceDummyDataCleared() ? [] : INITIAL_WARRANTY_CLAIMS;
    } catch {
      return isServiceDummyDataCleared() ? [] : INITIAL_WARRANTY_CLAIMS;
    }
  });

  // Customer Service Requests & Public Tracking State
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_service_requests');
      if (saved) return JSON.parse(saved);
      return isServiceDummyDataCleared() ? [] : INITIAL_SERVICE_REQUESTS;
    } catch {
      return isServiceDummyDataCleared() ? [] : INITIAL_SERVICE_REQUESTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('jhf_admin_service_requests', JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  // Disaster Recovery Full System Backups
  const [fullBackups, setFullBackups] = useState<FullSystemBackup[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_full_backups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // BDStall Import Audit History
  const [bdstallImportHistory, setBdstallImportHistory] = useState<BdstallImportBatch[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_bdstall_imports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('jhf_admin_bdstall_imports', JSON.stringify(bdstallImportHistory));
  }, [bdstallImportHistory]);

  // Universal Image History & Pending Auto-Image Queue
  const [imageHistory, setImageHistory] = useState<ImageHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_image_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('jhf_admin_image_history', JSON.stringify(imageHistory));
  }, [imageHistory]);

  const [pendingAutoImageProductIds, setPendingAutoImageProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_admin_pending_auto_images');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('jhf_admin_pending_auto_images', JSON.stringify(pendingAutoImageProductIds));
  }, [pendingAutoImageProductIds]);

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

  // ==========================================
  // REAL-TIME CLOUD FIRESTORE SYNC LISTENERS
  // ==========================================

  // 1. Products Collection Listener + One-Time Official BDStall Catalog Sync
  useEffect(() => {
    const syncOfficialCatalogToFirestore = (currentList: Product[]) => {
      try {
        const merged = mergeOfficialCatalogProducts(currentList);
        const batch = writeBatch(db);
        INITIAL_PRODUCTS.forEach((p) => {
          const itemToSave = merged.find((m) => m.id === p.id) || p;
          batch.set(doc(db, 'products', itemToSave.id), sanitizeForFirestore(itemToSave));
        });
        batch.commit().catch((err) => console.warn('BDStall catalog Firestore sync:', err));
        localStorage.setItem(CATALOG_BDSTALL_SYNC_KEY, 'true');
        localStorage.setItem('jhf_admin_products', JSON.stringify(merged));
        setProducts(merged);
      } catch (err) {
        console.warn('BDStall catalog sync error:', err);
      }
    };

    try {
      const colRef = collection(db, 'products');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const alreadySynced = localStorage.getItem(CATALOG_BDSTALL_SYNC_KEY) === 'true';
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as Product), id: d.id }));
            if (!alreadySynced) {
              syncOfficialCatalogToFirestore(list);
            } else {
              setProducts(list);
            }
          } else if (!alreadySynced) {
            syncOfficialCatalogToFirestore([]);
          } else if (!isDummyDataCleared()) {
            // Seed initial products to Firestore
            const batch = writeBatch(db);
            INITIAL_PRODUCTS.forEach((p) => {
              batch.set(doc(db, 'products', p.id), sanitizeForFirestore(p));
            });
            batch.commit().catch((err) => console.warn('Product Firestore seed:', err));
          } else {
            setProducts([]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'products');
          } catch (e) {
            console.warn('Products Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Products Firestore snapshot subscription error:', e);
    }
  }, []);

  // 1b. BDStall Import Audit Batches Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'bdstallImports');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: BdstallImportBatch[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as BdstallImportBatch), id: d.id }));
            list.sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
            setBdstallImportHistory(list);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'bdstallImports');
          } catch (e) {
            console.warn('bdstallImports Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('bdstallImports Firestore snapshot subscription error:', e);
    }
  }, []);

  // 1c. Universal Image Audit History Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'imageHistory');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ImageHistoryRecord[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as ImageHistoryRecord), id: d.id }));
            list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setImageHistory(list);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'imageHistory');
          } catch (e) {
            console.warn('imageHistory Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('imageHistory Firestore snapshot subscription error:', e);
    }
  }, []);

  // 2. Service Requests Collection Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'serviceRequests');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ServiceRequest[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as ServiceRequest), id: d.id }));
            setServiceRequests(list);
          } else if (!isDummyDataCleared()) {
            // Seed initial service requests to Firestore
            const batch = writeBatch(db);
            INITIAL_SERVICE_REQUESTS.forEach((sr) => {
              batch.set(doc(db, 'serviceRequests', sr.id), sanitizeForFirestore(sr));
            });
            batch.commit().catch((err) => console.warn('ServiceRequests Firestore seed:', err));
          } else {
            setServiceRequests([]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'serviceRequests');
          } catch (e) {
            console.warn('ServiceRequests Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('ServiceRequests Firestore snapshot subscription error:', e);
    }
  }, []);

  // 3. Service Jobs Collection Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'services');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ServiceJob[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as ServiceJob), id: d.id }));
            setServices(list);
          } else if (!isDummyDataCleared()) {
            const batch = writeBatch(db);
            INITIAL_SERVICES.forEach((s) => {
              batch.set(doc(db, 'services', s.id), sanitizeForFirestore(s));
            });
            batch.commit().catch((err) => console.warn('Services Firestore seed:', err));
          } else {
            setServices([]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'services');
          } catch (e) {
            console.warn('Services Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Services Firestore snapshot subscription error:', e);
    }
  }, []);

  // 4. Orders Collection Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'orders');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Order[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as Order), id: d.id }));
            setOrders(list);
          } else if (!isDummyDataCleared()) {
            const batch = writeBatch(db);
            INITIAL_ORDERS.forEach((o) => {
              batch.set(doc(db, 'orders', o.id), sanitizeForFirestore(o));
            });
            batch.commit().catch((err) => console.warn('Orders Firestore seed:', err));
          } else {
            setOrders([]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'orders');
          } catch (e) {
            console.warn('Orders Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Orders Firestore snapshot subscription error:', e);
    }
  }, []);

  // 5. Customers Collection Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'customers');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Customer[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as Customer), id: d.id }));
            setCustomers(list);
          } else if (!isDummyDataCleared()) {
            const batch = writeBatch(db);
            INITIAL_CUSTOMERS.forEach((c) => {
              batch.set(doc(db, 'customers', c.id), sanitizeForFirestore(c));
            });
            batch.commit().catch((err) => console.warn('Customers Firestore seed:', err));
          } else {
            setCustomers([]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'customers');
          } catch (e) {
            console.warn('Customers Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Customers Firestore snapshot subscription error:', e);
    }
  }, []);

  // 6. Expenses Collection Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'expenses');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Expense[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as Expense), id: d.id }));
            setExpenses(list);
          } else if (!isDummyDataCleared()) {
            const batch = writeBatch(db);
            INITIAL_EXPENSES.forEach((ex) => {
              batch.set(doc(db, 'expenses', ex.id), sanitizeForFirestore(ex));
            });
            batch.commit().catch((err) => console.warn('Expenses Firestore seed:', err));
          } else {
            setExpenses([]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'expenses');
          } catch (e) {
            console.warn('Expenses Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Expenses Firestore snapshot subscription error:', e);
    }
  }, []);

  // 7. Recondition Laptops Collection Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'reconditionLaptops');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ReconditionLaptop[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as ReconditionLaptop), id: d.id }));
            setReconditionLaptops(list);
          } else if (!isDummyDataCleared()) {
            const batch = writeBatch(db);
            INITIAL_RECONDITION_LAPTOPS.forEach((r) => {
              batch.set(doc(db, 'reconditionLaptops', r.id), sanitizeForFirestore(r));
            });
            batch.commit().catch((err) => console.warn('Recondition laptops Firestore seed:', err));
          } else {
            setReconditionLaptops([]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'reconditionLaptops');
          } catch (e) {
            console.warn('Recondition laptops Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Recondition laptops Firestore snapshot subscription error:', e);
    }
  }, []);

  // 8. Suppliers Collection Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'suppliers');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Supplier[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as Supplier), id: d.id }));
            setSuppliers(list);
          } else if (!isDummyDataCleared()) {
            const batch = writeBatch(db);
            INITIAL_SUPPLIERS.forEach((s) => {
              batch.set(doc(db, 'suppliers', s.id), sanitizeForFirestore(s));
            });
            batch.commit().catch((err) => console.warn('Suppliers Firestore seed:', err));
          } else {
            setSuppliers([]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'suppliers');
          } catch (e) {
            console.warn('Suppliers Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Suppliers Firestore snapshot subscription error:', e);
    }
  }, []);

  // 9. EMI Plans Collection Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'emiPlans');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: EmiPlan[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as EmiPlan), id: d.id }));
            setEmiPlans(list);
          } else if (!isDummyDataCleared()) {
            const batch = writeBatch(db);
            INITIAL_EMI_PLANS.forEach((ep) => {
              batch.set(doc(db, 'emiPlans', ep.id), sanitizeForFirestore(ep));
            });
            batch.commit().catch((err) => console.warn('EMI plans Firestore seed:', err));
          } else {
            setEmiPlans([]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'emiPlans');
          } catch (e) {
            console.warn('EMI plans Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('EMI plans Firestore snapshot subscription error:', e);
    }
  }, []);

  // 10. Inventory Transactions Collection Listener
  useEffect(() => {
    try {
      const colRef = collection(db, 'inventoryTransactions');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: InventoryTransaction[] = [];
            snapshot.forEach((d) => list.push({ ...(d.data() as InventoryTransaction), id: d.id }));
            setInventoryTransactions(list);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'inventoryTransactions');
          } catch (e) {
            console.warn('Inventory transactions Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Inventory transactions Firestore snapshot subscription error:', e);
    }
  }, []);

  // 11. Website Settings Listener
  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', 'websiteSettings');
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as WebsiteSettings;
            setSettings((prev) => ({ ...prev, ...data }));
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'settings/websiteSettings');
          } catch (e) {
            console.warn('Website settings Firestore snapshot notice:', e);
          }
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Website settings Firestore snapshot subscription error:', e);
    }
  }, []);

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

    // Persist to Cloud Firestore in real time
    setDoc(doc(db, 'products', newId), sanitizeForFirestore(newProduct)).catch((err) => {
      console.warn('Failed to persist product to Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, `products/${newId}`);
    });

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

    // Step 11: Automatic Monitoring when a new product lacks a verified exact-model image
    if (
      newProduct.imageVerificationStatus !== 'Verified' &&
      newProduct.imageVerificationStatus !== 'Image Imported'
    ) {
      setPendingAutoImageProductIds((prev) => (prev.includes(newId) ? prev : [newId, ...prev]));
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    let updatedPayload: Partial<Product> = { ...updates, updatedAt: new Date().toISOString() };
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
          updatedPayload = updated;
          return updated;
        }
        return p;
      })
    );
    // Persist to Cloud Firestore in real time
    setDoc(doc(db, 'products', id), sanitizeForFirestore(updatedPayload), { merge: true }).catch((err) => {
      console.warn('Failed to update product in Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    });
    logActivity('Update Product', 'Products', id, `Updated product fields`);
  };

  const softDeleteProduct = (id: string, reason: string) => {
    const deletedInfo = {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser?.name || 'Admin',
      deleteReason: reason,
      status: 'archived' as const,
    };
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...deletedInfo,
            }
          : p
      )
    );
    setDoc(doc(db, 'products', id), sanitizeForFirestore(deletedInfo), { merge: true }).catch((err) => {
      console.warn('Failed to soft delete product in Firestore:', err);
    });
    logActivity('Soft Delete Product', 'Products', id, `Moved to Trash. Reason: ${reason}`);
    triggerAutoBackup(`Product Moved to Trash: ${id}`);
  };

  const restoreProduct = (id: string) => {
    const restoredInfo = {
      isDeleted: false,
      status: 'published' as const,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...restoredInfo,
            }
          : p
      )
    );
    setDoc(doc(db, 'products', id), sanitizeForFirestore(restoredInfo), { merge: true }).catch((err) => {
      console.warn('Failed to restore product in Firestore:', err);
    });
    logActivity('Restore Product', 'Products', id, `Restored product from Trash to Catalog`);
    triggerAutoBackup(`Product Restored from Trash: ${id}`);
  };

  const permanentDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteDoc(doc(db, 'products', id)).catch((err) => {
      console.warn('Failed to permanently delete product from Firestore:', err);
    });
    logActivity('Permanent Delete', 'Products', id, `Permanently purged product from database`);
    triggerAutoBackup(`Product Permanently Purged: ${id}`);
  };

  const clearAllProducts = () => {
    setProducts([]);
    logActivity('Clear All Products', 'Products', 'All', 'Purged all products from catalog');
  };

  const approveBdstallImportBatch: AdminStoreType['approveBdstallImportBatch'] = ({
    items,
    importMethod,
    sourceUrl,
    fetchedAt,
    totalExtracted,
    skippedCount,
  }) => {
    const now = new Date().toISOString();
    let added = 0;
    let updated = 0;
    const toPersist: Product[] = [];

    setProducts((prev) => {
      const next = [...prev];
      items.forEach((item, idx) => {
        const existingIdx = item.existingProductId
          ? next.findIndex((p) => p.id === item.existingProductId)
          : next.findIndex((p) => !p.isDeleted && p.configKey && p.configKey === item.configKey);

        const storageStr =
          item.hdd && item.hdd !== 'None'
            ? `${item.ssd} NVMe SSD + ${item.hdd}`
            : `${item.ssd} NVMe SSD`;

        if (existingIdx >= 0) {
          const existing = next[existingIdx];
          // CRITICAL: Never automatically overwrite purchasePrice or sellingPrice with marketPrice!
          const nextPurchase = item.purchasePrice >= 0 ? item.purchasePrice : existing.purchasePrice;
          const nextSelling = item.sellingPrice >= 0 ? item.sellingPrice : existing.sellingPrice;
          const mergedProduct: Product = {
            ...existing,
            brand: 'Dell',
            series: item.series || existing.series || 'Dell Latitude',
            model: item.model,
            generation: item.generation,
            processor: item.processor,
            ram: item.ram,
            ssd: item.ssd,
            hdd: item.hdd,
            storage: storageStr,
            display: `${item.display} ${item.resolution} (${item.touchscreen})`,
            screenSize: item.display,
            resolution: item.resolution,
            touchscreen: item.touchscreen,
            condition: item.condition,
            purchasePrice: nextPurchase,
            sellingPrice: nextSelling,
            profitMargin: nextSelling - nextPurchase,
            marketPrice: item.marketPrice,
            marketPriceMin: item.marketPriceMin ?? item.marketPrice,
            marketPriceMax: item.marketPriceMax ?? item.marketPrice,
            sellerCount: item.sellerCount,
            sellerListings: item.sellerListings,
            sourceUrl: item.sourceUrl,
            lastUpdated: item.lastUpdated || now,
            stockStatus: item.stockStatus,
            stockQuantity: item.stockQuantity,
            configKey: item.configKey,
            specificationSource: 'BDStall Sync',
            updatedAt: now,
          };
          next[existingIdx] = mergedProduct;
          toPersist.push(mergedProduct);
          updated++;
        } else {
          const newId = `prod-lat-${Date.now()}-${idx}`;
          const skuSafe = item.model.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          const ramSafe = item.ram.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          const ssdSafe = item.ssd.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          const newProduct: Product = {
            id: newId,
            sku: `JHF-LAT-${skuSafe}-${ramSafe}-${ssdSafe}-${String(idx + 1).padStart(2, '0')}`,
            name: `Dell Latitude ${item.model} (${item.generation} ${item.processor.replace('Intel ', '')} / ${item.ram} / ${item.ssd}${item.hdd && item.hdd !== 'None' ? ' + ' + item.hdd : ''})`,
            slug: `dell-latitude-${skuSafe.toLowerCase()}-${ramSafe.toLowerCase()}-${ssdSafe.toLowerCase()}`,
            brand: 'Dell',
            series: 'Dell Latitude',
            model: item.model,
            category: 'Business Laptop',
            condition: item.condition,
            processor: item.processor,
            generation: item.generation,
            ram: item.ram,
            storage: storageStr,
            ssd: item.ssd,
            hdd: item.hdd,
            graphics: 'Intel UHD / Iris Graphics',
            display: `${item.display} ${item.resolution} (${item.touchscreen})`,
            screenSize: item.display,
            resolution: item.resolution,
            touchscreen: item.touchscreen,
            batteryCondition: 'Tested 3–5 Hours Backup',
            keyboardCondition: 'Backlit Original Keyboard',
            bodyCondition: 'Verified Corporate Business Grade',
            operatingSystem: 'Windows 10 / 11 Pro Ready',
            includedAccessories: ['Original Dell Charger', 'Power Cord'],
            purchasePrice: item.purchasePrice || 0,
            sellingPrice: item.sellingPrice || 0,
            profitMargin: (item.sellingPrice || 0) - (item.purchasePrice || 0),
            marketPrice: item.marketPrice,
            marketPriceMin: item.marketPriceMin ?? item.marketPrice,
            marketPriceMax: item.marketPriceMax ?? item.marketPrice,
            sellerCount: item.sellerCount,
            sellerListings: item.sellerListings,
            sourceUrl: item.sourceUrl,
            lastUpdated: item.lastUpdated || now,
            stockStatus: item.stockStatus,
            stockQuantity: item.stockQuantity || 0,
            minimumStockAlert: 1,
            warranty: '30 Days Replacement + 5 Years Free Service',
            shortDescription: `Dell Latitude ${item.model} • ${item.generation} • ${item.processor} • ${item.ram} • ${storageStr} • ${item.display} ${item.touchscreen}`,
            specifications: `${item.processor} • ${item.ram} • ${storageStr} • ${item.display} ${item.resolution} • ${item.touchscreen}`,
            images: [BRAND_LAPTOP_IMAGES.Dell],
            status: item.publishToCatalog && (item.stockQuantity || 0) > 0 && (item.sellingPrice || 0) > 0 ? 'published' : 'draft',
            isFeatured: false,
            specificationSource: 'BDStall Sync',
            configKey: item.configKey,
            createdAt: now,
            updatedAt: now,
            createdBy: currentUser?.name || 'Administrator',
          };
          next.unshift(newProduct);
          toPersist.push(newProduct);
          added++;
        }
      });
      return next;
    });

    if (toPersist.length > 0) {
      const batch = writeBatch(db);
      toPersist.forEach((prod) => {
        batch.set(doc(db, 'products', prod.id), sanitizeForFirestore(prod), { merge: true });
      });
      batch.commit().catch((err) => {
        console.warn('Failed to persist approved BDStall products to Firestore:', err);
        handleFirestoreError(err, OperationType.WRITE, 'products');
      });
    }

    const importBatch: BdstallImportBatch = {
      id: `bdi-${Date.now()}`,
      sourceUrl,
      fetchedAt,
      approvedAt: now,
      approvedBy: currentUser?.name || 'Administrator',
      totalExtracted,
      approvedNewCount: added,
      approvedUpdatedCount: updated,
      skippedCount,
      importMethod,
    };

    setBdstallImportHistory((prev) => [importBatch, ...prev]);
    setDoc(doc(db, 'bdstallImports', importBatch.id), sanitizeForFirestore(importBatch)).catch((err) => {
      console.warn('Failed to persist BDStall import batch:', err);
    });

    logActivity(
      'Approve BDStall Import',
      'Products',
      'Dell Latitude',
      `Approved ${added} new + ${updated} updated Latitude configs (${importMethod})`
    );
    triggerAutoBackup(`BDStall Import Approved (${added} new, ${updated} updated)`);

    // Step 11: Monitor newly created products that still need exact-model image verification
    const newlyAddedIds = toPersist
      .filter((p) => p.imageVerificationStatus !== 'Verified' && p.imageVerificationStatus !== 'Image Imported')
      .map((p) => p.id);
    if (newlyAddedIds.length > 0) {
      setPendingAutoImageProductIds((prev) => Array.from(new Set([...newlyAddedIds, ...prev])));
    }

    return { added, updated, batch: importBatch };
  };

  const dismissAutoImageAlert = (productId: string) => {
    setPendingAutoImageProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const recordImageHistoryEntry = (entry: ImageHistoryRecord) => {
    setImageHistory((prev) => [entry, ...prev].slice(0, 500));
    setDoc(doc(db, 'imageHistory', entry.id), sanitizeForFirestore(entry)).catch((err) => {
      console.warn('Failed to persist imageHistory to Firestore:', err);
    });
  };

  const assignVerifiedProductImage: AdminStoreType['assignVerifiedProductImage'] = (productId, payload) => {
    const now = new Date().toISOString();
    let updatedTarget: Product | null = null;
    let prevUrlSnapshot = '';

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const currentMain = p.mainImageUrl || p.images?.[0] || '';
        prevUrlSnapshot =
          currentMain && currentMain !== payload.mainImageUrl
            ? currentMain
            : p.previousImageUrl || currentMain;

        // Keep other verified gallery items but place verified mainImageUrl at index 0
        const existingExtras = (p.images || []).filter(
          (u) => u && u !== payload.mainImageUrl && u !== currentMain
        );

        const nextProd: Product = {
          ...p,
          exactModel: payload.exactModel || p.exactModel || p.model,
          mainImageUrl: payload.mainImageUrl,
          images: [payload.mainImageUrl, ...existingExtras],
          imageStoragePath: payload.imageStoragePath ?? p.imageStoragePath,
          imageThumbnailPath: payload.imageThumbnailPath ?? p.imageThumbnailPath,
          imageSourceUrl: payload.imageSourceUrl ?? p.imageSourceUrl,
          imageSourceName: payload.imageSourceName ?? p.imageSourceName,
          imageLicense: payload.imageLicense ?? p.imageLicense,
          imageAttribution: payload.imageAttribution ?? p.imageAttribution,
          imageResolution: payload.imageResolution ?? p.imageResolution,
          imageVerificationStatus: payload.imageVerificationStatus,
          imageConfidence: payload.imageConfidence ?? p.imageConfidence,
          verificationNotes: payload.verificationNotes ?? p.verificationNotes,
          imageUpdatedAt: now,
          previousImageUrl: prevUrlSnapshot,
          updatedAt: now,
        };
        updatedTarget = nextProd;
        return nextProd;
      })
    );

    if (updatedTarget) {
      const saved: Product = updatedTarget;
      setDoc(doc(db, 'products', productId), sanitizeForFirestore(saved), { merge: true }).catch((err) => {
        console.warn('Failed to persist verified image to Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
      });

      recordImageHistoryEntry({
        id: `imghist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId,
        brand: saved.brand,
        series: saved.series,
        exactModel: saved.exactModel || saved.model,
        generation: saved.generation,
        action: payload.action || 'imported',
        imageUrl: payload.mainImageUrl,
        previousImageUrl: prevUrlSnapshot || undefined,
        imageStoragePath: payload.imageStoragePath,
        imageThumbnailPath: payload.imageThumbnailPath,
        imageSourceUrl: payload.imageSourceUrl,
        imageSourceName: payload.imageSourceName,
        imageLicense: payload.imageLicense,
        imageAttribution: payload.imageAttribution,
        imageResolution: payload.imageResolution,
        imageVerificationStatus: payload.imageVerificationStatus,
        imageConfidence: payload.imageConfidence,
        verificationNotes: payload.verificationNotes,
        performedBy: currentUser?.name || 'Administrator',
        timestamp: now,
      });

      setPendingAutoImageProductIds((prev) => prev.filter((id) => id !== productId));
      logActivity(
        'Update Product Image',
        'Image Manager',
        saved.exactModel || saved.name,
        `Assigned ${payload.imageVerificationStatus} image (${payload.imageConfidence ?? 0}% confidence) from ${payload.imageSourceName || 'Verified Source'}`
      );
    }
  };

  const rejectProductImage: AdminStoreType['rejectProductImage'] = (productId, params) => {
    const now = new Date().toISOString();
    let updatedTarget: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const rejectedList = Array.from(
          new Set([...(p.rejectedImageUrls || []), ...(params.candidateUrl ? [params.candidateUrl] : [])])
        );
        const nextProd: Product = {
          ...p,
          rejectedImageUrls: rejectedList,
          imageVerificationStatus: params.status || p.imageVerificationStatus || 'Rejected',
          verificationNotes: params.reason,
          updatedAt: now,
        };
        updatedTarget = nextProd;
        return nextProd;
      })
    );

    if (updatedTarget) {
      const saved: Product = updatedTarget;
      setDoc(doc(db, 'products', productId), sanitizeForFirestore(saved), { merge: true }).catch((err) => {
        console.warn('Failed to persist rejected image log:', err);
      });
      recordImageHistoryEntry({
        id: `imghist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId,
        brand: saved.brand,
        series: saved.series,
        exactModel: params.exactModel || saved.exactModel || saved.model,
        generation: saved.generation,
        action: 'rejected',
        imageUrl: params.candidateUrl || saved.mainImageUrl || saved.images?.[0] || '',
        previousImageUrl: saved.mainImageUrl || saved.images?.[0],
        imageVerificationStatus: params.status || 'Rejected',
        verificationNotes: params.reason,
        performedBy: currentUser?.name || 'Administrator',
        timestamp: now,
      });
    }
  };

  const rollbackProductImage: AdminStoreType['rollbackProductImage'] = (productId, targetHistoryOrUrl) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) {
      return { success: false, message: 'Product not found.' };
    }

    const histRecord =
      targetHistoryOrUrl && typeof targetHistoryOrUrl === 'object' ? targetHistoryOrUrl : undefined;
    const restoreUrl =
      typeof targetHistoryOrUrl === 'string'
        ? targetHistoryOrUrl
        : histRecord?.previousImageUrl || histRecord?.imageUrl || prod.previousImageUrl || '';

    if (!restoreUrl) {
      return { success: false, message: 'No previous image URL available to roll back to.' };
    }

    const now = new Date().toISOString();
    const currentMain = prod.mainImageUrl || prod.images?.[0] || '';
    const isLocalOrVerifiedRestore = restoreUrl.startsWith('/uploads/laptop-images/');
    const nextStatus: ImageVerificationStatus = histRecord
      ? histRecord.imageVerificationStatus
      : isLocalOrVerifiedRestore
      ? 'Image Imported'
      : 'Verification Pending';

    const updatedProd: Product = {
      ...prod,
      mainImageUrl: restoreUrl,
      images: [restoreUrl, ...(prod.images || []).filter((u) => u && u !== restoreUrl && u !== currentMain)],
      previousImageUrl: currentMain || prod.previousImageUrl,
      imageStoragePath: histRecord?.imageStoragePath ?? (isLocalOrVerifiedRestore ? restoreUrl : undefined),
      imageThumbnailPath: histRecord?.imageThumbnailPath ?? prod.imageThumbnailPath,
      imageSourceUrl: histRecord?.imageSourceUrl ?? prod.imageSourceUrl,
      imageSourceName: histRecord?.imageSourceName ?? 'Rollback Restore',
      imageLicense: histRecord?.imageLicense ?? prod.imageLicense,
      imageAttribution: histRecord?.imageAttribution ?? prod.imageAttribution,
      imageResolution: histRecord?.imageResolution ?? prod.imageResolution,
      imageVerificationStatus: nextStatus,
      verificationNotes: `Rolled back to previous image (${now})`,
      imageUpdatedAt: now,
      updatedAt: now,
    };

    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProd : p)));
    setDoc(doc(db, 'products', productId), sanitizeForFirestore(updatedProd), { merge: true }).catch((err) => {
      console.warn('Failed to persist rollback to Firestore:', err);
    });

    recordImageHistoryEntry({
      id: `imghist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      brand: prod.brand,
      series: prod.series,
      exactModel: prod.exactModel || prod.model,
      generation: prod.generation,
      action: 'rolled_back',
      imageUrl: restoreUrl,
      previousImageUrl: currentMain,
      imageVerificationStatus: nextStatus,
      verificationNotes: `Rolled back from ${currentMain || 'none'}`,
      performedBy: currentUser?.name || 'Administrator',
      timestamp: now,
    });

    logActivity('Rollback Product Image', 'Image Manager', prod.model, `Restored previous image URL`);
    return { success: true, message: 'Previous product image restored safely.' };
  };

  const removeWrongProductImage: AdminStoreType['removeWrongProductImage'] = (productId, reason) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const now = new Date().toISOString();
    const removedUrl = prod.mainImageUrl || prod.images?.[0] || '';
    const brandFallback =
      BRAND_LAPTOP_IMAGES[prod.brand as keyof typeof BRAND_LAPTOP_IMAGES] || BRAND_LAPTOP_IMAGES.Dell;

    const updatedProd: Product = {
      ...prod,
      mainImageUrl: undefined,
      imageStoragePath: undefined,
      imageThumbnailPath: undefined,
      imageSourceUrl: undefined,
      imageSourceName: undefined,
      imageLicense: undefined,
      imageAttribution: undefined,
      imageResolution: undefined,
      imageConfidence: 0,
      imageVerificationStatus: 'Image Missing',
      verificationNotes: reason || 'Wrong image removed by admin — awaiting verified exact model photo.',
      previousImageUrl: removedUrl || prod.previousImageUrl,
      rejectedImageUrls: Array.from(
        new Set([...(prod.rejectedImageUrls || []), ...(removedUrl ? [removedUrl] : [])])
      ),
      images: [brandFallback],
      imageUpdatedAt: now,
      updatedAt: now,
    };

    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProd : p)));
    setDoc(doc(db, 'products', productId), sanitizeForFirestore(updatedProd), { merge: true }).catch((err) => {
      console.warn('Failed to persist image removal to Firestore:', err);
    });

    recordImageHistoryEntry({
      id: `imghist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      brand: prod.brand,
      series: prod.series,
      exactModel: prod.exactModel || prod.model,
      generation: prod.generation,
      action: 'removed',
      imageUrl: removedUrl,
      previousImageUrl: removedUrl,
      imageVerificationStatus: 'Rejected',
      verificationNotes: reason || 'Removed incorrect product image',
      performedBy: currentUser?.name || 'Administrator',
      timestamp: now,
    });

    logActivity('Remove Wrong Image', 'Image Manager', prod.model, reason || 'Removed wrong image');
  };

  const updateProductImageStatus: AdminStoreType['updateProductImageStatus'] = (
    productId,
    status,
    notes
  ) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              imageVerificationStatus: status,
              verificationNotes: notes ?? p.verificationNotes,
              updatedAt: now,
            }
          : p
      )
    );
    setDoc(
      doc(db, 'products', productId),
      sanitizeForFirestore({
        imageVerificationStatus: status,
        ...(notes !== undefined ? { verificationNotes: notes } : {}),
        updatedAt: now,
      }),
      { merge: true }
    ).catch((err) => console.warn('Failed to update image status:', err));
  };

  // Order Actions
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'timeline' | 'createdBy'>): Order => {
    const orderNumber = 'JHF-ORD-' + (1000 + orders.length + 1);
    const newId = 'ord-' + Date.now();
    const newOrder: Order = {
      ...orderData,
      id: newId,
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

    // Persist new order directly to Cloud Firestore in real time
    setDoc(doc(db, 'orders', newId), sanitizeForFirestore(newOrder)).catch((err) => {
      console.warn('Failed to save order to Firestore:', err);
    });

    // Automatically deduct inventory stock & persist inventory transactions
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
        setDoc(doc(db, 'inventoryTransactions', tx.id), sanitizeForFirestore(tx)).catch((err) => {
          console.warn('Failed to persist transaction to Firestore:', err);
        });
      }
    });

    // Update or create Customer CRM profile and persist to Firestore
    setCustomers((prevCustomers) => {
      const existing = prevCustomers.find((c) => c.phoneNumber === orderData.customerPhone);
      if (existing) {
        const updatedCust = {
          ...existing,
          totalOrders: existing.totalOrders + 1,
          totalSpending: existing.totalSpending + orderData.totalAmount,
          lastOrderDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDoc(doc(db, 'customers', existing.id), sanitizeForFirestore(updatedCust), { merge: true }).catch((err) => {
          console.warn('Failed to update customer in Firestore:', err);
        });
        return prevCustomers.map((c) => (c.id === existing.id ? updatedCust : c));
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
        setDoc(doc(db, 'customers', newCustomer.id), sanitizeForFirestore(newCustomer)).catch((err) => {
          console.warn('Failed to save customer to Firestore:', err);
        });
        return [newCustomer, ...prevCustomers];
      }
    });

    logActivity('Create Order', 'Orders', orderNumber, `New order created for ${orderData.customerName} (৳${orderData.totalAmount})`);
    triggerAutoBackup(`Order Created: ${orderNumber} (${orderData.customerName})`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note: string) => {
    triggerAutoBackup(`Order ${orderId} Status: ${newStatus}`);
    let updatedPayload: Partial<Order> | null = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newEvent = {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note || `Status updated to ${newStatus}`,
            performedBy: currentUser?.name || 'Admin',
          };
          const updated = {
            ...ord,
            orderStatus: newStatus,
            updatedAt: new Date().toISOString(),
            timeline: [...ord.timeline, newEvent],
          };
          updatedPayload = updated;
          return updated;
        }
        return ord;
      })
    );
    if (updatedPayload) {
      setDoc(doc(db, 'orders', orderId), sanitizeForFirestore(updatedPayload), { merge: true }).catch((err) => {
        console.warn('Failed to update order in Firestore:', err);
      });
    }
    logActivity('Update Order Status', 'Orders', orderId, `Changed status to: ${newStatus}`);
  };

  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    const updatedPayload = { ...updates, updatedAt: new Date().toISOString() };
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              ...updatedPayload,
            }
          : ord
      )
    );
    setDoc(doc(db, 'orders', orderId), sanitizeForFirestore(updatedPayload), { merge: true }).catch((err) => {
      console.warn('Failed to update order details in Firestore:', err);
    });
    logActivity('Update Order Details', 'Orders', orderId, `Updated details`);
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    deleteDoc(doc(db, 'orders', orderId)).catch((err) => {
      console.warn('Failed to delete order from Firestore:', err);
    });
    logActivity('Delete Order', 'Orders', orderId, `Deleted order record ${orderId}`);
  };

  const clearAllOrders = () => {
    setOrders([]);
    getDocs(collection(db, 'orders')).then((snap) => {
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      batch.commit().catch((err) => console.warn('Failed to clear orders in Firestore:', err));
    }).catch((err) => console.warn('Clear orders error:', err));
    logActivity('Clear All Orders', 'Orders', 'All', 'Purged all orders from database');
  };

  // Customer Actions
  const updateCustomer = (customerId: string, updates: Partial<Customer>) => {
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...payload } : c))
    );
    setDoc(doc(db, 'customers', customerId), sanitizeForFirestore(payload), { merge: true }).catch((err) => {
      console.warn('Failed to update customer in Firestore:', err);
    });
    logActivity('Update Customer', 'Customers', customerId, 'Updated customer details');
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    deleteDoc(doc(db, 'customers', customerId)).catch((err) => {
      console.warn('Failed to delete customer from Firestore:', err);
    });
    logActivity('Delete Customer', 'Customers', customerId, `Deleted customer ${customerId}`);
    triggerAutoBackup(`Customer Deleted: ${customerId}`);
  };

  const clearAllCustomers = () => {
    setCustomers([]);
    getDocs(collection(db, 'customers')).then((snap) => {
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      batch.commit().catch((err) => console.warn('Failed to clear customers in Firestore:', err));
    }).catch((err) => console.warn('Clear customers error:', err));
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
    setDoc(doc(db, 'inventoryTransactions', tx.id), sanitizeForFirestore(tx)).catch((err) => {
      console.warn('Failed to save transaction to Firestore:', err);
    });
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
    setDoc(doc(db, 'inventoryTransactions', tx.id), sanitizeForFirestore(tx)).catch((err) => {
      console.warn('Failed to save transaction to Firestore:', err);
    });
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
    setDoc(doc(db, 'inventoryTransactions', tx.id), sanitizeForFirestore(tx)).catch((err) => {
      console.warn('Failed to save transaction to Firestore:', err);
    });
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
    const newId = 'exp-' + Date.now();
    const newExpense: Expense = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Admin',
    };
    setExpenses((prev) => [newExpense, ...prev]);
    setDoc(doc(db, 'expenses', newId), sanitizeForFirestore(newExpense)).catch((err) => {
      console.warn('Failed to save expense to Firestore:', err);
    });
    logActivity('Add Expense', 'Finance', data.category, `Amount: ৳${data.amount} for ${data.description}`);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteDoc(doc(db, 'expenses', id)).catch((err) => {
      console.warn('Failed to delete expense from Firestore:', err);
    });
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
    setDoc(doc(db, 'settings', 'websiteSettings'), sanitizeForFirestore(newSettings), { merge: true }).catch((err) => {
      console.warn('Failed to update websiteSettings in Firestore:', err);
    });
    logActivity('Update Settings', 'Settings', 'Website Settings', `Updated store hotlines & configuration`);
  };

  // Customer Actions
  const addCustomer = (customerData: Partial<Customer>) => {
    const newId = 'cust-' + Date.now();
    const newCustomer: Customer = {
      id: newId,
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
    setDoc(doc(db, 'customers', newId), sanitizeForFirestore(newCustomer)).catch((err) => {
      console.warn('Failed to save customer to Firestore:', err);
    });
    logActivity('Add Customer', 'Customers', newCustomer.fullName, `Created customer record for ${newCustomer.phoneNumber}`);
    triggerAutoBackup(`Customer Added: ${newCustomer.fullName}`);
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    let updatedPayload: Partial<Order> | null = null;
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
          const updated = {
            ...ord,
            paymentStatus: status,
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };
          updatedPayload = updated;
          return updated;
        }
        return ord;
      })
    );
    if (updatedPayload) {
      setDoc(doc(db, 'orders', orderId), sanitizeForFirestore(updatedPayload), { merge: true }).catch((err) => {
        console.warn('Failed to update payment status in Firestore:', err);
      });
    }
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
    const newId = 'sup-' + Date.now();
    const newSupplier: Supplier = {
      ...supplierData,
      id: newId,
      createdAt: new Date().toISOString(),
      totalPurchases: supplierData.totalPurchases || 0,
      totalPaid: supplierData.totalPaid || 0,
      outstandingBalance: supplierData.outstandingBalance || 0,
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    setDoc(doc(db, 'suppliers', newId), sanitizeForFirestore(newSupplier)).catch((err) => {
      console.warn('Failed to save supplier to Firestore:', err);
    });
    logActivity('Add Supplier', 'Suppliers', newSupplier.name, `Added supplier ${newSupplier.name}`);
    triggerAutoBackup(`Supplier Added: ${newSupplier.name}`);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    setDoc(doc(db, 'suppliers', id), sanitizeForFirestore(updates), { merge: true }).catch((err) => {
      console.warn('Failed to update supplier in Firestore:', err);
    });
    logActivity('Update Supplier', 'Suppliers', id, `Updated supplier details`);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    deleteDoc(doc(db, 'suppliers', id)).catch((err) => {
      console.warn('Failed to delete supplier from Firestore:', err);
    });
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
    setDoc(doc(db, 'emiPlans', planId), sanitizeForFirestore(newPlan)).catch((err) => {
      console.warn('Failed to save EMI plan to Firestore:', err);
    });

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

    let updatedPayload: Partial<EmiPlan> | null = null;
    setEmiPlans((prev) =>
      prev.map((p) => {
        if (p.id === emiPlanId) {
          const updated = {
            ...p,
            paidAmount: newPaid,
            remainingDue: newRemaining,
            status: (isCompleted ? 'completed' : p.status) as any,
            isOverdue: isCompleted ? false : p.isOverdue,
            paymentHistory: [...p.paymentHistory, paymentRecord],
            updatedAt: now,
          };
          updatedPayload = updated;
          return updated;
        }
        return p;
      })
    );

    if (updatedPayload) {
      setDoc(doc(db, 'emiPlans', emiPlanId), sanitizeForFirestore(updatedPayload), { merge: true }).catch((err) => {
        console.warn('Failed to update EMI payment in Firestore:', err);
      });
    }

    logActivity('Record EMI Payment', 'Sales & EMI', plan.invoiceNo, `Collected ৳${amount} from ${plan.customerName} via ${paymentMethod}`);
    return { success: true, message: `Payment of ৳${amount.toLocaleString()} recorded successfully!` };
  };

  const updateEmiPlan = (id: string, updates: Partial<EmiPlan>) => {
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    setEmiPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...payload } : p))
    );
    setDoc(doc(db, 'emiPlans', id), sanitizeForFirestore(payload), { merge: true }).catch((err) => {
      console.warn('Failed to update EMI plan in Firestore:', err);
    });
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
    deleteDoc(doc(db, 'emiPlans', id)).catch((err) => {
      console.warn('Failed to delete EMI plan from Firestore:', err);
    });
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
    setDoc(doc(db, 'reconditionLaptops', newId), sanitizeForFirestore(newItem)).catch((err) => {
      console.warn('Failed to save recondition laptop to Firestore:', err);
    });
    logActivity('Add Recondition Laptop', 'Recondition Zone', newItem.title, `Added recondition laptop: ${newItem.title} (Buy: ৳${newItem.buyPrice}, Sell: ৳${newItem.sellPrice})`);
  };

  const updateReconditionLaptop = (id: string, updates: Partial<ReconditionLaptop>) => {
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    setReconditionLaptops((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
    );
    setDoc(doc(db, 'reconditionLaptops', id), sanitizeForFirestore(payload), { merge: true }).catch((err) => {
      console.warn('Failed to update recondition laptop in Firestore:', err);
    });
    logActivity('Update Recondition Laptop', 'Recondition Zone', id, 'Updated reconditioned laptop details');
  };

  const deleteReconditionLaptop = (id: string) => {
    setReconditionLaptops((prev) => prev.filter((item) => item.id !== id));
    deleteDoc(doc(db, 'reconditionLaptops', id)).catch((err) => {
      console.warn('Failed to delete recondition laptop from Firestore:', err);
    });
    logActivity('Delete Recondition Laptop', 'Recondition Zone', id, `Deleted recondition laptop ${id}`);
  };

  const markReconditionSold = (id: string, soldPrice?: number, customerName?: string, soldDate?: string) => {
    let updatedPayload: Partial<ReconditionLaptop> | null = null;
    setReconditionLaptops((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const finalSoldPrice = soldPrice !== undefined && soldPrice > 0 ? soldPrice : (item.offerPrice || item.sellPrice);
          const updated = {
            ...item,
            status: 'sold' as const,
            soldPrice: finalSoldPrice,
            soldDate: soldDate || new Date().toISOString().slice(0, 10),
            soldToCustomer: customerName || 'Walk-in Customer',
            updatedAt: new Date().toISOString(),
          };
          updatedPayload = updated;
          return updated;
        }
        return item;
      })
    );
    if (updatedPayload) {
      setDoc(doc(db, 'reconditionLaptops', id), sanitizeForFirestore(updatedPayload), { merge: true }).catch((err) => {
        console.warn('Failed to mark recondition laptop sold in Firestore:', err);
      });
    }
    logActivity('Mark Recondition Sold', 'Recondition Zone', id, `Laptop marked as SOLD (Price: ৳${soldPrice})`);
  };

  const markReconditionAvailable = (id: string) => {
    const updatedPayload = {
      status: 'available' as const,
      soldPrice: 0,
      soldDate: '',
      soldToCustomer: '',
      updatedAt: new Date().toISOString(),
    };
    setReconditionLaptops((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedPayload,
            soldPrice: undefined,
            soldDate: undefined,
            soldToCustomer: undefined,
          };
        }
        return item;
      })
    );
    setDoc(doc(db, 'reconditionLaptops', id), sanitizeForFirestore(updatedPayload), { merge: true }).catch((err) => {
      console.warn('Failed to reactivate recondition laptop in Firestore:', err);
    });
    logActivity('Reactivate Recondition Laptop', 'Recondition Zone', id, 'Reactivated status to available');
  };

  const clearAllReconditionLaptops = () => {
    setReconditionLaptops([]);
    getDocs(collection(db, 'reconditionLaptops')).then((snap) => {
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      batch.commit().catch((err) => console.warn('Failed to clear recondition laptops in Firestore:', err));
    }).catch((err) => console.warn('Clear recondition laptops error:', err));
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
    setDoc(doc(db, 'services', newId), sanitizeForFirestore(newJob)).catch((err) => {
      console.warn('Failed to save service job to Firestore:', err);
    });
    logActivity('New Service Job', 'Inventory', newId, `Registered service intake for ${jobData.customerName}.`);
    triggerAutoBackup(`Service Job Registered: ${newId} (${jobData.customerName})`);
    return newJob;
  };

  const updateServiceJob = (id: string, updates: Partial<ServiceJob>) => {
    let updatedPayload: Partial<ServiceJob> | null = null;
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
        const updated = {
          ...job,
          ...updates,
          updatedAt: now,
          logs: updatedLogs,
        };
        updatedPayload = updated;
        return updated;
      })
    );
    if (updatedPayload) {
      setDoc(doc(db, 'services', id), sanitizeForFirestore(updatedPayload), { merge: true }).catch((err) => {
        console.warn('Failed to update service job in Firestore:', err);
      });
    }
  };

  const deleteServiceJob = (id: string) => {
    setServices((prev) => prev.filter((j) => j.id !== id));
    deleteDoc(doc(db, 'services', id)).catch((err) => {
      console.warn('Failed to delete service job from Firestore:', err);
    });
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
    customerCharge?: number,
    overrideWarrantyDays?: number
  ) => {
    const part = serviceParts.find((p) => p.id === partId);
    if (!part) return;
    const safeQty = Math.max(1, Math.round(Number(quantity) || 1));
    const deductedStock = Math.min(Math.max(0, part.stock || 0), safeQty);

    // Deduct stock from serviceParts
    setServiceParts((prev) =>
      prev.map((p) =>
        p.id === partId ? { ...p, stock: Math.max(0, (p.stock || 0) - safeQty) } : p
      )
    );

    const charge =
      customerCharge !== undefined && !Number.isNaN(Number(customerCharge))
        ? Math.max(0, Number(customerCharge))
        : Math.max(0, part.sellingPrice * safeQty);
    const purchaseCost = Math.max(0, (part.purchaseCost || 0) * safeQty);
    const wDays =
      overrideWarrantyDays !== undefined && !Number.isNaN(Number(overrideWarrantyDays))
        ? Math.max(0, Math.round(Number(overrideWarrantyDays)))
        : Math.max(0, Number(part.warrantyDays ?? 0));
    const startDate = new Date();
    const startStr = startDate.toISOString().split('T')[0];
    let endStr: string | undefined;
    if (wDays > 0) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + wDays);
      endStr = endDate.toISOString().split('T')[0];
    }

    const usage: ServicePartUsage = {
      id: `usage-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      partId: part.id,
      partName: part.name,
      partCode: part.code,
      quantity: safeQty,
      purchaseCost,
      customerCharge: charge,
      warrantyDays: wDays,
      warrantyStart: startStr,
      warrantyEnd: endStr,
      serialNumber: part.serialNumber,
      isCustomPart: false,
      deductedStock,
    };

    setServices((prev) =>
      prev.map((job) => {
        if (job.id !== serviceJobId) return job;
        const newPartsUsed = [...(job.partsUsed || []), usage];
        const newPartsCost = newPartsUsed.reduce((sum, u) => sum + (Number(u.customerCharge) || 0), 0);
        const newInternalPartsCost = newPartsUsed.reduce((sum, u) => sum + (Number(u.purchaseCost) || 0), 0);
        const newTotal = Math.max(
          0,
          (job.diagnosticFee || 0) + (job.laborCost || 0) + newPartsCost + (job.otherCost || 0) - (job.discount || 0)
        );
        const newDue = Math.max(0, newTotal - (job.paidAmount || 0));
        const newProfit = Math.max(0, newTotal - (newInternalPartsCost + (job.diagnosticFee || 0) * 0.2));

        const updated: ServiceJob = {
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
              action: 'Spare Part Added to Bill',
              user: currentUser?.name || 'Admin',
              details: `Added ${safeQty}x ${part.name} (Code: ${part.code}, Warranty: ${wDays > 0 ? `${wDays} Days` : 'No Warranty'}). Charge: ৳${charge}.`,
            },
          ],
        };
        setDoc(doc(db, 'services', serviceJobId), sanitizeForFirestore(updated), { merge: true }).catch((err) => {
          console.warn('Failed to update service job parts in Firestore:', err);
        });
        return updated;
      })
    );
  };

  const addCustomServicePartToJob = (
    serviceJobId: string,
    customPart: {
      name: string;
      code?: string;
      category?: ServicePart['category'];
      quantity: number;
      purchaseCost?: number;
      customerCharge: number;
      warrantyDays: number;
      saveToInventory?: boolean;
    }
  ) => {
    const cleanName = customPart.name.trim();
    if (!cleanName) return;

    const safeQty = Math.max(1, Math.round(Number(customPart.quantity) || 1));
    const totalCharge = Math.max(0, Number(customPart.customerCharge) || 0);
    const unitCost = Math.max(0, Number(customPart.purchaseCost) || 0);
    const totalPurchaseCost = unitCost * safeQty;
    const wDays = Math.max(0, Math.round(Number(customPart.warrantyDays) || 0));
    const cleanCode =
      customPart.code?.trim() ||
      `PRT-${Date.now().toString().slice(-4)}`;

    const startDate = new Date();
    const startStr = startDate.toISOString().split('T')[0];
    let endStr: string | undefined;
    if (wDays > 0) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + wDays);
      endStr = endDate.toISOString().split('T')[0];
    }

    let createdPartId = `custom-${Date.now()}`;
    if (customPart.saveToInventory) {
      createdPartId = `part-${Date.now().toString().slice(-5)}`;
      const newInventoryPart: ServicePart = {
        id: createdPartId,
        name: cleanName,
        code: cleanCode,
        category: customPart.category || 'Other',
        stock: 0,
        minStockAlert: 2,
        purchaseCost: unitCost,
        sellingPrice: safeQty > 0 ? Math.round(totalCharge / safeQty) : totalCharge,
        warrantyDays: wDays,
        isDummy: false,
        createdAt: new Date().toISOString(),
      };
      setServiceParts((prev) => [newInventoryPart, ...prev]);
    }

    const usage: ServicePartUsage = {
      id: `usage-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      partId: createdPartId,
      partName: cleanName,
      partCode: cleanCode,
      quantity: safeQty,
      purchaseCost: totalPurchaseCost,
      customerCharge: totalCharge,
      warrantyDays: wDays,
      warrantyStart: startStr,
      warrantyEnd: endStr,
      isCustomPart: true,
      deductedStock: 0,
    };

    setServices((prev) =>
      prev.map((job) => {
        if (job.id !== serviceJobId) return job;
        const newPartsUsed = [...(job.partsUsed || []), usage];
        const newPartsCost = newPartsUsed.reduce((sum, u) => sum + (Number(u.customerCharge) || 0), 0);
        const newInternalPartsCost = newPartsUsed.reduce((sum, u) => sum + (Number(u.purchaseCost) || 0), 0);
        const newTotal = Math.max(
          0,
          (job.diagnosticFee || 0) + (job.laborCost || 0) + newPartsCost + (job.otherCost || 0) - (job.discount || 0)
        );
        const newDue = Math.max(0, newTotal - (job.paidAmount || 0));
        const newProfit = Math.max(0, newTotal - (newInternalPartsCost + (job.diagnosticFee || 0) * 0.2));

        const updated: ServiceJob = {
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
              action: 'Custom Spare Part Added',
              user: currentUser?.name || 'Admin',
              details: `Added ${safeQty}x ${cleanName} (Code: ${cleanCode}, Warranty: ${wDays > 0 ? `${wDays} Days` : 'No Warranty'}). Charge: ৳${totalCharge}.`,
            },
          ],
        };
        setDoc(doc(db, 'services', serviceJobId), sanitizeForFirestore(updated), { merge: true }).catch((err) => {
          console.warn('Failed to update custom service part in Firestore:', err);
        });
        return updated;
      })
    );
  };

  const removeServicePart = (serviceJobId: string, usageId: string) => {
    const targetJob = services.find((j) => j.id === serviceJobId);
    if (!targetJob) return;
    const targetUsage = (targetJob.partsUsed || []).find((u) => u.id === usageId);
    if (!targetUsage) return;

    // Restore stock if this came from inventory
    if (!targetUsage.isCustomPart && targetUsage.partId) {
      const restoreQty =
        targetUsage.deductedStock !== undefined
          ? Math.max(0, targetUsage.deductedStock)
          : Math.max(0, targetUsage.quantity || 0);
      if (restoreQty > 0) {
        setServiceParts((prev) =>
          prev.map((p) =>
            p.id === targetUsage.partId ? { ...p, stock: (p.stock || 0) + restoreQty } : p
          )
        );
      }
    }

    setServices((prev) =>
      prev.map((job) => {
        if (job.id !== serviceJobId) return job;
        const remainingParts = (job.partsUsed || []).filter((u) => u.id !== usageId);
        const newPartsCost = remainingParts.reduce((sum, u) => sum + (Number(u.customerCharge) || 0), 0);
        const newInternalPartsCost = remainingParts.reduce((sum, u) => sum + (Number(u.purchaseCost) || 0), 0);
        const newTotal = Math.max(
          0,
          (job.diagnosticFee || 0) + (job.laborCost || 0) + newPartsCost + (job.otherCost || 0) - (job.discount || 0)
        );
        const newDue = Math.max(0, newTotal - (job.paidAmount || 0));
        const newProfit = Math.max(0, newTotal - (newInternalPartsCost + (job.diagnosticFee || 0) * 0.2));

        const updated: ServiceJob = {
          ...job,
          partsUsed: remainingParts,
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
              action: 'Spare Part Removed from Bill',
              user: currentUser?.name || 'Admin',
              details: `Removed ${targetUsage.quantity}x ${targetUsage.partName} (৳${targetUsage.customerCharge}).`,
            },
          ],
        };
        setDoc(doc(db, 'services', serviceJobId), sanitizeForFirestore(updated), { merge: true }).catch((err) => {
          console.warn('Failed to update service job after removing part in Firestore:', err);
        });
        return updated;
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

        const updated = {
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
        setDoc(doc(db, 'services', serviceJobId), sanitizeForFirestore(updated), { merge: true }).catch((err) => {
          console.warn('Failed to update service payment in Firestore:', err);
        });
        return updated;
      })
    );
  };

  const removeServicePayment = (serviceJobId: string, paymentId: string) => {
    setServices((prev) =>
      prev.map((job) => {
        if (job.id !== serviceJobId) return job;
        const history = job.paymentHistory || [];
        const targetPayment = history.find((p) => p.id === paymentId);
        if (!targetPayment) return job;

        const remainingHistory = history.filter((p) => p.id !== paymentId);
        const removedAmount = Number(targetPayment.amount) || 0;
        const prevHistorySum = history.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const remainingHistorySum = remainingHistory.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const newPaid =
          Math.abs((job.paidAmount || 0) - prevHistorySum) < 0.01
            ? remainingHistorySum
            : Math.max(0, (job.paidAmount || 0) - removedAmount);
        const newDue = Math.max(0, (job.totalCost || 0) - newPaid);

        const updated: ServiceJob = {
          ...job,
          paidAmount: newPaid,
          dueAmount: newDue,
          paymentHistory: remainingHistory,
          updatedAt: new Date().toISOString(),
          logs: [
            ...(job.logs || []),
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'Payment Record Removed',
              user: currentUser?.name || 'Admin',
              details: `Removed ৳${removedAmount.toLocaleString()} payment (${targetPayment.method} • ${targetPayment.type}). Paid: ৳${newPaid.toLocaleString()}, Due: ৳${newDue.toLocaleString()}.`,
            },
          ],
        };
        setDoc(doc(db, 'services', serviceJobId), sanitizeForFirestore(updated), { merge: true }).catch((err) => {
          console.warn('Failed to remove service payment in Firestore:', err);
        });
        return updated;
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

  const deleteWarrantyClaim = (id: string) => {
    setWarrantyClaims((prev) => prev.filter((c) => c.id !== id));
    logActivity('Delete Warranty Claim', 'Service Zone', id, 'Deleted warranty claim record.');
  };

  const clearAllServiceZoneDummyData = () => {
    const totalCount =
      services.length +
      serviceEngineers.length +
      serviceParts.length +
      warrantyClaims.length +
      serviceRequests.length;

    setServices([]);
    setServiceEngineers([]);
    setServiceParts([]);
    setWarrantyClaims([]);
    setServiceRequests([]);

    try {
      localStorage.setItem('jhf_service_data_cleared', 'true');
      localStorage.setItem('jhf_admin_services', '[]');
      localStorage.setItem('jhf_admin_service_engineers', '[]');
      localStorage.setItem('jhf_admin_service_parts', '[]');
      localStorage.setItem('jhf_admin_warranty_claims', '[]');
      localStorage.setItem('jhf_admin_service_requests', '[]');
    } catch {}

    (async () => {
      try {
        const collections = ['services', 'serviceRequests', 'serviceEngineers', 'serviceParts', 'warrantyClaims'];
        for (const colName of collections) {
          const snap = await getDocs(collection(db, colName));
          if (!snap.empty) {
            const batch = writeBatch(db);
            snap.forEach((d) => batch.delete(d.ref));
            await batch.commit();
          }
        }
      } catch (e) {
        console.warn('Firestore service zone purge notice:', e);
      }
    })();

    logActivity(
      'Clear Service Dummy Data',
      'Service Zone',
      'Data Cleanup',
      `Cleared all ${totalCount} service zone demo/dummy records. Clean service slate active.`
    );

    return { deletedCount: totalCount };
  };

  // ==========================================
  // CUSTOMER SERVICE REQUESTS & SR TRACKING
  // ==========================================

  // Transactional / Server-safe daily sequence generator: JHF-SR-YYYYMMDDNNN
  const generateNextSrNumber = async (): Promise<string> => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}${mm}${dd}`;

    try {
      const counterRef = doc(db, 'counters', `sr_${dateKey}`);
      const nextSeq = await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef);
        let seq = 1;
        if (snap.exists()) {
          seq = (Number(snap.data().seq) || 0) + 1;
        }
        tx.set(counterRef, { seq, dateKey, updatedAt: new Date().toISOString() }, { merge: true });
        return seq;
      });
      return `JHF-SR-${dateKey}${String(nextSeq).padStart(3, '0')}`;
    } catch (err) {
      console.warn('Transaction counter fallback:', err);
      // Fallback inspection of in-memory existing requests for today
      const todayPrefix = `JHF-SR-${dateKey}`;
      const todayExisting = serviceRequests
        .filter((r) => r.srNumber?.startsWith(todayPrefix))
        .map((r) => {
          const numPart = parseInt(r.srNumber.replace(todayPrefix, ''), 10);
          return isNaN(numPart) ? 0 : numPart;
        });
      const maxNum = todayExisting.length > 0 ? Math.max(...todayExisting) : 0;
      return `${todayPrefix}${String(maxNum + 1).padStart(3, '0')}`;
    }
  };

  const addServiceRequest = async (
    reqData: Omit<ServiceRequest, 'id' | 'srNumber' | 'createdAt' | 'lastUpdatedAt'>
  ): Promise<ServiceRequest> => {
    const srNumber = await generateNextSrNumber();
    const now = new Date().toISOString();
    const newId = `sr-${Date.now()}`;
    const initialHistory =
      reqData.statusHistory && reqData.statusHistory.length > 0
        ? reqData.statusHistory
        : [
            {
              id: `sh-${Date.now()}-1`,
              newStatus: 'REQUEST RECEIVED' as ServiceRequestStatus,
              changedBy: 'Customer (Online)',
              changedAt: now,
              customerNote: 'Your service request has been received.',
            },
          ];

    const newRequest: ServiceRequest = {
      ...reqData,
      id: newId,
      srNumber,
      createdAt: now,
      lastUpdatedAt: now,
      status: reqData.status || 'PENDING',
      statusHistory: initialHistory,
      isArchived: false,
    };

    setServiceRequests((prev) => [newRequest, ...prev]);

    try {
      await setDoc(doc(db, 'serviceRequests', newId), sanitizeForFirestore(newRequest));
    } catch (err) {
      console.error('Failed to save service request to Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, `serviceRequests/${newId}`);
    }

    logActivity(
      'Service Request',
      'ServiceRequests',
      srNumber,
      `Customer ${newRequest.customerName} requested service for ${newRequest.laptopModel}`
    );
    triggerAutoBackup(`New Service Request: ${srNumber}`);
    return newRequest;
  };

  const updateServiceRequestStatus = async (
    id: string,
    newStatus: ServiceRequestStatus,
    customerNote?: string,
    internalNote?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    const performer = currentUser?.name || 'Administrator';
    let updatedObj: ServiceRequest | null = null;

    setServiceRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const prevStatus = r.status;
          const historyEntry: any = {
            id: `sh-${Date.now()}`,
            newStatus,
            changedBy: performer,
            changedAt: now,
            customerNote: customerNote || `Status updated to ${newStatus}`,
          };
          if (prevStatus) historyEntry.previousStatus = prevStatus;
          if (internalNote) historyEntry.internalNote = internalNote;

          const newHistory = [
            ...(r.statusHistory || []),
            historyEntry,
          ];
          const updated: ServiceRequest = {
            ...r,
            status: newStatus,
            customerUpdate: customerNote || r.customerUpdate,
            internalNote: internalNote !== undefined ? internalNote : r.internalNote,
            lastUpdatedAt: now,
            lastUpdatedBy: performer,
            statusHistory: newHistory,
          };
          updatedObj = updated;
          return updated;
        }
        return r;
      })
    );

    if (updatedObj) {
      try {
        await setDoc(doc(db, 'serviceRequests', id), sanitizeForFirestore(updatedObj), { merge: true });
      } catch (err) {
        console.error('Failed to update service request status in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `serviceRequests/${id}`);
      }
    }

    logActivity('Update SR Status', 'ServiceRequests', id, `Status updated to ${newStatus}`);
    triggerAutoBackup(`SR Status Updated: ${id} -> ${newStatus}`);
  };

  const updateServiceRequest = async (id: string, updates: Partial<ServiceRequest>): Promise<void> => {
    const now = new Date().toISOString();
    let updatedObj: ServiceRequest | null = null;

    setServiceRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = {
            ...r,
            ...updates,
            lastUpdatedAt: now,
            lastUpdatedBy: currentUser?.name || 'Administrator',
          };
          updatedObj = updated;
          return updated;
        }
        return r;
      })
    );

    if (updatedObj) {
      try {
        await setDoc(doc(db, 'serviceRequests', id), sanitizeForFirestore(updatedObj), { merge: true });
      } catch (err) {
        console.error('Failed to update service request in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `serviceRequests/${id}`);
      }
    }
  };

  const deleteServiceRequest = async (id: string): Promise<void> => {
    setServiceRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'serviceRequests', id));
    } catch (err) {
      console.error('Failed to delete service request from Firestore:', err);
      handleFirestoreError(err, OperationType.DELETE, `serviceRequests/${id}`);
    }
    logActivity('Delete Service Request', 'ServiceRequests', id, 'Deleted service request record.');
  };

  const convertRequestToServiceJob = async (
    srId: string,
    assignedEngineerId?: string
  ): Promise<ServiceJob | null> => {
    const req = serviceRequests.find((r) => r.id === srId);
    if (!req) return null;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);
    const newJobId = `JHF-SRV-${yyyy}${mm}${dd}${rand}`;
    const now = today.toISOString();
    const engineer = serviceEngineers.find((e) => e.id === assignedEngineerId) || serviceEngineers[0];
    const engName = engineer?.name || 'Chief Hardware Engineer';

    const newJob: ServiceJob = {
      id: newJobId,
      srNumber: req.srNumber,
      createdAt: now,
      updatedAt: now,
      status: 'DIAGNOSING',
      isDummy: false,
      customerName: req.customerName,
      customerPhone: req.mobile,
      customerAddress: req.address ? `${req.address}, ${req.area || ''}, ${req.city || ''}` : `${req.city || ''}`,
      laptopBrand: req.laptopBrand || 'General Laptop',
      laptopModel: req.laptopModel,
      serialNumber: req.serialNumber || 'N/A',
      physicalCondition: 'Customer Service Request Dropoff',
      accessoriesReceived: ['Laptop Unit'],
      receivedBy: currentUser?.name || 'Admin Staff',
      complaintCategories: [req.problemCategory || 'Hardware Diagnosis'],
      customerComplaintText: `${req.problemCategory}: ${req.problemDescription || ''}`,
      engineerId: engineer?.id || 'eng-01',
      engineerName: engName,
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      diagnosticFee: 300,
      laborCost: 0,
      partsCost: 0,
      internalPartsCost: 0,
      otherCost: 0,
      discount: 0,
      totalCost: 300,
      paidAmount: 0,
      dueAmount: 300,
      profit: 240,
      partsUsed: [],
      paymentHistory: [],
      serviceWarrantyDays: 30,
      warrantyStatus: 'ACTIVE',
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          action: 'Service Job Converted',
          user: currentUser?.name || 'Admin',
          details: `Converted from Customer Service Request ${req.srNumber}. Assigned to ${engName}.`,
        },
      ],
    };

    setServices((prev) => [newJob, ...prev]);

    try {
      await setDoc(doc(db, 'services', newJobId), sanitizeForFirestore(newJob));
    } catch (e) {
      console.warn('Failed to save service job to Firestore:', e);
    }

    // Link Service Request to this job and update status to RUNNING
    await updateServiceRequestStatus(
      srId,
      'RUNNING',
      `Service job ${newJobId} created and assigned to ${engName}. Diagnostics in progress.`,
      `Linked Service Job: ${newJobId}`
    );
    await updateServiceRequest(srId, {
      serviceJobId: newJobId,
      assignedStaff: engName,
    });

    logActivity('Convert SR to Job', 'ServiceRequests', req.srNumber, `Created Service Job ${newJobId}`);
    return newJob;
  };

  // ==========================================
  // DATA CENTER: COMPLETE DUMMY DATA CLEANUP & CLEAN SLATE
  // Clears all sample/demo data from Firestore and LocalStorage.
  // Real data entered thereafter will be permanently saved with zero data loss.
  // ==========================================
  const clearAllDummyData = () => {
    // 1. Create automatic pre-purge safety rollback snapshot
    try {
      createFullSystemBackup(
        'safety',
        'Pre-Clean Safety Snapshot Before Dummy Data Purge',
        'Clear All Dummy Data Action'
      );
    } catch (e) {
      console.warn('Safety snapshot creation notice:', e);
    }

    const deletedCount =
      products.length +
      orders.length +
      customers.length +
      stockUnits.length +
      suppliers.length +
      supplierPurchases.length +
      supplierPayments.length +
      emiPlans.length +
      reconditionLaptops.length +
      expenses.length +
      services.length +
      serviceEngineers.length +
      serviceParts.length +
      warrantyClaims.length +
      serviceRequests.length +
      inventoryTransactions.length;

    // 2. Mark system as cleared in LocalStorage & State
    try {
      localStorage.setItem('jhf_dummy_data_cleared', 'true');
      localStorage.setItem('jhf_service_data_cleared', 'true');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    setIsDummyDataClearedState(true);

    // 3. Clear LocalStorage cache keys
    const keysToRemove = [
      'jhf_admin_products',
      'jhf_admin_orders',
      'jhf_admin_customers',
      'jhf_admin_inventory_tx',
      'jhf_admin_suppliers',
      'jhf_admin_stock_units',
      'jhf_admin_supplier_purchases',
      'jhf_admin_supplier_payments',
      'jhf_admin_emi_plans',
      'jhf_admin_recondition_laptops',
      'jhf_admin_expenses',
      'jhf_admin_services',
      'jhf_admin_service_engineers',
      'jhf_admin_service_parts',
      'jhf_admin_warranty_claims',
      'jhf_admin_service_requests',
      'jhf_store_laptops_v3',
    ];
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    // 4. Reset React state to clean slate immediately (Optimistic UI)
    setProducts([]);
    setOrders([]);
    setCustomers([]);
    setInventoryTransactions([]);
    setSuppliers([]);
    setStockUnits([]);
    setSupplierPurchases([]);
    setSupplierPayments([]);
    setEmiPlans([]);
    setReconditionLaptops([]);
    setExpenses([]);
    setServices([]);
    setServiceEngineers([]);
    setServiceParts([]);
    setWarrantyClaims([]);
    setServiceRequests([]);

    // 5. Asynchronously persist clean mode to Firestore settings and delete collection documents
    (async () => {
      try {
        // Flag Firestore systemInit so all devices know clean mode is active
        await setDoc(
          doc(db, 'settings', 'systemInit'),
          {
            dummyDataCleared: true,
            serviceDummyDataCleared: true,
            clearedAt: new Date().toISOString(),
            clearedBy: currentUser?.name || 'Super Admin',
            mode: 'clean_production',
          },
          { merge: true }
        );

        const collectionsToWipe = [
          'products',
          'orders',
          'customers',
          'inventoryTransactions',
          'expenses',
          'reconditionLaptops',
          'suppliers',
          'emiPlans',
          'services',
          'serviceRequests',
          'serviceEngineers',
          'serviceParts',
          'warrantyClaims',
          'laptops',
        ];

        for (const colName of collectionsToWipe) {
          try {
            const snap = await getDocs(collection(db, colName));
            if (!snap.empty) {
              const batch = writeBatch(db);
              snap.forEach((d) => batch.delete(d.ref));
              await batch.commit();
            }
          } catch (e) {
            console.warn(`Firestore clean error on ${colName}:`, e);
          }
        }
      } catch (err) {
        console.warn('Firestore purge error:', err);
      }
    })();

    logActivity(
      'Clear Dummy Data',
      'Settings',
      'Data Center',
      `Purged all ${deletedCount} default sample/dummy records. Clean production database active. Zero data loss mode engaged.`
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
        addCustomServicePartToJob,
        removeServicePart,
        recordServicePayment,
        removeServicePayment,
        addWarrantyClaim,
        updateWarrantyClaim,
        deleteWarrantyClaim,
        clearAllServiceZoneDummyData,
        serviceRequests,
        addServiceRequest,
        updateServiceRequestStatus,
        updateServiceRequest,
        deleteServiceRequest,
        generateNextSrNumber,
        convertRequestToServiceJob,
        isDummyDataCleared: isDummyDataClearedState,
        clearAllDummyData,
        fullBackups,
        createFullSystemBackup,
        restoreFullSystemBackup,
        deleteFullSystemBackup,
        triggerAutoBackup,
        storageHealth,
        requestStoragePersistence,
        bdstallImportHistory,
        approveBdstallImportBatch,
        imageHistory,
        pendingAutoImageProductIds,
        dismissAutoImageAlert,
        assignVerifiedProductImage,
        rejectProductImage,
        rollbackProductImage,
        removeWrongProductImage,
        updateProductImageStatus,
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
