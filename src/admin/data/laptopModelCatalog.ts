import { Product, LaptopCondition } from '../types';

export interface LaptopCatalogModel {
  id: string;
  brand: 'HP' | 'Dell' | 'Lenovo' | 'Apple' | 'Asus' | 'Acer' | 'Other';
  series: string;
  model: string;
  fullName: string;
  generation: string;
  cpuFamily: string;
  defaultCpu: string;
  cpuOptions: string[];
  defaultRam: string;
  ramType: string;
  ramOptions: string[];
  defaultStorage: string;
  storageType: string;
  storageOptions: string[];
  display: string;
  screenSize: string;
  resolution: string;
  refreshRate: string;
  gpu: string;
  vram: string;
  os: string;
  batteryCondition: string;
  batteryHealth: number;
  cycleCount: number;
  estimatedBackup: string;
  condition: LaptopCondition;
  grade: 'A++' | 'A+' | 'A' | 'B+' | 'B' | 'C';
  warranty: string;
  suggestedPurchaseCost: number;
  suggestedSellingPrice: number;
  suggestedDiscount: number;
  category: Product['category'];
  ports: string;
  camera: string;
  keyboard: string;
  wifi: string;
  bluetooth: string;
  images: string[];
  variants: {
    name: string;
    cpu: string;
    ram: string;
    storage: string;
    purchaseCost: number;
    sellingPrice: number;
    discountPrice?: number;
  }[];
}

/**
 * Authentic business and ultrabook laptop catalog maintained for JHF Laptop Zone.
 * Contains verified specifications for HP EliteBook/ProBook, Dell Latitude/Precision/XPS,
 * Lenovo ThinkPad/IdeaPad, Apple MacBook, ASUS VivoBook/ZenBook, and Acer Aspire/Swift.
 */
