export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'sales_staff'
  | 'inventory_staff'
  | 'customer_support'
  | 'content_editor'
  | 'viewer';

export type AdminRole = UserRole;

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'disabled' | 'pending';
  photoURL?: string;
  createdAt: string;
  lastLogin?: string;
  activityCount?: number;
}

export type LaptopCondition = 'Brand New' | 'Dubai Grade A++' | 'Grade A+' | 'Grade A' | 'Refurbished';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: 'Lenovo' | 'HP' | 'Dell' | 'Apple' | 'Asus' | 'Acer' | 'Other';
  model: string;
  category: 'Business Laptop' | 'Ultrabook' | 'Workstation' | 'Gaming Laptop' | 'Student / Office';
  condition: LaptopCondition;
  
  // Specifications
  processor: string;
  generation: string;
  ram: string; // e.g., "16GB DDR4"
  storage: string; // e.g., "512GB NVMe SSD"
  graphics: string; // e.g., "Intel Iris Xe"
  display: string; // e.g., "14\" FHD IPS Anti-Glare"
  screenSize: string; // e.g., "14.0\""
  resolution: string; // e.g., "1920x1080"
  batteryCondition: string; // e.g., "Good 4-5 Hours"
  keyboardCondition: string; // e.g., "Backlit Original"
  bodyCondition: string; // e.g., "Scratchless Metal"
  operatingSystem: string; // e.g., "Windows 11 Pro Genuine"
  includedAccessories: string[]; // e.g., ["Original Charger", "Power Cord", "Backpack", "Wireless Mouse"]
  
  // Pricing & Financials
  purchasePrice: number; // Cost Price (for profit calc)
  sellingPrice: number;
  discountPrice?: number;
  profitMargin?: number; // Calculated (selling - purchase)
  
  // Inventory
  stockQuantity: number;
  minimumStockAlert: number;
  warranty: string; // e.g., "1 Month Replacement + 5 Years Free Service"
  
  // Descriptions & Media
  shortDescription: string;
  specifications: string;
  images: string[];
  status: 'published' | 'draft' | 'out_of_stock' | 'archived';
  isFeatured: boolean;

  // Extended Smart Specs & Hardware Telemetry
  series?: string;
  serialNumber?: string;
  grade?: 'A++' | 'A+' | 'A' | 'B+' | 'B' | 'C';
  batteryHealth?: number;
  batteryCycleCount?: number;
  batteryBackupHours?: string;
  batteryStatus?: 'Excellent' | 'Good' | 'Fair' | 'Needs Replacement';
  repairCost?: number;
  otherCost?: number;
  totalCost?: number;
  ramType?: string;
  storageType?: string;
  refreshRate?: string;
  vram?: string;
  ports?: string;
  camera?: string;
  keyboard?: string;
  wifi?: string;
  bluetooth?: string;
  barcode?: string;
  specificationSource?: 'Model Catalog' | 'Admin Edited' | 'Bulk Imported';
  
  // Soft Delete
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
  
  // Dummy / Demo Data Marker
  isDummy?: boolean;
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type OrderStatus =
  | 'new'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_delivery'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Store Pickup Cash';
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  purchaseCost: number; // Snapshot of cost at time of sale
  quantity: number;
  totalPrice: number;
  image?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note: string;
  performedBy: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., JHF-2026-1042
  createdAt: string;
  updatedAt: string;
  
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  district: string;
  
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  orderStatus: OrderStatus;
  
  courierName?: 'Steadfast Courier' | 'Pathao' | 'RedX' | 'Sundarban Courier' | 'SA Paribahan' | 'In-Store Pickup';
  trackingNumber?: string;
  
  adminNotes?: string;
  customerNotes?: string;
  timeline: OrderTimelineEvent[];
  createdBy: string;
  isDummy?: boolean;
}

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  district: string;
  city: string;
  totalOrders: number;
  totalSpending: number;
  lastOrderDate?: string;
  accountStatus: 'active' | 'vip' | 'blocked';
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isDummy?: boolean;
}

export type StockOutReason =
  | 'Sale'
  | 'Damage'
  | 'Return to Supplier'
  | 'Demo Unit'
  | 'Office Use'
  | 'Lost'
  | 'Adjustment'
  | 'Other';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalCost?: number;
  supplierName?: string;
  reason: StockOutReason | 'Restock' | 'Initial Inventory' | 'Physical Audit Correction' | string;
  referenceNumber?: string;
  notes?: string;
  performedBy: string;
  recordedByName?: string;
  timestamp: string;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  address: string;
  productsSupplied: string[];
  totalPurchases?: number;
  totalPaid?: number;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
  isDummy?: boolean;
}

