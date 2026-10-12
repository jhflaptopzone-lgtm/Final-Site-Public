export type ServiceRequestStatus =
  | 'REQUEST RECEIVED'
  | 'CONTACTING SOON'
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING FOR COURIER'
  | 'DELIVERY'
  | 'COMPLETED';

export const SERVICE_REQUEST_STATUSES: ServiceRequestStatus[] = [
  'REQUEST RECEIVED',
  'CONTACTING SOON',
  'PENDING',
  'RUNNING',
  'WAITING FOR COURIER',
  'DELIVERY',
  'COMPLETED',
];

export const SERVICE_REQUEST_STATUS_DETAILS: Record<
  ServiceRequestStatus,
  { label: string; description: string; color: string; bg: string; border: string; stepIndex: number }
> = {
  'REQUEST RECEIVED': {
    label: 'Request Received',
    description: 'Request has been successfully submitted and logged into our central queue.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    stepIndex: 1,
  },
  'CONTACTING SOON': {
    label: 'Contacting Soon',
    description: 'JHF service team is reviewing your device details and will contact you shortly.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    stepIndex: 2,
  },
  'PENDING': {
    label: 'Pending',
    description: 'Request is queued for workstation allocation or awaiting customer device delivery.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    stepIndex: 3,
  },
  'RUNNING': {
    label: 'Running',
    description: 'Service request is actively being handled by hardware engineers at our repair lab.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/30',
    stepIndex: 4,
  },
  'WAITING FOR COURIER': {
    label: 'Waiting for Courier',
    description: 'Laptop packaging is completed; waiting for courier pickup or transit arrangement.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30',
    stepIndex: 5,
  },
  'DELIVERY': {
    label: 'Delivery in Progress',
    description: 'Laptop / serviced unit is out for courier transit or ready for showroom collection.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/30',
    stepIndex: 6,
  },
  'COMPLETED': {
    label: 'Completed',
    description: 'Service request has been successfully completed, tested, and handed over.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    stepIndex: 7,
  },
};

export const PREDEFINED_LAPTOP_PROBLEMS = [
  'No Power',
  'No Display',
  'Blue Screen',
  'Slow Performance',
  'Overheating',
  'Battery Problem',
  'Charging Problem',
  'Keyboard Problem',
  'Touchpad Problem',
  'Screen Problem',
  'SSD/HDD Problem',
  'RAM Problem',
  'Wi-Fi Problem',
  'Bluetooth Problem',
  'USB Problem',
  'Audio Problem',
  'Camera Problem',
  'Windows Problem',
  'Driver Problem',
  'Software Problem',
  'Virus/Malware Cleanup',
  'Other',
] as const;

export const BANGLADESH_DISTRICTS = [
  'Dhaka',
  'Chattogram',
  'Gazipur',
  'Narayanganj',
  'Rajshahi',
  'Khulna',
  'Sylhet',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Bogura',
  'Kushtia',
  'Jessore',
  'Faridpur',
  'Tangail',
  'Pabna',
  'Dinajpur',
  'Cox\'s Bazar',
  'Feni',
  'Noakhali',
  'Brahmanbaria',
  'Jamalpur',
  'Sirajganj',
  'Natore',
  'Kishoreganj',
] as const;

export const POPULAR_LAPTOP_BRANDS = [
  'Lenovo ThinkPad',
  'HP EliteBook / ProBook',
  'Dell Latitude / XPS',
  'Apple MacBook',
  'Asus',
  'Acer',
  'MSI',
  'Toshiba / Dynabook',
  'Samsung',
  'Microsoft Surface',
  'Other Brand',
] as const;

export interface ServiceRequestStatusHistory {
  id: string;
  previousStatus?: ServiceRequestStatus;
  newStatus: ServiceRequestStatus;
  changedBy: string;
  changedAt: string;
  internalNote?: string;
  customerNote?: string;
}

export interface ServiceRequestAuditLog {
  id: string;
  srNumber: string;
  action:
    | 'REQUEST_CREATED'
    | 'REQUEST_VIEWED'
    | 'STATUS_CHANGED'
    | 'CUSTOMER_CONTACTED'
    | 'CUSTOMER_UPDATE_ADDED'
    | 'SERVICE_JOB_CREATED'
    | 'REQUEST_ARCHIVED'
    | 'REQUEST_RESTORED'
    | 'REQUEST_EDITED';
  user: string;
  timestamp: string;
  details?: string;
}

export interface ServiceRequest {
  id: string;
  srNumber: string; // JHF-SR-YYYYMMDDNNN
  createdAt: string;
  customerName: string;
  mobile: string;
  country: string;
  city: string; // City / District
  area?: string;
  address?: string;
  laptopBrand: string;
  laptopModel: string;
  serialNumber?: string;
  problemCategory: string;
  problemDescription: string;
  attachments: string[]; // Base64 or image URLs
  status: ServiceRequestStatus;
  customerUpdate?: string; // Public customer-facing update note
  internalNote?: string; // Admin-only internal note
  assignedStaff?: string;
  serviceJobId?: string; // Linked ServiceJob ID (e.g. JHF-SRV-2026-0001)
  lastUpdatedAt: string;
  lastUpdatedBy?: string;
  isArchived: boolean;
  preferredContactMethod?: 'WhatsApp' | 'Phone Call' | 'SMS' | 'Email';
  preferredServiceTime?: 'Morning' | 'Afternoon' | 'Evening' | 'Any Time';
  statusHistory?: ServiceRequestStatusHistory[];
}