export const LAPTOP_MODEL_CATALOG: LaptopCatalogModel[] = [
  // ==================== HP ELITEBOOK SERIES ====================
  {
    id: 'hp-elitebook-840-g8',
    brand: 'HP',
    series: 'EliteBook',
    model: '840 G8',
    fullName: 'HP EliteBook 840 G8',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 / i7 (11th Gen)',
    defaultCpu: 'Intel Core i5-1135G7 (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i5-1145G7 vPro (up to 4.40 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
      'Intel Core i7-1185G7 vPro (up to 4.80 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'DDR4-3200MHz',
    ramOptions: ['8GB', '16GB', '32GB', '64GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe', '2TB NVMe'],
    display: '14.0" Full HD (1920x1080) IPS Anti-Glare 400 nits Low Power',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics',
    vram: 'Shared Dynamic',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'HP Long Life 3-cell, 53 Wh Li-ion (Excellent)',
    batteryHealth: 94,
    cycleCount: 95,
    estimatedBackup: '5–7 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 42000,
    suggestedSellingPrice: 49500,
    suggestedDiscount: 1500,
    category: 'Business Laptop',
    ports: '2x Thunderbolt 4 Type-C (Power Delivery, DisplayPort 1.4), 2x USB 3.2 Gen 1, 1x HDMI 2.0b, 1x Audio combo',
    camera: '720p HD Privacy Webcam with IR Face Recognition',
    keyboard: 'HP Premium Spill-resistant Backlit Keyboard with drain',
    wifi: 'Intel Wi-Fi 6 AX201 (2x2)',
    bluetooth: 'Bluetooth 5.0',
    images: [
      'https://images.unsplash.com/photo-1544731612-de292439cc67?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-1135G7', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 38000, sellingPrice: 44500, discountPrice: 43500 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1135G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 42000, sellingPrice: 49500, discountPrice: 48000 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-1165G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 46000, sellingPrice: 54500, discountPrice: 53000 },
      { name: 'i7 / 32GB / 1TB', cpu: 'Intel Core i7-1185G7', ram: '32GB', storage: '1TB NVMe SSD', purchaseCost: 52000, sellingPrice: 62000, discountPrice: 59900 },
    ],
  },
  {
    id: 'hp-elitebook-840-g7',
    brand: 'HP',
    series: 'EliteBook',
    model: '840 G7',
    fullName: 'HP EliteBook 840 G7',
    generation: '10th Gen',
    cpuFamily: 'Intel Core i5 / i7 (10th Gen)',
    defaultCpu: 'Intel Core i5-10210U (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-10210U (up to 4.20 GHz)',
      'Intel Core i5-10310U vPro (up to 4.40 GHz)',
      'Intel Core i7-10510U (up to 4.90 GHz)',
      'Intel Core i7-10610U vPro (up to 4.90 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'DDR4-2666MHz',
    ramOptions: ['8GB', '16GB', '32GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" Full HD (1920x1080) IPS Anti-Glare 250 nits',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel UHD Graphics 620',
    vram: 'Shared Dynamic',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'HP 3-cell 53 Wh Li-ion (Healthy)',
    batteryHealth: 89,
    cycleCount: 140,
    estimatedBackup: '4–6 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 35000,
    suggestedSellingPrice: 41500,
    suggestedDiscount: 1000,
    category: 'Business Laptop',
    ports: '2x USB 3.1 Type-C (Thunderbolt 3), 2x USB 3.1 Gen 1, 1x HDMI 1.4b, 1x Headphone/mic',
    camera: '720p HD Camera with Privacy Shutter',
    keyboard: 'HP Spill-resistant Backlit Keyboard',
    wifi: 'Intel Wi-Fi 6 AX201',
    bluetooth: 'Bluetooth 5.0',
    images: [
      'https://images.unsplash.com/photo-1544731612-de292439cc67?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-10210U', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 32000, sellingPrice: 37500 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-10210U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 35000, sellingPrice: 41500 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-10510U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 39000, sellingPrice: 46000 },
    ],
  },
  {
    id: 'hp-elitebook-840-g6',
    brand: 'HP',
    series: 'EliteBook',
    model: '840 G6',
    fullName: 'HP EliteBook 840 G6',
    generation: '8th Gen',
    cpuFamily: 'Intel Core i5 / i7 (8th Gen)',
    defaultCpu: 'Intel Core i5-8265U (4 Cores, 8 Threads, up to 3.90 GHz)',
    cpuOptions: [
      'Intel Core i5-8265U (up to 3.90 GHz)',
      'Intel Core i5-8365U vPro (up to 4.10 GHz)',
      'Intel Core i7-8565U (up to 4.60 GHz)',
    ],
    defaultRam: '8GB',
    ramType: 'DDR4-2400MHz',
    ramOptions: ['8GB', '16GB', '32GB'],
    defaultStorage: '256GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" Full HD (1920x1080) IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel UHD Graphics 620',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'HP 3-cell 50 Wh (Good)',
    batteryHealth: 86,
    cycleCount: 180,
    estimatedBackup: '3.5–5 hours',
    condition: 'Dubai Grade A++',
    grade: 'A+',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 27000,
    suggestedSellingPrice: 32500,
    suggestedDiscount: 1000,
    category: 'Business Laptop',
    ports: '1x Thunderbolt Type-C, 2x USB 3.1 Gen 1, 1x HDMI 1.4b, 1x RJ-45 Ethernet, 1x Audio combo',
    camera: '720p HD Camera with Privacy Slider',
    keyboard: 'HP Backlit Keyboard with Pointing Stick',
    wifi: 'Intel Dual Band Wireless-AC 9560',
    bluetooth: 'Bluetooth 5.0',
    images: [
      'https://images.unsplash.com/photo-1544731612-de292439cc67?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-8265U', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 27000, sellingPrice: 32500 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-8265U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 30000, sellingPrice: 36000 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-8565U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 33000, sellingPrice: 39500 },
    ],
  },
  {
    id: 'hp-elitebook-840-g5',
    brand: 'HP',
    series: 'EliteBook',
    model: '840 G5',
    fullName: 'HP EliteBook 840 G5',
    generation: '8th Gen',
    cpuFamily: 'Intel Core i5 / i7 (8th Gen)',
    defaultCpu: 'Intel Core i5-8250U (4 Cores, 8 Threads, up to 3.40 GHz)',
    cpuOptions: [
      'Intel Core i5-8250U (up to 3.40 GHz)',
      'Intel Core i5-8350U vPro (up to 3.60 GHz)',
      'Intel Core i7-8550U (up to 4.00 GHz)',
    ],
    defaultRam: '8GB',
    ramType: 'DDR4-2400MHz',
    ramOptions: ['8GB', '16GB', '32GB'],
    defaultStorage: '256GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" Full HD (1920x1080) IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel UHD Graphics 620',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'HP 3-cell 50 Wh (Tested Good)',
    batteryHealth: 84,
    cycleCount: 210,
    estimatedBackup: '3–4.5 hours',
    condition: 'Dubai Grade A++',
    grade: 'A+',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 24000,
    suggestedSellingPrice: 28500,
    suggestedDiscount: 500,
    category: 'Business Laptop',
    ports: '1x Thunderbolt Type-C, 2x USB 3.1 Gen 1, 1x HDMI 1.4b, 1x RJ-45 Ethernet, 1x Docking connector',
    camera: '720p HD Camera with Privacy Shutter',
    keyboard: 'Backlit Spill-resistant Keyboard',
    wifi: 'Intel Dual Band Wireless-AC 8265',
    bluetooth: 'Bluetooth 4.2',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-8250U', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 24000, sellingPrice: 28500 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-8250U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 27000, sellingPrice: 32000 },
    ],
  },
  {
    id: 'hp-elitebook-840-g9',
    brand: 'HP',
    series: 'EliteBook',
    model: '840 G9',
    fullName: 'HP EliteBook 840 G9',
    generation: '12th Gen',
    cpuFamily: 'Intel Core i5 / i7 (12th Gen Alder Lake)',
    defaultCpu: 'Intel Core i5-1240P (12 Cores, 16 Threads, up to 4.40 GHz)',
    cpuOptions: [
      'Intel Core i5-1240P (up to 4.40 GHz)',
      'Intel Core i7-1260P (up to 4.70 GHz)',
      'Intel Core i7-1280P (up to 4.80 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'DDR5-4800MHz',
    ramOptions: ['16GB', '32GB', '64GB'],
    defaultStorage: '512GB NVMe Gen4 SSD',
    storageType: 'NVMe Gen4 SSD',
    storageOptions: ['512GB NVMe', '1TB NVMe', '2TB NVMe'],
    display: '14.0" WUXGA (1920x1200) 16:10 IPS Anti-Glare 400 nits',
    screenSize: '14.0"',
    resolution: '1920x1200',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics (96EU)',
    vram: 'Shared Dynamic',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'HP Long Life 3-cell 51 Wh Li-ion (Pristine)',
    batteryHealth: 98,
    cycleCount: 45,
    estimatedBackup: '6–8 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 55000,
    suggestedSellingPrice: 65000,
    suggestedDiscount: 2000,
    category: 'Business Laptop',
    ports: '2x Thunderbolt 4 Type-C, 2x USB 3.2 Gen 1, 1x HDMI 2.0, 1x Audio combo',
    camera: '5MP IR Auto-Tracking Camera with Privacy Shutter',
    keyboard: 'HP Premium Spill-resistant Backlit Keyboard',
    wifi: 'Intel Wi-Fi 6E AX211',
    bluetooth: 'Bluetooth 5.3',
    images: [
      'https://images.unsplash.com/photo-1544731612-de292439cc67?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1240P', ram: '16GB', storage: '512GB NVMe Gen4 SSD', purchaseCost: 55000, sellingPrice: 65000 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-1260P', ram: '16GB', storage: '512GB NVMe Gen4 SSD', purchaseCost: 61000, sellingPrice: 72000 },
      { name: 'i7 / 32GB / 1TB', cpu: 'Intel Core i7-1260P', ram: '32GB', storage: '1TB NVMe Gen4 SSD', purchaseCost: 68000, sellingPrice: 79500 },
    ],
  },
  {
    id: 'hp-elitebook-850-g8',
    brand: 'HP',
    series: 'EliteBook',
    model: '850 G8',
    fullName: 'HP EliteBook 850 G8 (15.6" Full Numpad)',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 / i7 (11th Gen)',
    defaultCpu: 'Intel Core i5-1135G7 (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'DDR4-3200MHz',
    ramOptions: ['8GB', '16GB', '32GB', '64GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '15.6" Full HD (1920x1080) IPS Anti-Glare 400 nits',
    screenSize: '15.6"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics',
    vram: 'Shared Dynamic',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'HP 3-cell 56 Wh Li-ion (Healthy)',
    batteryHealth: 92,
    cycleCount: 110,
    estimatedBackup: '5–7 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 44000,
    suggestedSellingPrice: 51500,
    suggestedDiscount: 1500,
    category: 'Business Laptop',
    ports: '2x Thunderbolt 4 Type-C, 2x USB 3.2 Gen 1, 1x HDMI 2.0b, 1x Audio combo',
    camera: '720p HD Privacy Camera with IR',
    keyboard: 'HP Premium Backlit Keyboard with Full Numeric Keypad',
    wifi: 'Intel Wi-Fi 6 AX201',
    bluetooth: 'Bluetooth 5.0',
    images: [
      'https://images.unsplash.com/photo-1544731612-de292439cc67?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1135G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 44000, sellingPrice: 51500 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-1165G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 48000, sellingPrice: 56500 },
    ],
  },
  {
    id: 'hp-probook-440-g8',
    brand: 'HP',
    series: 'ProBook',
    model: '440 G8',
    fullName: 'HP ProBook 440 G8',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 / i7 (11th Gen)',
    defaultCpu: 'Intel Core i5-1135G7 (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
    ],
    defaultRam: '8GB',
    ramType: 'DDR4-3200MHz',
    ramOptions: ['8GB', '16GB', '32GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" Full HD (1920x1080) IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'HP 3-cell 45 Wh Li-ion',
    batteryHealth: 90,
    cycleCount: 120,
    estimatedBackup: '4–6 hours',
    condition: 'Dubai Grade A++',
    grade: 'A+',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 36000,
    suggestedSellingPrice: 42500,
    suggestedDiscount: 1000,
    category: 'Business Laptop',
    ports: '1x USB 3.2 Gen 2 Type-C, 3x USB 3.2 Gen 1, 1x HDMI 1.4b, 1x RJ-45 Ethernet, 1x Audio combo',
    camera: '720p HD Camera with Shutter',
    keyboard: 'Spill-resistant Backlit Keyboard',
    wifi: 'Intel Wi-Fi 6 AX201',
    bluetooth: 'Bluetooth 5.0',
    images: ['https://images.unsplash.com/photo-1544731612-de292439cc67?w=800'],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-1135G7', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 33000, sellingPrice: 38500 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1135G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 36000, sellingPrice: 42500 },
    ],
  },

  // ==================== DELL LATITUDE & PRECISION & XPS ====================
  {
    id: 'dell-latitude-7420',
    brand: 'Dell',
    series: 'Latitude',
    model: '7420',
    fullName: 'Dell Latitude 7420 Carbon Fiber / Aluminum',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 / i7 (11th Gen)',
    defaultCpu: 'Intel Core i5-1145G7 vPro (4 Cores, 8 Threads, up to 4.40 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i5-1145G7 vPro (up to 4.40 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
      'Intel Core i7-1185G7 vPro (up to 4.80 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'LPDDR4x-4267MHz',
    ramOptions: ['16GB', '32GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe', '2TB NVMe'],
    display: '14.0" FHD (1920x1080) AG IPS Non-Touch ComfortView Plus 400 nits',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics',
    vram: 'Shared Dynamic',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Dell 4-cell 63 Wh ExpressCharge (Excellent)',
    batteryHealth: 95,
    cycleCount: 88,
    estimatedBackup: '6–8 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 43000,
    suggestedSellingPrice: 50500,
    suggestedDiscount: 1500,
    category: 'Business Laptop',
    ports: '2x Thunderbolt 4 Type-C (Power Delivery & DisplayPort), 1x USB 3.2 Gen 1 (PowerShare), 1x HDMI 2.0, 1x uSD 4.0 card reader, 1x Audio combo',
    camera: 'FHD IR Camera with ExpressSign-in & Privacy Shutter',
    keyboard: 'Single Pointing Backlit Spill-Proof Keyboard',
    wifi: 'Intel Wi-Fi 6 AX201 (2x2)',
    bluetooth: 'Bluetooth 5.1',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 16GB / 256GB', cpu: 'Intel Core i5-1145G7', ram: '16GB', storage: '256GB NVMe SSD', purchaseCost: 40000, sellingPrice: 47000 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1145G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 43000, sellingPrice: 50500, discountPrice: 49000 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-1185G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 47000, sellingPrice: 55000, discountPrice: 53500 },
      { name: 'i7 / 32GB / 1TB', cpu: 'Intel Core i7-1185G7', ram: '32GB', storage: '1TB NVMe SSD', purchaseCost: 54000, sellingPrice: 63500, discountPrice: 61500 },
    ],
  },
  {
    id: 'dell-latitude-7410',
    brand: 'Dell',
    series: 'Latitude',
    model: '7410',
    fullName: 'Dell Latitude 7410 Carbon Fiber',
    generation: '10th Gen',
    cpuFamily: 'Intel Core i5 / i7 (10th Gen Comet Lake)',
    defaultCpu: 'Intel Core i5-10310U vPro (4 Cores, 8 Threads, up to 4.40 GHz)',
    cpuOptions: [
      'Intel Core i5-10210U (up to 4.20 GHz)',
      'Intel Core i5-10310U vPro (up to 4.40 GHz)',
      'Intel Core i7-10610U vPro (up to 4.90 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'DDR4-2666MHz',
    ramOptions: ['8GB', '16GB', '32GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" FHD (1920x1080) AG Super Low Power 300 nits',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel UHD Graphics',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Dell 4-cell 52 Wh (Healthy)',
    batteryHealth: 88,
    cycleCount: 155,
    estimatedBackup: '5–6.5 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 36000,
    suggestedSellingPrice: 42500,
    suggestedDiscount: 1000,
    category: 'Business Laptop',
    ports: '2x Thunderbolt 3 Type-C, 2x USB 3.2 Gen 1, 1x HDMI 2.0, 1x Audio combo',
    camera: 'HD RGB/IR Camera with Camera Shutter',
    keyboard: 'Backlit English Keyboard',
    wifi: 'Intel Wi-Fi 6 AX201',
    bluetooth: 'Bluetooth 5.1',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-10310U', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 32000, sellingPrice: 38000 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-10310U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 36000, sellingPrice: 42500 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-10610U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 40000, sellingPrice: 47500 },
    ],
  },
  {
    id: 'dell-latitude-5420',
    brand: 'Dell',
    series: 'Latitude',
    model: '5420',
    fullName: 'Dell Latitude 5420',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 / i7 (11th Gen)',
    defaultCpu: 'Intel Core i5-1145G7 vPro (4 Cores, 8 Threads, up to 4.40 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i5-1145G7 vPro (up to 4.40 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'DDR4-3200MHz',
    ramOptions: ['8GB', '16GB', '32GB', '64GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" FHD (1920x1080) Anti-Glare 250 nits',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Dell 4-cell 63 Wh (Tested 92% Health)',
    batteryHealth: 92,
    cycleCount: 110,
    estimatedBackup: '5–7 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 39000,
    suggestedSellingPrice: 46000,
    suggestedDiscount: 1000,
    category: 'Business Laptop',
    ports: '2x Thunderbolt 4 Type-C, 2x USB 3.2 Gen 1, 1x HDMI 2.0, 1x RJ-45 Gigabit Ethernet, 1x Audio combo',
    camera: 'HD Camera with Privacy Shutter',
    keyboard: 'Single Pointing Backlit Spill-resistant Keyboard',
    wifi: 'Intel Wi-Fi 6 AX201',
    bluetooth: 'Bluetooth 5.1',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-1135G7', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 35000, sellingPrice: 41000 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1145G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 39000, sellingPrice: 46000 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-1165G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 43000, sellingPrice: 51000 },
    ],
  },
  {
    id: 'dell-latitude-7490',
    brand: 'Dell',
    series: 'Latitude',
    model: '7490',
    fullName: 'Dell Latitude 7490 Carbon Edition',
    generation: '8th Gen',
    cpuFamily: 'Intel Core i5 / i7 (8th Gen Quad-Core)',
    defaultCpu: 'Intel Core i5-8350U vPro (4 Cores, 8 Threads, up to 3.60 GHz)',
    cpuOptions: [
      'Intel Core i5-8250U (up to 3.40 GHz)',
      'Intel Core i5-8350U vPro (up to 3.60 GHz)',
      'Intel Core i7-8650U vPro (up to 4.20 GHz)',
    ],
    defaultRam: '8GB',
    ramType: 'DDR4-2400MHz',
    ramOptions: ['8GB', '16GB', '32GB'],
    defaultStorage: '256GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" FHD (1920x1080) WVA Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel UHD Graphics 620',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Dell 4-cell 60 Wh (Good)',
    batteryHealth: 85,
    cycleCount: 195,
    estimatedBackup: '3.5–5 hours',
    condition: 'Dubai Grade A++',
    grade: 'A+',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 24000,
    suggestedSellingPrice: 28500,
    suggestedDiscount: 500,
    category: 'Business Laptop',
    ports: '1x DisplayPort over USB Type-C, 3x USB 3.1 Gen 1, 1x HDMI 1.4, 1x RJ-45 Ethernet, 1x Audio combo',
    camera: 'HD Webcam with Noise Reduction Microphone',
    keyboard: 'Dual Pointing Backlit Keyboard',
    wifi: 'Intel Wireless-AC 8265',
    bluetooth: 'Bluetooth 4.2',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-8350U', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 24000, sellingPrice: 28500 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-8350U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 27500, sellingPrice: 32500 },
    ],
  },
  {
    id: 'dell-precision-5550',
    brand: 'Dell',
    series: 'Precision',
    model: '5550',
    fullName: 'Dell Precision 5550 Mobile Workstation',
    generation: '10th Gen',
    cpuFamily: 'Intel Core i7 / Xeon (10th Gen 6-Core / 8-Core)',
    defaultCpu: 'Intel Core i7-10750H (6 Cores, 12 Threads, up to 5.00 GHz)',
    cpuOptions: [
      'Intel Core i7-10750H (up to 5.00 GHz)',
      'Intel Core i7-10875H (8 Cores up to 5.10 GHz)',
      'Intel Xeon W-10855M (up to 5.10 GHz)',
    ],
    defaultRam: '32GB',
    ramType: 'DDR4-2933MHz',
    ramOptions: ['16GB', '32GB', '64GB'],
    defaultStorage: '1TB NVMe PCIe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['512GB NVMe', '1TB NVMe', '2TB NVMe'],
    display: '15.6" UltraSharp FHD+ (1920x1200) 100% sRGB 500 nits InfinityEdge',
    screenSize: '15.6"',
    resolution: '1920x1200',
    refreshRate: '60Hz',
    gpu: 'NVIDIA Quadro T1000 / T2000 (4GB GDDR6 Dedicated)',
    vram: '4GB GDDR6 Dedicated',
    os: 'Windows 11 Pro for Workstations',
    batteryCondition: 'Dell 6-cell 86 Wh (Heavy Duty)',
    batteryHealth: 91,
    cycleCount: 110,
    estimatedBackup: '4–6 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 72000,
    suggestedSellingPrice: 85000,
    suggestedDiscount: 3000,
    category: 'Workstation',
    ports: '2x Thunderbolt 3 with Power Delivery, 1x USB-C 3.2 Gen 2, 1x Full-size SD Card reader, 1x Audio combo',
    camera: 'HD IR Camera with Windows Hello',
    keyboard: 'Carbon Fiber Backlit Keyboard with Precision Glass Touchpad',
    wifi: 'Intel Wi-Fi 6 AX201 (2x2)',
    bluetooth: 'Bluetooth 5.1',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'],
    variants: [
      { name: 'i7 / 16GB / 512GB / Quadro T1000', cpu: 'Intel Core i7-10750H', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 65000, sellingPrice: 76000 },
      { name: 'i7 / 32GB / 1TB / Quadro T2000', cpu: 'Intel Core i7-10875H', ram: '32GB', storage: '1TB NVMe SSD', purchaseCost: 75000, sellingPrice: 88000 },
    ],
  },

  // ==================== LENOVO THINKPAD & IDEAPAD ====================
  {
    id: 'lenovo-thinkpad-t14-gen-2',
    brand: 'Lenovo',
    series: 'ThinkPad',
    model: 'T14 Gen 2',
    fullName: 'Lenovo ThinkPad T14 Gen 2 (Intel / AMD)',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 / i7 (11th Gen) or AMD Ryzen 5 Pro',
    defaultCpu: 'Intel Core i5-1135G7 (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i5-1145G7 vPro (up to 4.40 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
      'AMD Ryzen 5 Pro 5650U (6 Cores, 12 Threads up to 4.20 GHz)',
      'AMD Ryzen 7 Pro 5850U (8 Cores, 16 Threads up to 4.40 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'DDR4-3200MHz',
    ramOptions: ['8GB', '16GB', '32GB', '48GB'],
    defaultStorage: '512GB NVMe M.2 SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe', '2TB NVMe'],
    display: '14.0" FHD (1920x1080) IPS Anti-Glare 300 nits',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics / AMD Radeon Graphics',
    vram: 'Shared Dynamic',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Integrated Li-Polymer 50Wh with Rapid Charge (Excellent)',
    batteryHealth: 93,
    cycleCount: 102,
    estimatedBackup: '5–7 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 44000,
    suggestedSellingPrice: 51500,
    suggestedDiscount: 1500,
    category: 'Business Laptop',
    ports: '2x Thunderbolt 4 / USB-C 3.2, 2x USB 3.2 Gen 1 (one Always On), 1x HDMI 2.0, 1x RJ-45 Ethernet, 1x MicroSD card reader, 1x Audio combo',
    camera: '720p HD + IR Hybrid with ThinkShutter Privacy Cover',
    keyboard: 'Legendary ThinkPad Spill-resistant 6-row Backlit with TrackPoint',
    wifi: 'Intel Wi-Fi 6E AX210',
    bluetooth: 'Bluetooth 5.2',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544731612-de292439cc67?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-1135G7', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 39000, sellingPrice: 45000 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1135G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 44000, sellingPrice: 51500, discountPrice: 49900 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-1165G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 48000, sellingPrice: 56500, discountPrice: 54900 },
      { name: 'Ryzen 7 Pro / 16GB / 512GB', cpu: 'AMD Ryzen 7 Pro 5850U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 49000, sellingPrice: 57500, discountPrice: 56000 },
    ],
  },
  {
    id: 'lenovo-thinkpad-t14-gen-1',
    brand: 'Lenovo',
    series: 'ThinkPad',
    model: 'T14 Gen 1',
    fullName: 'Lenovo ThinkPad T14 Gen 1',
    generation: '10th Gen',
    cpuFamily: 'Intel Core i5 / i7 (10th Gen)',
    defaultCpu: 'Intel Core i5-10210U (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-10210U (up to 4.20 GHz)',
      'Intel Core i5-10310U vPro (up to 4.40 GHz)',
      'Intel Core i7-10510U (up to 4.90 GHz)',
      'AMD Ryzen 5 Pro 4650U (6 Cores, 12 Threads)',
    ],
    defaultRam: '16GB',
    ramType: 'DDR4-2666MHz / 3200MHz',
    ramOptions: ['8GB', '16GB', '32GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" FHD (1920x1080) IPS Anti-Glare 250 nits',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel UHD Graphics 620',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Li-Polymer 50Wh (Healthy)',
    batteryHealth: 88,
    cycleCount: 160,
    estimatedBackup: '4–6 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 36000,
    suggestedSellingPrice: 42500,
    suggestedDiscount: 1000,
    category: 'Business Laptop',
    ports: '2x USB-C (1x Thunderbolt 3), 2x USB 3.2 Gen 1, 1x HDMI 1.4b, 1x RJ-45 Ethernet, 1x Audio combo',
    camera: '720p HD with ThinkShutter',
    keyboard: 'ThinkPad Backlit Spill-resistant with TrackPoint',
    wifi: 'Intel Wi-Fi 6 AX201',
    bluetooth: 'Bluetooth 5.0',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-10210U', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 32000, sellingPrice: 37500 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-10210U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 36000, sellingPrice: 42500 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-10510U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 40000, sellingPrice: 47000 },
    ],
  },
  {
    id: 'lenovo-thinkpad-x1-carbon-gen-8',
    brand: 'Lenovo',
    series: 'ThinkPad',
    model: 'X1 Carbon Gen 8',
    fullName: 'Lenovo ThinkPad X1 Carbon Gen 8 (Ultrabook 1.09 kg)',
    generation: '10th Gen',
    cpuFamily: 'Intel Core i5 / i7 (10th Gen Comet Lake)',
    defaultCpu: 'Intel Core i7-10510U (4 Cores, 8 Threads, up to 4.90 GHz)',
    cpuOptions: [
      'Intel Core i5-10210U (up to 4.20 GHz)',
      'Intel Core i5-10310U vPro (up to 4.40 GHz)',
      'Intel Core i7-10510U (up to 4.90 GHz)',
      'Intel Core i7-10610U vPro (up to 4.90 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'LPDDR3-2133MHz',
    ramOptions: ['16GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['512GB NVMe', '1TB NVMe', '2TB NVMe'],
    display: '14.0" FHD (1920x1080) IPS Low Power 400 nits Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel UHD Graphics 620',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Li-Polymer 51Wh with Rapid Charge (Pristine)',
    batteryHealth: 91,
    cycleCount: 112,
    estimatedBackup: '6–8.5 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 49000,
    suggestedSellingPrice: 57500,
    suggestedDiscount: 2000,
    category: 'Ultrabook',
    ports: '2x Thunderbolt 3, 2x USB 3.2 Gen 1 (1 Always On), 1x HDMI 1.4b, 1x Ethernet extension connector, 1x Audio combo',
    camera: '720p HD + IR Hybrid with ThinkShutter',
    keyboard: '6-row Spill-resistant Backlit Keyboard with TrackPoint',
    wifi: 'Intel Wi-Fi 6 AX201',
    bluetooth: 'Bluetooth 5.0',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
    variants: [
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-10210U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 44000, sellingPrice: 51500 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-10510U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 49000, sellingPrice: 57500 },
      { name: 'i7 / 16GB / 1TB', cpu: 'Intel Core i7-10610U', ram: '16GB', storage: '1TB NVMe SSD', purchaseCost: 53000, sellingPrice: 62500 },
    ],
  },
  {
    id: 'lenovo-thinkpad-x1-carbon-gen-7',
    brand: 'Lenovo',
    series: 'ThinkPad',
    model: 'X1 Carbon Gen 7',
    fullName: 'Lenovo ThinkPad X1 Carbon Gen 7',
    generation: '8th / 10th Gen',
    cpuFamily: 'Intel Core i5 / i7 (8th Gen Quad-Core)',
    defaultCpu: 'Intel Core i7-8565U (4 Cores, 8 Threads, up to 4.60 GHz)',
    cpuOptions: [
      'Intel Core i5-8265U (up to 3.90 GHz)',
      'Intel Core i7-8565U (up to 4.60 GHz)',
      'Intel Core i7-8665U vPro (up to 4.80 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'LPDDR3-2133MHz',
    ramOptions: ['8GB', '16GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" FHD (1920x1080) IPS Anti-Glare 400 nits',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel UHD Graphics 620',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Li-Polymer 51Wh (Healthy)',
    batteryHealth: 87,
    cycleCount: 165,
    estimatedBackup: '5–7 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 41000,
    suggestedSellingPrice: 48000,
    suggestedDiscount: 1500,
    category: 'Ultrabook',
    ports: '2x Thunderbolt 3, 2x USB 3.1 Gen 1, 1x HDMI 1.4b, 1x Audio combo',
    camera: '720p HD with ThinkShutter',
    keyboard: 'ThinkPad Premium Backlit Keyboard',
    wifi: 'Intel Wireless-AC 9560',
    bluetooth: 'Bluetooth 5.0',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
    variants: [
      { name: 'i5 / 16GB / 256GB', cpu: 'Intel Core i5-8265U', ram: '16GB', storage: '256GB NVMe SSD', purchaseCost: 37000, sellingPrice: 43500 },
      { name: 'i7 / 16GB / 512GB', cpu: 'Intel Core i7-8565U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 41000, sellingPrice: 48000 },
    ],
  },
  {
    id: 'lenovo-thinkpad-t480',
    brand: 'Lenovo',
    series: 'ThinkPad',
    model: 'T480',
    fullName: 'Lenovo ThinkPad T480 (Dual Battery PowerBridge)',
    generation: '8th Gen',
    cpuFamily: 'Intel Core i5 / i7 (8th Gen Quad-Core)',
    defaultCpu: 'Intel Core i5-8250U (4 Cores, 8 Threads, up to 3.40 GHz)',
    cpuOptions: [
      'Intel Core i5-8250U (up to 3.40 GHz)',
      'Intel Core i5-8350U vPro (up to 3.60 GHz)',
      'Intel Core i7-8550U (up to 4.00 GHz)',
    ],
    defaultRam: '8GB',
    ramType: 'DDR4-2400MHz',
    ramOptions: ['8GB', '16GB', '32GB'],
    defaultStorage: '256GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" FHD (1920x1080) IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel UHD Graphics 620',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Dual Battery System (Internal 24Wh + External 24Wh/72Wh)',
    batteryHealth: 86,
    cycleCount: 185,
    estimatedBackup: '4–6 hours',
    condition: 'Dubai Grade A++',
    grade: 'A+',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 23500,
    suggestedSellingPrice: 28000,
    suggestedDiscount: 500,
    category: 'Business Laptop',
    ports: '1x Thunderbolt 3, 1x USB-C, 2x USB 3.1 Gen 1, 1x HDMI 1.4b, 1x RJ-45 Ethernet, 1x SD card reader, 1x Audio combo',
    camera: '720p HD with ThinkShutter',
    keyboard: 'ThinkPad Ergonomic Backlit Spill-resistant with TrackPoint',
    wifi: 'Intel Dual Band Wireless-AC 8265',
    bluetooth: 'Bluetooth 4.2',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-8250U', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 23500, sellingPrice: 28000 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-8250U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 27000, sellingPrice: 32000 },
    ],
  },
  {
    id: 'lenovo-thinkpad-l14-gen-2',
    brand: 'Lenovo',
    series: 'ThinkPad',
    model: 'L14 Gen 2',
    fullName: 'Lenovo ThinkPad L14 Gen 2',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 / i7 (11th Gen)',
    defaultCpu: 'Intel Core i5-1135G7 (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
      'AMD Ryzen 5 Pro 5650U (6 Cores, 12 Threads)',
    ],
    defaultRam: '16GB',
    ramType: 'DDR4-3200MHz',
    ramOptions: ['8GB', '16GB', '32GB', '64GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '14.0" FHD (1920x1080) IPS Anti-Glare 250 nits',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: 'Integrated 45Wh (Tested Good)',
    batteryHealth: 91,
    cycleCount: 118,
    estimatedBackup: '4.5–6 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost: 38000,
    suggestedSellingPrice: 45000,
    suggestedDiscount: 1000,
    category: 'Business Laptop',
    ports: '1x Thunderbolt 4 / USB4, 1x USB-C 3.2 Gen 1, 2x USB 3.2 Gen 1, 1x HDMI 2.0, 1x RJ-45, 1x MicroSD card reader',
    camera: '720p HD with Privacy Shutter',
    keyboard: 'ThinkPad Backlit Keyboard',
    wifi: 'Intel Wi-Fi 6 AX200',
    bluetooth: 'Bluetooth 5.1',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-1135G7', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 34000, sellingPrice: 40000 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1135G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 38000, sellingPrice: 45000 },
    ],
  },

  // ==================== APPLE MACBOOK ====================
  {
    id: 'apple-macbook-air-m1-2020',
    brand: 'Apple',
    series: 'MacBook Air',
    model: 'Air M1 (2020)',
    fullName: 'Apple MacBook Air M1 (2020) Space Gray / Silver / Gold',
    generation: 'Apple Silicon M1',
    cpuFamily: 'Apple M1 Chip (8-Core CPU)',
    defaultCpu: 'Apple M1 Chip with 8-Core CPU and 7-Core GPU',
    cpuOptions: [
      'Apple M1 Chip (8-Core CPU / 7-Core GPU / 16-Core Neural Engine)',
      'Apple M1 Chip (8-Core CPU / 8-Core GPU / 16-Core Neural Engine)',
    ],
    defaultRam: '8GB',
    ramType: 'Unified Memory',
    ramOptions: ['8GB', '16GB'],
    defaultStorage: '256GB Apple PCIe SSD',
    storageType: 'Onboard NVMe SSD',
    storageOptions: ['256GB SSD', '512GB SSD', '1TB SSD'],
    display: '13.3" Retina Display (2560x1600) with True Tone & P3 Wide Color',
    screenSize: '13.3"',
    resolution: '2560x1600',
    refreshRate: '60Hz',
    gpu: 'Apple 7-Core / 8-Core GPU',
    vram: 'Shared Unified',
    os: 'macOS Sonoma / Sequoia Genuine',
    batteryCondition: 'Integrated 49.9 Wh Lithium-Polymer (94% Health)',
    batteryHealth: 94,
    cycleCount: 130,
    estimatedBackup: '10–14 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 1 Year Service',
    suggestedPurchaseCost: 62000,
    suggestedSellingPrice: 72000,
    suggestedDiscount: 2000,
    category: 'Ultrabook',
    ports: '2x Thunderbolt / USB 4 ports (Charging, DisplayPort, Thunderbolt 3), 1x 3.5mm Headphone jack',
    camera: '720p FaceTime HD Camera with M1 ISP',
    keyboard: 'Backlit Magic Keyboard with Touch ID sensor and Ambient light sensor',
    wifi: '802.11ax Wi-Fi 6 wireless networking',
    bluetooth: 'Bluetooth 5.0 wireless technology',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    variants: [
      { name: 'M1 / 8GB / 256GB', cpu: 'Apple M1 (8-Core CPU / 7-Core GPU)', ram: '8GB', storage: '256GB SSD', purchaseCost: 62000, sellingPrice: 72000, discountPrice: 70000 },
      { name: 'M1 / 16GB / 512GB', cpu: 'Apple M1 (8-Core CPU / 8-Core GPU)', ram: '16GB', storage: '512GB SSD', purchaseCost: 78000, sellingPrice: 89000, discountPrice: 87000 },
    ],
  },
  {
    id: 'apple-macbook-pro-13-m1-2020',
    brand: 'Apple',
    series: 'MacBook Pro',
    model: 'Pro 13" M1 (2020)',
    fullName: 'Apple MacBook Pro 13" M1 with Touch Bar',
    generation: 'Apple Silicon M1',
    cpuFamily: 'Apple M1 Chip (8-Core CPU / 8-Core GPU)',
    defaultCpu: 'Apple M1 Chip with 8-Core CPU, 8-Core GPU & Active Cooling',
    cpuOptions: [
      'Apple M1 Chip (8-Core CPU / 8-Core GPU)',
    ],
    defaultRam: '8GB',
    ramType: 'Unified Memory',
    ramOptions: ['8GB', '16GB'],
    defaultStorage: '256GB Apple PCIe SSD',
    storageType: 'Onboard NVMe SSD',
    storageOptions: ['256GB SSD', '512GB SSD', '1TB SSD'],
    display: '13.3" Retina Display (2560x1600) 500 nits with P3 Color',
    screenSize: '13.3"',
    resolution: '2560x1600',
    refreshRate: '60Hz',
    gpu: 'Apple 8-Core GPU',
    vram: 'Shared Unified',
    os: 'macOS Sonoma / Sequoia',
    batteryCondition: 'Integrated 58.2 Wh (Pristine Health)',
    batteryHealth: 92,
    cycleCount: 140,
    estimatedBackup: '12–16 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 1 Year Service',
    suggestedPurchaseCost: 68000,
    suggestedSellingPrice: 78000,
    suggestedDiscount: 2000,
    category: 'Ultrabook',
    ports: '2x Thunderbolt / USB 4 ports, 1x 3.5mm Headphone jack',
    camera: '720p FaceTime HD camera',
    keyboard: 'Backlit Magic Keyboard with Touch Bar and Touch ID',
    wifi: '802.11ax Wi-Fi 6',
    bluetooth: 'Bluetooth 5.0',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    variants: [
      { name: 'M1 / 8GB / 256GB', cpu: 'Apple M1 (8-Core)', ram: '8GB', storage: '256GB SSD', purchaseCost: 68000, sellingPrice: 78000 },
      { name: 'M1 / 16GB / 512GB', cpu: 'Apple M1 (8-Core)', ram: '16GB', storage: '512GB SSD', purchaseCost: 83000, sellingPrice: 95000 },
    ],
  },

  // ==================== ASUS VIVOBOOK & ZENBOOK ====================
  {
    id: 'asus-vivobook-15-oled',
    brand: 'Asus',
    series: 'VivoBook',
    model: '15 OLED (K513)',
    fullName: 'ASUS VivoBook 15 OLED (Core i5 11th Gen)',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 (11th Gen)',
    defaultCpu: 'Intel Core i5-1135G7 (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
    ],
    defaultRam: '8GB',
    ramType: 'DDR4-3200MHz',
    ramOptions: ['8GB', '16GB', '24GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '15.6" Full HD (1920x1080) OLED 100% DCI-P3 400 nits Glossy',
    screenSize: '15.6"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics',
    vram: 'Shared',
    os: 'Windows 11 Home / Pro',
    batteryCondition: '3-cell 42Wh Li-ion (Good)',
    batteryHealth: 90,
    cycleCount: 130,
    estimatedBackup: '4–5.5 hours',
    condition: 'Dubai Grade A++',
    grade: 'A+',
    warranty: '1 Month Replacement + 3 Years Service',
    suggestedPurchaseCost: 38000,
    suggestedSellingPrice: 45000,
    suggestedDiscount: 1000,
    category: 'Student / Office',
    ports: '1x USB 3.2 Gen 1 Type-C, 1x USB 3.2 Gen 1 Type-A, 2x USB 2.0, 1x HDMI 1.4, 1x Micro SD card reader, 1x Audio combo',
    camera: '720p HD Camera',
    keyboard: 'Backlit Chiclet Keyboard with Num-key',
    wifi: 'Wi-Fi 6 (802.11ax)',
    bluetooth: 'Bluetooth 5.0',
    images: ['https://images.unsplash.com/photo-1544731612-de292439cc67?w=800'],
    variants: [
      { name: 'i5 / 8GB / 512GB OLED', cpu: 'Intel Core i5-1135G7', ram: '8GB', storage: '512GB NVMe SSD', purchaseCost: 38000, sellingPrice: 45000 },
      { name: 'i5 / 16GB / 512GB OLED', cpu: 'Intel Core i5-1135G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 41000, sellingPrice: 48500 },
    ],
  },
  {
    id: 'asus-zenbook-14-ux425',
    brand: 'Asus',
    series: 'ZenBook',
    model: '14 UX425',
    fullName: 'ASUS ZenBook 14 UX425 Ultra-slim Pine Grey',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 / i7 (11th Gen)',
    defaultCpu: 'Intel Core i5-1135G7 (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'LPDDR4x-4266MHz',
    ramOptions: ['8GB', '16GB'],
    defaultStorage: '512GB NVMe PCIe 3.0 SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['512GB NVMe', '1TB NVMe'],
    display: '14.0" Full HD (1920x1080) 16:9 IPS 400 nits Anti-glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: '4-cell 67Wh Li-ion (All-day battery)',
    batteryHealth: 93,
    cycleCount: 95,
    estimatedBackup: '8–11 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 3 Years Service',
    suggestedPurchaseCost: 47000,
    suggestedSellingPrice: 55000,
    suggestedDiscount: 1500,
    category: 'Ultrabook',
    ports: '2x Thunderbolt 4 Type-C, 1x USB 3.2 Gen 1 Type-A, 1x HDMI 2.0b, 1x MicroSD card reader',
    camera: 'IR Camera with Windows Hello support',
    keyboard: 'Edge-to-edge Backlit Keyboard with NumberPad 2.0 in touchpad',
    wifi: 'Intel Wi-Fi 6 (802.11ax)',
    bluetooth: 'Bluetooth 5.0',
    images: ['https://images.unsplash.com/photo-1544731612-de292439cc67?w=800'],
    variants: [
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1135G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 47000, sellingPrice: 55000 },
      { name: 'i7 / 16GB / 1TB', cpu: 'Intel Core i7-1165G7', ram: '16GB', storage: '1TB NVMe SSD', purchaseCost: 54000, sellingPrice: 63000 },
    ],
  },

  // ==================== ACER ASPIRE & SWIFT ====================
  {
    id: 'acer-aspire-5-a515',
    brand: 'Acer',
    series: 'Aspire',
    model: '5 A515',
    fullName: 'Acer Aspire 5 A515 (Slim Aluminium Top)',
    generation: '11th Gen',
    cpuFamily: 'Intel Core i5 / i7 (11th Gen)',
    defaultCpu: 'Intel Core i5-1135G7 (4 Cores, 8 Threads, up to 4.20 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'Intel Core i7-1165G7 (up to 4.70 GHz)',
      'AMD Ryzen 5 5500U (6 Cores, 12 Threads)',
    ],
    defaultRam: '8GB',
    ramType: 'DDR4-3200MHz',
    ramOptions: ['8GB', '16GB', '24GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe'],
    display: '15.6" Full HD (1920x1080) ComfyView IPS',
    screenSize: '15.6"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'Intel Iris Xe Graphics',
    vram: 'Shared',
    os: 'Windows 11 Home / Pro',
    batteryCondition: '3-cell 48Wh Li-ion',
    batteryHealth: 89,
    cycleCount: 140,
    estimatedBackup: '4–6 hours',
    condition: 'Dubai Grade A++',
    grade: 'A+',
    warranty: '1 Month Replacement + 3 Years Service',
    suggestedPurchaseCost: 32000,
    suggestedSellingPrice: 37500,
    suggestedDiscount: 1000,
    category: 'Student / Office',
    ports: '1x USB 3.2 Gen 1 Type-C, 2x USB 3.2 Gen 1 Type-A, 1x USB 2.0, 1x HDMI, 1x RJ-45 Ethernet, 1x Audio combo',
    camera: '720p HD Camera',
    keyboard: 'Backlit Keyboard with Numeric Keypad',
    wifi: 'Wi-Fi 6 (802.11ax)',
    bluetooth: 'Bluetooth 5.1',
    images: ['https://images.unsplash.com/photo-1544731612-de292439cc67?w=800'],
    variants: [
      { name: 'i5 / 8GB / 256GB', cpu: 'Intel Core i5-1135G7', ram: '8GB', storage: '256GB NVMe SSD', purchaseCost: 29000, sellingPrice: 34000 },
      { name: 'i5 / 16GB / 512GB', cpu: 'Intel Core i5-1135G7', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 33000, sellingPrice: 39000 },
    ],
  },
  {
    id: 'acer-swift-3-sf314',
    brand: 'Acer',
    series: 'Swift',
    model: '3 SF314',
    fullName: 'Acer Swift 3 SF314 Lightweight Ultrabook',
    generation: '11th Gen / AMD 5000',
    cpuFamily: 'Intel Core i5 / AMD Ryzen 5 / 7',
    defaultCpu: 'AMD Ryzen 7 5700U (8 Cores, 16 Threads, up to 4.30 GHz)',
    cpuOptions: [
      'Intel Core i5-1135G7 (up to 4.20 GHz)',
      'AMD Ryzen 5 5500U (6 Cores, 12 Threads)',
      'AMD Ryzen 7 5700U (8 Cores, 16 Threads up to 4.30 GHz)',
    ],
    defaultRam: '16GB',
    ramType: 'LPDDR4x-4266MHz',
    ramOptions: ['8GB', '16GB'],
    defaultStorage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['512GB NVMe', '1TB NVMe'],
    display: '14.0" Full HD (1920x1080) 100% sRGB 300 nits IPS',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    gpu: 'AMD Radeon Graphics (8-core)',
    vram: 'Shared',
    os: 'Windows 11 Pro 64-bit Genuine',
    batteryCondition: '4-cell 48Wh Li-ion (Healthy)',
    batteryHealth: 92,
    cycleCount: 110,
    estimatedBackup: '7–10 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 3 Years Service',
    suggestedPurchaseCost: 40000,
    suggestedSellingPrice: 47500,
    suggestedDiscount: 1500,
    category: 'Ultrabook',
    ports: '1x USB Type-C (DisplayPort, USB 3.2 Gen 2, DC-in), 2x USB 3.2 Gen 1, 1x HDMI 2.0, 1x Audio combo',
    camera: '720p HD Camera with Super High Dynamic Range',
    keyboard: 'All-metal Backlit Keyboard with Fingerprint Reader',
    wifi: 'Wi-Fi 6 (802.11ax)',
    bluetooth: 'Bluetooth 5.2',
    images: ['https://images.unsplash.com/photo-1544731612-de292439cc67?w=800'],
    variants: [
      { name: 'Ryzen 5 / 8GB / 512GB', cpu: 'AMD Ryzen 5 5500U', ram: '8GB', storage: '512GB NVMe SSD', purchaseCost: 35000, sellingPrice: 41500 },
      { name: 'Ryzen 7 / 16GB / 512GB', cpu: 'AMD Ryzen 7 5700U', ram: '16GB', storage: '512GB NVMe SSD', purchaseCost: 40000, sellingPrice: 47500 },
    ],
  },
];

