export interface WarrantyOption {
  days: number;
  label: string;
}

export const SPARE_PART_WARRANTY_OPTIONS: WarrantyOption[] = [
  { days: 0, label: 'No Warranty (0 Days)' },
  { days: 7, label: '7 Days Testing Warranty' },
  { days: 15, label: '15 Days Replacement' },
  { days: 30, label: '30 Days (1 Month)' },
  { days: 90, label: '90 Days (3 Months)' },
  { days: 180, label: '180 Days (6 Months)' },
  { days: 365, label: '365 Days (1 Year)' },
  { days: 730, label: '730 Days (2 Years)' },
];

export const SERVICE_WARRANTY_OPTIONS: WarrantyOption[] = [
  { days: 0, label: 'No Service Warranty (0 Days)' },
  { days: 15, label: '15 Days Checking Warranty' },
  { days: 30, label: '30 Days (Standard Service)' },
  { days: 60, label: '60 Days (Micro-soldering Guarantee)' },
  { days: 90, label: '90 Days (Major Overhaul)' },
  { days: 180, label: '180 Days (6 Months Extended)' },
  { days: 365, label: '365 Days (1 Year VIP)' },
];

export function formatWarrantyDays(days?: number | null, emptyLabel = 'No Warranty'): string {
  if (days === undefined || days === null || Number.isNaN(Number(days))) {
    return emptyLabel;
  }
  const n = Math.max(0, Math.round(Number(days)));
  if (n === 0) return 'No Warranty';
  if (n === 30) return '30 Days (1 Month)';
  if (n === 90) return '90 Days (3 Months)';
  if (n === 180) return '180 Days (6 Months)';
  if (n === 365) return '365 Days (1 Year)';
  if (n === 730) return '730 Days (2 Years)';
  return `${n} Days`;
}

export function computeWarrantyEndDate(startDateIso: string, warrantyDays?: number | null): string | undefined {
  const n = Math.max(0, Math.round(Number(warrantyDays ?? 0)));
  if (n <= 0) return undefined;
  const base = startDateIso ? new Date(startDateIso) : new Date();
  if (Number.isNaN(base.getTime())) return undefined;
  base.setDate(base.getDate() + n);
  return base.toISOString().split('T')[0];
}