export interface Expense {
  id: string;
  date: string;
  category:
    | 'Rent'
    | 'Electricity'
    | 'Internet'
    | 'Transport'
    | 'Salary'
    | 'Marketing'
    | 'Repair'
    | 'Office Supplies'
    | 'Courier Charge'
    | 'Other';
  description: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  createdBy: string;
  createdAt: string;
  isDummy?: boolean;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  adminEmail: string;
  adminRole: UserRole;
  action: string;
  module: 'Products' | 'Orders' | 'Inventory' | 'Customers' | 'Finance' | 'Users' | 'Settings' | 'Auth';
  target: string;
  details: string;
  timestamp: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'low_stock' | 'customer' | 'payment' | 'system';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface WebsiteSettings {
  businessName: string;
  tagline?: string;
  websiteUrl: string;
  location: string;
  branchOffice?: string;
  mainOffice?: string;
  primaryWhatsApp: string;
  secondaryPhone: string;
  email: string;
  facebookUrl: string;
  youtubeUrl: string;
  deliveryTimeDhaka: string;
  deliveryTimeOutside: string;
  defaultWarranty: string;
  lowStockThreshold: number;
}

export interface BloggerSettings {
  blogId: string;
  apiKey?: string;
  clientId?: string;
  autoSyncToBlogger: boolean;
}

export type StockStatus = 'Available' | 'Sold' | 'In Service' | 'Reserved';

export interface StockUnit {
  id: string;
  productId: string;
  modelName: string;
  serialNumber: string;
  configuration: string; // e.g. "i5 11th Gen / 16GB RAM / 512GB NVMe SSD"
  condition: LaptopCondition;
  supplierId: string;
  supplierName: string;
  buyPrice: number;
  sellingPrice: number;
  status: StockStatus;
  soldToCustomer?: string;
  invoiceNo?: string;
  soldAt?: string;
  warrantyPeriod?: string;
  notes?: string;
  createdAt: string;
}

export type ERPPaymentMethod =
  | 'Cash'
  | 'Bkash'
  | 'Nagad'
  | 'Rocket'
  | 'Bank Account'
  | 'POS'
  | 'Installment (EMI)';

export interface SupplierPurchase {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceRef: string;
  purchaseDate: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalPurchase: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: ERPPaymentMethod;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'Bank Account' | 'Bkash' | 'Nagad' | 'Rocket' | 'Cash' | 'POS';
  transactionRef?: string;
  purchaseInvoiceRef?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface EmiPayment {
  id: string;
  emiPlanId: string;
  paymentDate: string;
  installmentNumber: number;
  amountPaid: number;
  remainingAfterPayment: number;
  paymentMethod: 'Cash' | 'Bkash' | 'Nagad' | 'Rocket' | 'Bank Account' | 'POS';
  transactionRef?: string;
  receiptNo: string;
  collectedBy: string;
  notes?: string;
}

export interface EmiPlan {
  id: string;
  invoiceNo: string; // Auto JHF-YYYYMMDD-XXXX
  saleDate: string;
  
  // Customer Details
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNid?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  
  // Product Details
  productId?: string;
  productModel: string;
  serialNumber: string;
  configuration: string;
  supplierName: string;
  salesPerson: string;
  
  // Financials
  buyPrice: number;
  sellPrice: number;
  profit: number; // sellPrice - buyPrice
  downPayment: number; // 1st Installment = Instant Payment
  totalDue: number; // sellPrice - downPayment
  paidAmount: number; // downPayment + sum(payments)
  remainingDue: number; // sellPrice - paidAmount
  
  // Plan
  planMonths: 2 | 3 | 4 | 6 | 9 | 12; // Flexible Installment Plan
  monthlyInstallment: number;
  nextDueDate: string;
  estimatedFinalPayDate: string;
  isOverdue: boolean;
  status: 'active' | 'completed' | 'overdue';
  
  paymentHistory: EmiPayment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackupLog {
  id: string;
  filename: string;
  timestamp: string;
  type: 'export' | 'restore';
  sizeBytes?: number;
  recordCounts: {
    products: number;
    stockUnits: number;
    orders: number;
    emiPlans: number;
    suppliers: number;
    supplierPurchases: number;
    customers: number;
  };
  status: 'success' | 'failed';
  performedBy: string;
}

export interface ReconditionLaptop {
  id: string;
  code: string; // e.g., REC-101
  title: string;
  brand: 'Lenovo' | 'HP' | 'Dell' | 'Apple' | 'Asus' | 'Acer' | 'Other';
  model: string;
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  display: string;
  batteryBackup: string;
  physicalCondition: 'A+ Grade (Mint/Scratchless)' | 'A Grade (Minor Signs of Use)' | 'B Grade (Normal Used)' | 'Imported Dubai Batch';
  conditionDetails?: string;
  includedAccessories: string[];
  serialNumber?: string;
  sourceSupplier?: string;
  