/**
 * Intelligent laptop model search helper with brand filtering and multi-term scoring.
 */
export function searchLaptopCatalog(query: string, brandFilter?: string): LaptopCatalogModel[] {
  const cleanQ = (query || '').trim().toLowerCase();
  let results = LAPTOP_MODEL_CATALOG;

  if (brandFilter && brandFilter !== 'all') {
    results = results.filter(
      (item) => item.brand.toLowerCase() === brandFilter.toLowerCase()
    );
  }

  if (!cleanQ) {
    return results;
  }

  const terms = cleanQ.split(/\s+/).filter(Boolean);

  return results
    .map((item) => {
      let score = 0;
      const fullText = `${item.brand} ${item.series} ${item.model} ${item.fullName} ${item.generation} ${item.defaultCpu} ${item.cpuFamily}`.toLowerCase();

      // Exact phrase match
      if (fullText.includes(cleanQ)) {
        score += 100;
      }

      // Check model match
      if (item.model.toLowerCase().includes(cleanQ)) {
        score += 50;
      }

      // Check all query terms
      const allMatched = terms.every((t) => fullText.includes(t));
      if (allMatched) {
        score += 30;
      } else {
        const matches = terms.filter((t) => fullText.includes(t)).length;
        score += matches * 10;
      }

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}

/**
 * Quick brand list
 */
export const POPULAR_BRANDS = ['HP', 'Dell', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Other'] as const;

/**
 * RAM options preset
 */
export const RAM_PRESETS = ['4GB', '8GB', '16GB', '32GB', '64GB'] as const;

/**
 * RAM Type presets
 */
export const RAM_TYPE_PRESETS = ['DDR4-2400MHz', 'DDR4-2666MHz', 'DDR4-3200MHz', 'DDR5-4800MHz', 'DDR5-5600MHz', 'LPDDR4x', 'LPDDR5', 'Unified Memory'] as const;

/**
 * Storage capacity presets
 */
export const STORAGE_PRESETS = ['128GB', '256GB', '512GB', '1TB', '2TB'] as const;

/**
 * Storage type presets
 */
export const STORAGE_TYPE_PRESETS = ['NVMe M.2 SSD', 'SATA SSD', 'HDD 5400RPM', 'HDD 7200RPM', 'Hybrid (SSD+HDD)'] as const;

/**
 * Conditions and Dubai grades
 */
export const CONDITION_OPTIONS = [
  'Dubai Grade A++',
  'Grade A+',
  'Grade A',
  'Brand New',
  'Open Box',
  'Used',
  'Reconditioned',
  'Refurbished',
] as const;

export const GRADE_OPTIONS = ['A++', 'A+', 'A', 'B+', 'B', 'C'] as const;

export const BATTERY_STATUS_OPTIONS = ['Excellent', 'Good', 'Fair', 'Needs Replacement'] as const;

export const WARRANTY_OPTIONS = [
  'No Warranty',
  '7 Days Replacement Warranty',
  '15 Days Replacement Warranty',
  '1 Month Replacement + 5 Years Free Service',
  '3 Months Replacement + 5 Years Free Service',
  '6 Months Warranty',
  '12 Months (1 Year) Warranty',
  '24 Months (2 Years) Official Warranty',
] as const;

/**
 * Helper to generate unique SKU based on brand and model
 */
export function generateSmartSku(brand: string, model: string, existingSkus: string[]): string {
  const brandCode = (brand || 'GEN').substring(0, 3).toUpperCase();
  const cleanModel = (model || 'LAP')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 7)
    .toUpperCase();
  
  let attempts = 0;
  let candidate = '';
  do {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `JHF-${brandCode}-${cleanModel || 'LP'}-${randomSuffix}`;
    attempts++;
  } while (existingSkus.includes(candidate) && attempts < 100);

  return candidate;
}

/**
 * Universal Search across built-in catalog + custom stored catalog.
 * Does NOT limit results to existing JHF store stock!
 */
export function searchLaptopModelsUniversal(
  query: string,
  brandFilter?: string,
  customCatalog?: LaptopCatalogModel[]
): LaptopCatalogModel[] {
  const combined = [...(customCatalog || []), ...LAPTOP_MODEL_CATALOG];
  
  // Remove duplicates by id
  const uniqueMap = new Map<string, LaptopCatalogModel>();
  combined.forEach((item) => {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  });
  const allModels = Array.from(uniqueMap.values());

  const q = (query || '').trim().toLowerCase();
  
  return allModels.filter((model) => {
    if (brandFilter && brandFilter !== 'all' && model.brand.toLowerCase() !== brandFilter.toLowerCase()) {
      return false;
    }
    if (!q) return true;

    const searchable = `${model.brand} ${model.series} ${model.model} ${model.fullName} ${model.generation} ${model.cpuFamily} ${model.defaultCpu}`.toLowerCase();
    
    // Support multi-word query (e.g. "hp 840 g8" or "latitude 7420")
    const words = q.split(/\s+/).filter(Boolean);
    return words.every((w) => searchable.includes(w));
  });
}

/**
 * AI Model Discovery Engine:
 * Intelligently analyzes laptop brand, series, model number, and generation
 * to construct an authentic, structured specification recommendation
 * when an exact match does not already exist in the static database.
 */
export function aiDiscoverLaptopModel(rawQuery: string, brandHint?: string): LaptopCatalogModel {
  const q = rawQuery.trim();
  const lower = q.toLowerCase();

  // Detect Brand
  let brand: LaptopCatalogModel['brand'] = (brandHint as any) || 'HP';
  if (lower.includes('dell') || lower.includes('latitude') || lower.includes('precision') || lower.includes('xps') || lower.includes('vostro') || lower.includes('inspiron')) {
    brand = 'Dell';
  } else if (lower.includes('lenovo') || lower.includes('thinkpad') || lower.includes('ideapad') || lower.includes('legion') || lower.includes('yoga')) {
    brand = 'Lenovo';
  } else if (lower.includes('apple') || lower.includes('macbook')) {
    brand = 'Apple';
  } else if (lower.includes('asus') || lower.includes('zenbook') || lower.includes('vivobook') || lower.includes('rog') || lower.includes('tuf')) {
    brand = 'Asus';
  } else if (lower.includes('acer') || lower.includes('aspire') || lower.includes('swift') || lower.includes('predator')) {
    brand = 'Acer';
  } else if (lower.includes('hp') || lower.includes('elitebook') || lower.includes('probook') || lower.includes('zbook') || lower.includes('victus') || lower.includes('omen') || lower.includes('spectre') || lower.includes('envy')) {
    brand = 'HP';
  }

  // Detect Series
  let series = 'Business Series';
  if (lower.includes('elitebook')) series = 'EliteBook';
  else if (lower.includes('probook')) series = 'ProBook';
  else if (lower.includes('zbook')) series = 'ZBook Workstation';
  else if (lower.includes('latitude')) series = 'Latitude';
  else if (lower.includes('precision')) series = 'Precision Workstation';
  else if (lower.includes('xps')) series = 'XPS';
  else if (lower.includes('thinkpad')) series = 'ThinkPad';
  else if (lower.includes('ideapad')) series = 'IdeaPad';
  else if (lower.includes('macbook pro')) series = 'MacBook Pro';
  else if (lower.includes('macbook air')) series = 'MacBook Air';
  else if (lower.includes('zenbook')) series = 'ZenBook';
  else if (lower.includes('vivobook')) series = 'VivoBook';
  else if (lower.includes('aspire')) series = 'Aspire';
  else if (lower.includes('swift')) series = 'Swift';

  // Clean Model Name
  let modelClean = q;
  // Strip out brand prefix if repeatedly typed
  const brandPrefixes = ['hp ', 'dell ', 'lenovo ', 'apple ', 'asus ', 'acer '];
  for (const bp of brandPrefixes) {
    if (modelClean.toLowerCase().startsWith(bp)) {
      modelClean = modelClean.substring(bp.length).trim();
    }
  }

  // Detect Generation & CPU
  let generation = '11th Gen';
  let cpuFamily = 'Intel Core i5 / i7';
  let defaultCpu = 'Intel Core i5 (Quad-Core, up to 4.20 GHz)';
  let cpuOptions = [
    'Intel Core i5 (Turbo up to 4.20 GHz)',
    'Intel Core i7 (Turbo up to 4.70 GHz)',
  ];
  let ramType = 'DDR4-3200MHz';
  let defaultRam = '16GB';
  let defaultStorage = '512GB NVMe SSD';
  let display = '14.0" Full HD (1920x1080) IPS Anti-Glare';
  let screenSize = '14.0"';
  let resolution = '1920x1080';
  let gpu = 'Intel Iris Xe Graphics';
  let os = 'Windows 11 Pro 64-bit Genuine';
  let suggestedPurchaseCost = 45000;
  let suggestedSellingPrice = 52000;

  // Pattern detection for newer G11 / G10 / Core Ultra / M-series
  if (lower.includes('g11') || lower.includes('ultra') || lower.includes('meteor lake')) {
    generation = 'Intel Core Ultra (1st Gen) / 14th Gen';
    cpuFamily = 'Intel Core Ultra 5 / Ultra 7';
    defaultCpu = 'Intel Core Ultra 5 125H (14 Cores, 18 Threads, up to 4.5 GHz, Intel AI Boost NPU)';
    cpuOptions = [
      'Intel Core Ultra 5 125H (up to 4.5 GHz, AI NPU)',
      'Intel Core Ultra 7 155H (up to 4.8 GHz, AI NPU)',
      'Intel Core Ultra 7 165H vPro (up to 5.0 GHz, AI NPU)',
    ];
    ramType = 'DDR5-5600MHz';
    defaultRam = '16GB';
    defaultStorage = '512GB PCIe 4.0 NVMe SSD';
    gpu = 'Intel Arc Graphics';
    suggestedPurchaseCost = 95000;
    suggestedSellingPrice = 115000;
    if (lower.includes('860') || lower.includes('16')) {
      screenSize = '16.0"';
      display = '16.0" WUXGA (1920x1200) 16:10 IPS Anti-Glare 400 nits Low Power';
      resolution = '1920x1200';
    }
  } else if (lower.includes('g10') || lower.includes('13th') || lower.includes('7440') || lower.includes('5440') || lower.includes('gen 4')) {
    generation = '13th Gen Raptor Lake';
    cpuFamily = 'Intel Core i5 / i7 (13th Gen)';
    defaultCpu = 'Intel Core i5-1335U (10 Cores, 12 Threads, up to 4.60 GHz)';
    cpuOptions = [
      'Intel Core i5-1335U (up to 4.60 GHz)',
      'Intel Core i5-1345U vPro (up to 4.70 GHz)',
      'Intel Core i7-1355U (up to 5.00 GHz)',
      'Intel Core i7-1365U vPro (up to 5.20 GHz)',
    ];
    ramType = 'DDR5-4800MHz';
    defaultRam = '16GB';
    defaultStorage = '512GB NVMe Gen4 SSD';
    gpu = 'Intel Iris Xe Graphics';
    suggestedPurchaseCost = 68000;
    suggestedSellingPrice = 78000;
  } else if (lower.includes('g9') || lower.includes('12th') || lower.includes('7430') || lower.includes('5430') || lower.includes('gen 3')) {
    generation = '12th Gen Alder Lake';
    cpuFamily = 'Intel Core i5 / i7 (12th Gen)';
    defaultCpu = 'Intel Core i5-1235U (10 Cores, 12 Threads, up to 4.40 GHz)';
    cpuOptions = [
      'Intel Core i5-1235U (up to 4.40 GHz)',
      'Intel Core i7-1255U (up to 4.70 GHz)',
      'Intel Core i7-1265U vPro (up to 4.80 GHz)',
    ];
    ramType = 'DDR4-3200MHz';
    defaultRam = '16GB';
    defaultStorage = '512GB NVMe SSD';
    gpu = 'Intel Iris Xe Graphics';
    suggestedPurchaseCost = 54000;
    suggestedSellingPrice = 62000;
  } else if (lower.includes('m3')) {
    brand = 'Apple';
    series = lower.includes('air') ? 'MacBook Air' : 'MacBook Pro';
    generation = 'Apple Silicon M3 Family';
    cpuFamily = 'Apple M3 8-Core CPU / 10-Core GPU';
    defaultCpu = 'Apple M3 chip (8-core CPU with 4 performance cores and 4 efficiency cores)';
    cpuOptions = ['Apple M3 (8-core CPU, 10-core GPU)', 'Apple M3 Pro (11-core CPU, 14-core GPU)', 'Apple M3 Max (14-core CPU, 30-core GPU)'];
    ramType = 'Unified Memory';
    defaultRam = '16GB Unified';
    defaultStorage = '512GB High-Speed SSD';
    display = '14.2" Liquid Retina XDR Display (3024x1964) ProMotion 120Hz';
    screenSize = '14.2"';
    resolution = '3024x1964';
    gpu = 'Apple 10-core GPU with Hardware Ray Tracing';
    os = 'macOS Sonoma / Sequoia Genuine';
    suggestedPurchaseCost = 145000;
    suggestedSellingPrice = 168000;
  } else if (lower.includes('m2')) {
    brand = 'Apple';
    series = lower.includes('air') ? 'MacBook Air' : 'MacBook Pro';
    generation = 'Apple Silicon M2';
    cpuFamily = 'Apple M2 8-Core CPU';
    defaultCpu = 'Apple M2 chip (8-core CPU, 10-core GPU, 16-core Neural Engine)';
    ramType = 'Unified Memory';
    defaultRam = '8GB Unified';
    defaultStorage = '256GB SSD';
    gpu = 'Apple 10-core GPU';
    os = 'macOS Genuine';
    suggestedPurchaseCost = 92000;
    suggestedSellingPrice = 108000;
  }

  // Screen size detection
  if (lower.includes('16') || lower.includes('860') || lower.includes('865') || lower.includes('p16') || lower.includes('t16') || lower.includes('16-inch')) {
    screenSize = '16.0"';
    display = '16.0" WUXGA (1920x1200) 16:10 Anti-Glare IPS 400 nits';
    resolution = '1920x1200';
  } else if (lower.includes('15') || lower.includes('850') || lower.includes('550') || lower.includes('5520') || lower.includes('5530') || lower.includes('t15')) {
    screenSize = '15.6"';
    display = '15.6" Full HD (1920x1080) IPS Anti-Glare';
    resolution = '1920x1080';
  } else if (lower.includes('13') || lower.includes('830') || lower.includes('530') || lower.includes('7320') || lower.includes('7330') || lower.includes('x13')) {
    screenSize = '13.3"';
    display = '13.3" Full HD (1920x1080) IPS Low Power';
    resolution = '1920x1080';
  }

  const generatedId = `ai-${brand.toLowerCase()}-${modelClean.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
  const fullName = `${brand} ${series !== 'Business Series' ? series : ''} ${modelClean}`.replace(/\s+/g, ' ').trim();

  return {
    id: generatedId,
    brand,
    series,
    model: modelClean,
    fullName,
    generation,
    cpuFamily,
    defaultCpu,
    cpuOptions,
    defaultRam,
    ramType,
    ramOptions: ['8GB', '16GB', '32GB', '64GB'],
    defaultStorage,
    storageType: 'NVMe M.2 SSD',
    storageOptions: ['256GB NVMe', '512GB NVMe', '1TB NVMe', '2TB NVMe'],
    display,
    screenSize,
    resolution,
    refreshRate: '60Hz',
    gpu,
    vram: 'Shared Dynamic',
    os,
    batteryCondition: 'HP/Dell High-Capacity Li-Ion Battery (Certified Health)',
    batteryHealth: 92,
    cycleCount: 110,
    estimatedBackup: '4–6 hours',
    condition: 'Dubai Grade A++',
    grade: 'A++',
    warranty: '1 Month Replacement + 5 Years Free Service',
    suggestedPurchaseCost,
    suggestedSellingPrice,
    suggestedDiscount: 1500,
    category: 'Business Laptop',
    ports: 'Thunderbolt 4 / USB-C (Power Delivery, DisplayPort), USB 3.2 Gen 1, HDMI 2.0/2.1, Audio combo jack',
    camera: '720p HD / 1080p FHD with Privacy Shutter & Dual Microphones',
    keyboard: 'Spill-resistant Backlit Keyboard with Multi-touch Precision Touchpad',
    wifi: 'Wi-Fi 6E (802.11ax) Multi-User MIMO',
    bluetooth: 'Bluetooth 5.3',
    images: [
      brand === 'Apple'
        ? 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700'
        : brand === 'Dell'
        ? 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700'
        : brand === 'Lenovo'
        ? 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700'
        : 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700',
    ],
    variants: [
      {
        name: `${brand} ${modelClean} (i5 / 16GB / 512GB)`,
        cpu: defaultCpu,
        ram: '16GB',
        storage: '512GB NVMe',
        purchaseCost: suggestedPurchaseCost,
        sellingPrice: suggestedSellingPrice,
        discountPrice: suggestedSellingPrice - 1500,
      },
      {
        name: `${brand} ${modelClean} (i7 / 32GB / 1TB)`,
        cpu: cpuOptions[1] || defaultCpu,
        ram: '32GB',
        storage: '1TB NVMe',
        purchaseCost: suggestedPurchaseCost + 12000,
        sellingPrice: suggestedSellingPrice + 15000,
        discountPrice: suggestedSellingPrice + 13000,
      },
    ],
  };
}