  // Financials & Pricing (buy, sell, sold profit)
  buyPrice: number; // Purchase Cost (৳)
  sellPrice: number; // Regular Selling Price (৳)
  offerPrice?: number; // Discount Offer Price (৳)
  soldPrice?: number; // Actual Sold Price (৳)
  
  // Status
  status: 'available' | 'sold' | 'booked';
  soldDate?: string;
  soldToCustomer?: string;
  
  // Media & Metadata
  images: string[];
  warranty: string;
  shortNote?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadEvent {
  id: string;
  timestamp: string;
  softwareName: string;
  category: 'Software' | 'Testing Tools' | 'Operating Systems' | 'Drivers' | 'Utilities';
  version: string;
  country: string;
  region: string;
  ip: string;
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  status: 'success' | 'failed';
  fileSizeBytes: number;
  sourceUrl?: string;
  sessionId: string;
  userId?: string;
  userEmail?: string;
}

export type SecurityRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  ip: string;
  region: string;
  event: string;
  risk: SecurityRiskLevel;
  user?: string;
  downloadItem?: string;
  actionTaken: 'Monitored' | 'Flagged' | 'Rate Limited' | 'Temporarily Blocked' | 'Dismissed';
  notes?: string;
}

export interface SecurityVerificationRecord {
  id: string;
  timestamp: string;
  associatedAction: string;
  userConsentGiven: boolean;
  imageDataUri: string; // Captured with explicit user permission
  retentionDays: 7 | 30 | 90;
  retentionExpiryDate: string;
  ip: string;
  status: 'active' | 'expired' | 'purged';
}

export interface CustomerReview {
  id: string;
  targetId?: string; // Product id or Software title
  targetType?: 'product' | 'software' | 'tool' | 'os' | 'laptop' | string;
  targetTitle?: string;
  targetName?: string; // Compatible alias
  customerName: string;
  customerEmail?: string;
  rating: number; // 1 to 5
  reviewText?: string;
  comment?: string; // Compatible alias
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
  adminReply?: string;
  isVerifiedPurchase?: boolean;
  verifiedPurchase?: boolean; // Compatible alias
  isDummy?: boolean;
}

export interface ToolCommentReply {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ToolComment {
  id: string;
  targetId?: string;
  targetTitle?: string;
  toolName?: string; // Compatible alias
  authorName?: string;
  userName?: string; // Compatible alias
  zone?: string;
  content?: string;
  comment?: string; // Compatible alias
  createdAt: string;
  status: 'approved' | 'pending' | 'hidden' | 'flagged';
  likes?: number;
  replies?: ToolCommentReply[];
  isDummy?: boolean;
}

// ==========================================
// JHF SERVICE ZONE ENTERPRISE ERP TYPES
// ==========================================

export type ServiceJobStatus =
  | 'RECEIVED'
  | 'DIAGNOSING'
  | 'ESTIMATE READY'
  | 'CUSTOMER APPROVAL'
  | 'WAITING FOR PARTS'
  | 'IN REPAIR'
  | 'TESTING'
  | 'READY FOR DELIVERY'
  | 'DELIVERED'
  | 'WARRANTY RETURN'
  | 'CANCELLED';

export type ServiceStatus = ServiceJobStatus;

export interface ServicePartUsage {
  id: string;
  partId: string;
  partName: string;
  partCode: string;
  quantity: number;
  purchaseCost: number; // Internal unit cost
  customerCharge: number; // Charged to customer
  warrantyDays: number;
  warrantyStart?: string;
  warrantyEnd?: string;
  serialNumber?: string;
}

export interface ServicePaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Store Pickup' | 'Other';
  type: 'Advance Payment' | 'Partial Payment' | 'Final Payment' | 'Adjustment';
  transactionId?: string;
  receivedBy: string;
  notes?: string;
}

export interface ServiceJob {
  id: string; // e.g. JHF-SRV-20260914001
  srNumber?: string; // Linked Service Request number e.g. JHF-SR-20260914001
  createdAt: string;
  updatedAt: string;
  status: ServiceJobStatus;
  isDummy?: boolean;

  // Customer Information
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;

  // Device Information
  laptopBrand: string;
  laptopModel: string;
  serialNumber?: string;
  assetId?: string;
  initialCondition?: string;
  accessoriesReceived: string[]; // ["Charger", "Power Cord", "Bag", "Mouse", etc.]
  passwordOrLockStatus?: string; // Lock password provided for testing
  physicalCondition?: string; // Scratches, dents, missing screws, etc.
  receivedBy: string;
  estimatedDeliveryDate: string;

  // Complaints & Problems
  complaintCategories: string[]; // ["No Power", "Overheating", etc.]
  customerComplaintText: string;

  // Diagnosis Details
  diagnosis?: string;
  rootCause?: string;
  testingPerformed?: string;
  observedProblem?: string;
  recommendedSolution?: string;
  technicianNotes?: string;

  // Assigned Engineer / Repair Shop
  engineerId?: string;
  engineerName?: string;
  engineerPhone?: string;
  serviceShopName?: string;
  engineerType?: 'internal' | 'external';
  assignedDate?: string;
  completedDate?: string;

  // Parts Used in Service
  partsUsed: ServicePartUsage[];

  // Financials & Cost Breakdown
  diagnosticFee: number;
  laborCost: number;
  partsCost: number; // Customer charge for all parts
  internalPartsCost: number; // Shop cost for all parts
  otherCost: number;
  discount: number;
  totalCost: number; // diagnosticFee + laborCost + partsCost + otherCost - discount
  paidAmount: number;
  dueAmount: number;
  profit: number; // totalCost - (diagnosticCost + internalPartsCost + laborCostPayout)

  // Payments History
  paymentHistory: ServicePaymentRecord[];

  // Warranty
  serviceWarrantyDays: number; // e.g. 30, 60, 90
  serviceWarrantyStart?: string;
  serviceWarrantyEnd?: string;
  warrantyStatus?: 'ACTIVE' | 'EXPIRED' | 'CLAIMED';

  // Completion & Handover
  workCompleted?: string;
  finalTestingResults?: string;
  deliveredDate?: string;
  deliveredBy?: string;
  customerFeedback?: string;

  // AI Service Summary
  aiSummary?: string;
  aiSummaryApproved?: boolean;

  // Activity Audit Log
  logs: {
    id: string;
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }[];
}

export interface ServicePart {
  id: string;
  name: string;
  code: string;
  category:
    | 'Display'
    | 'Keyboard'
    | 'Battery'
    | 'SSD / Storage'
    | 'RAM'
    | 'Adapter / Charger'
    | 'Cooling Fan / Paste'
    | 'Hinge / Casing'
    | 'Motherboard'
    | 'DC Jack'
    | 'Cables & Ports'
    | 'Other';
  stock: number;
  minStockAlert: number;
  purchaseCost: number;
  sellingPrice: number;
  supplier?: string;
  warrantyDays: number;
  serialNumber?: string;
  isDummy?: boolean;
  createdAt: string;
}

export interface ServiceEngineer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  shopName: string;
  shopAddress?: string;
  engineerType: 'internal' | 'external';
  specialization: string; // e.g. "Motherboard Chip-level & Power Rail", "Screen & Hinge Fabrication"
  status: 'active' | 'inactive';
  notes?: string;
  totalJobs?: number;
  completedJobs?: number;
  createdAt: string;
  isDummy?: boolean;
}

export interface WarrantyClaim {
  id: string; // e.g. JHF-WCL-20260914001
  originalServiceId: string;
  claimDate: string;
  customerName: string;
  customerPhone: string;
  laptopModel: string;
  serialNumber?: string;
  reportedProblem: string;
  diagnosis?: string;
  resolution?: string;
  status: 'PENDING' | 'INSPECTION' | 'REPAIRED' | 'REPLACED' | 'REJECTED';
  handledBy?: string;
  resolvedDate?: string;
  notes?: string;
  isDummy?: boolean;
}

// ==========================================
// SYSTEM BACKUP & RESTORE TYPES
// ==========================================

export interface FullSystemBackup {
  id: string; // JHF-BKP-YYYYMMDD-HHMMSS
  createdAt: string;
  applicationVersion: string;
  schemaVersion: string;
  type: 'full' | 'safety' | 'manual' | 'auto_change' | 'session_entry';
  note?: string;
  triggerReason?: string;
  sizeBytes: number;
  checksum: string;
  counts: {
    products: number;
    modelCatalog: number;
    inventory: number;
    orders: number;
    customers: number;
    adminUsers?: number;
    reviews: number;
    comments: number;
    services: number;
    serviceEngineers: number;
    serviceParts: number;
    warrantyClaims: number;
    suppliers: number;
    expenses: number;
    emiPlans: number;
    auditLogs: number;
  };
  data: {
    products: any[];
    modelCatalog: any[];
    orders: any[];
    customers: any[];
    adminUsers?: any[];
    inventoryTransactions: any[];
    suppliers: any[];
    stockUnits: any[];
    supplierPurchases: any[];
    supplierPayments: any[];
    emiPlans: any[];
    expenses: any[];
    services: any[];
    serviceEngineers: any[];
    serviceParts: any[];
    warrantyClaims: any[];
    reviews: any[];
    comments: any[];
    downloadEvents: any[];
    securityEvents: any[];
    reconditionLaptops?: any[];
    bloggerSettings?: any;
    activityLogs?: any[];
    notifications?: any[];
    settings: any;
  };
}

export * from '../types/serviceRequest';


