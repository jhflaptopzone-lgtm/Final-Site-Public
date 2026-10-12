export interface LaptopItem {
  id: string;
  title: string;
  brand: 'Lenovo' | 'HP' | 'Dell';
  series: string;
  specs: string;
  price: string;
  tag: string;
  image: string;
  url?: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  category: string;
  link: string;
  source: 'Google Drive' | 'Mega' | 'Direct';
  size?: string;
  description?: string;
  image?: string;
  version?: string;
}

export interface WarrantyTier {
  id: string;
  title: string;
  titleBn?: string;
  titleHi?: string;
  badge: string;
  badgeBn?: string;
  badgeHi?: string;
  badgeColor: string;
  emoji: string;
  descriptionBn: string;
  descriptionEn?: string;
  descriptionHi?: string;
  highlights: string[];
  highlightsEn?: string[];
  highlightsHi?: string[];
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankShortName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  routingNumber: string;
  swiftCode: string;
  accountType?: string;
  recommendedMethods?: string[];
  themeColor: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    badge: string;
    pill: string;
  };
}

export const OFFICIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'nrb-bank',
    bankName: 'NRB Bank Ltd.',
    bankShortName: 'NRB Bank',
    accountName: 'MD. JAHID HASAN',
    accountNumber: '1171010068663',
    branch: 'Shafipur Branch',
    routingNumber: '290331426',
    swiftCode: 'NRBBBDDH',
    accountType: 'Official Bank Account',
    recommendedMethods: ['NPSB (Instant)', 'BEFTN', 'RTGS', 'NRB Planet App'],
    themeColor: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-900/40',
      text: 'text-emerald-900 dark:text-emerald-100',
      accent: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-600 text-white',
      pill: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
    }
  },
  {
    id: 'dbbl-bank',
    bankName: 'Dutch-Bangla Bank Ltd. (DBBL)',
    bankShortName: 'DBBL',
    accountName: 'MD. JAHID HASAN',
    accountNumber: '1681510234314',
    branch: 'Kushtia',
    routingNumber: '090500949',
    swiftCode: 'DBBLBDDH',
    accountType: 'Official Bank Account',
    recommendedMethods: ['NexusPay', 'NPSB (Instant)', 'BEFTN', 'Rocket to Bank'],
    themeColor: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-900/40',
      text: 'text-amber-900 dark:text-amber-100',
      accent: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-600 text-white',
      pill: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
    }
  },
  {
    id: 'brac-bank',
    bankName: 'BRAC Bank PLC',
    bankShortName: 'BRAC Bank',
    accountName: 'MD. JAHID HASAN',
    accountNumber: '1072268610001',
    branch: 'Kaliakair Sub Branch',
    routingNumber: '060330952',
    swiftCode: 'BRAKBDDH',
    accountType: 'Official Bank Account',
    recommendedMethods: ['Astha App', 'NPSB (Instant)', 'BEFTN', 'RTGS'],
    themeColor: {
      bg: 'bg-blue-50/70 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-900/40',
      text: 'text-blue-900 dark:text-blue-100',
      accent: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-600 text-white',
      pill: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
    }
  }
];

export const STORE_INFO = {
  name: 'JHF Laptop Zone',
  ownerName: 'মোঃ জাহিদ হাসান (MD. Jahid Hasan)',
  tagline: 'Best Laptop Buy , Sell & Accessories Importer, Traders & Suppliers',
  domain: 'jhflaptopzone.com',
  branchOffice: 'Baroipara Bazar, Chandra, Gazipur',
  mainOffice: 'Sonali Trade, Shop No : 1001 & 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka',
  location: 'Main Office: Sonali Trade, Shop 1001 & 1040, Multiplan, New Elephant Road, Dhaka | Branch: Baroipara Bazar, Chandra, Gazipur',
  phones: ['01935-693071', '01731-693071'],
  whatsapp: '8801935693071',
  whatsappDisplay: '+88 01935 69 30 71',
  email: 'jhflaptopzone@gmail.com',
  facebook: 'www.facebook.com/jhflaptopzone',
  facebookUrl: 'https://www.facebook.com/jhflaptopzone',
  web: 'www.jhflaptopzone.com',
  webUrl: 'https://www.jhflaptopzone.com',
  delivery: 'Nationwide Courier Delivery in 64 Districts',
  visitingCardImg: 'https://blogger.googleusercontent.com/img/a/AVvXsEiQMH4jr1rzv-0L-a1ZxRPDwNbEoeMhQi-a8wJQn2grOsoyMJMvsOnJX3-alKrKP0p-uRAs3jmXuRYHLG8Ru6tvwtmtKLQXo3anBaAdL1aTEYKP0OMlgfQ6X8H9u-ElAgoe5VJGgRDdh-ILSkZUA5-6IqHwPl86mtRpn9Rj5IYDlF3LhdzyyNk0vwhs0G0=s320',
  paymentCardImg: 'https://blogger.googleusercontent.com/img/a/AVvXsEilNe2rlDC7nm2yIfHfbCwTI0NPsptHf5qFhqsF8D5NNaCmB_t-WZoHPCK74TuXF33c_YUHaJGMcIeLz-ZDl282oDFgliYaCFr6a6syTMEHf5LVf5NspnUrzF8t-qc9kBo_9tG6zWEPDX_w3qXUpfI-CXS_INTLOL7YFjWD0BTKJvvkuN7rz16Rkn8uLVI=s250',
  galleryFolder: 'https://drive.google.com/drive/folders/1Xx1d3c872tWo40U9N1clQ8ObTuc3ykwg?usp=sharing',
  sharaAiLink: 'https://drive.google.com/file/d/1QBBHI_903zP1PJdkIkLJonwJIrqQc-id/view?usp=drive_link',
  marketingCourseLink: 'https://drive.google.com/file/d/1lbl763k3GRDaokPAWEmIVPeiQTNaHgdx/view?usp=sharing',
  bankAccounts: OFFICIAL_BANK_ACCOUNTS,
};

export const LAPTOPS_DATA: LaptopItem[] = [
  {
    id: 'lenovo-l14-gen2',
    title: 'Lenovo ThinkPad L14 Gen-2 (Core i5 11th Gen / 16GB RAM / 512GB NVMe SSD)',
    brand: 'Lenovo',
    series: 'ThinkPad L-Series',
    specs: 'Intel Core i5-1135G7 (11th Gen) • 16GB DDR4 RAM • 512GB M.2 NVMe SSD • 14" FHD IPS Anti-Glare • Iris Xe Graphics • Thunderbolt 4 • Type-C Fast Charging',
    price: '৳ 46,500',
    tag: '11th Gen Iris Xe',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2024/03/lenovo-thinkpad-l14-gen-2-core-i5-11th.html'
  },
  {
    id: 'lenovo-t14s-gen1',
    title: 'Lenovo ThinkPad T14s (Core i5 10th Gen / 16GB RAM / 512GB SSD)',
    brand: 'Lenovo',
    series: 'ThinkPad T-Series (Slim)',
    specs: 'Intel Core i5-10210U (10th Gen) • 16GB RAM • 512GB NVMe SSD • 14" FHD IPS (Super Slim & Lightweight Magnesium Chassis) • Backlit KB • Fingerprint Security',
    price: '৳ 42,500',
    tag: 'Ultrabook Slim',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2024/03/lenovo-thinkpad-t14s-core-i5-10th-gen.html'
  },
  {
    id: 'lenovo-t480s-i5-8th-16gb',
    title: 'Lenovo ThinkPad T480s (Core i5 8th Gen / 16GB RAM / 512GB NVMe SSD)',
    brand: 'Lenovo',
    series: 'ThinkPad T-Series',
    specs: 'Intel Core i5-8350U Quad Core • 16GB DDR4 • 512GB SSD • 14" FHD IPS • Dual Battery System • Type-C Thunderbolt 3 • Military-Grade Durability',
    price: '৳ 33,500',
    tag: 'Most Popular',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2024/02/core-i5-8th-gen-16gb-ram-512gb-ssd-14.html'
  },
  {
    id: 'hp-840-g8-32gb',
    title: 'HP EliteBook 840 G8 (Core i5 11th Gen / 32GB RAM / 512GB NVMe SSD)',
    brand: 'HP',
    series: 'EliteBook G8 Series',
    specs: 'Intel Core i5 11th Gen • 32GB High Speed RAM • 512GB NVMe SSD • 14" FHD IPS 400 Nits • Premium CNC Aluminum • Bang & Olufsen Quad Speakers',
    price: '৳ 54,000',
    tag: '32GB Beast',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2023/09/blog-post.html'
  },
  {
    id: 'hp-840-g8-16gb',
    title: 'HP EliteBook 840 G8 (Core i5 11th Gen / 16GB RAM / 512GB SSD)',
    brand: 'HP',
    series: 'EliteBook G8 Series',
    specs: 'Intel Core i5-1135G7 • 16GB DDR4 • 512GB SSD • 14" FHD IPS • Backlit Keyboard • Face Unlock IR Camera • Aluminum Unibody',
    price: '৳ 48,500',
    tag: '11th Gen Executive',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2023/09/hp-elitebook-840-g8.html'
  },
  {
    id: 'hp-840-g7-16gb',
    title: 'HP EliteBook 840 G7 (Core i5 10th Gen / 16GB RAM / 512GB SSD)',
    brand: 'HP',
    series: 'EliteBook G7 Series',
    specs: 'Intel Core i5-10310U • 16GB RAM • 512GB NVMe • 14" FHD IPS Micro-Edge • Slim & Elegant Silver Aluminum Finish • Type-C Thunderbolt',
    price: '৳ 41,500',
    tag: '10th Gen Value',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2023/09/hp-elitebook-840-g7.html'
  },
  {
    id: 'hp-840-g6-16gb',
    title: 'HP EliteBook 840 G6 (Core i5 8th Gen / 16GB RAM / 512GB SSD)',
    brand: 'HP',
    series: 'EliteBook G6 Series',
    specs: 'Intel Core i5-8265U Quad Core • 16GB RAM • 512GB SSD • 14" FHD Anti-Glare IPS • B&O Audio • Backlit KB • Privacy Shutter',
    price: '৳ 34,500',
    tag: 'Top Seller',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2023/09/hp-elitebook-840-g6_24.html'
  },
  {
    id: 'hp-840-g5-8gb',
    title: 'HP EliteBook 840 G5 (Core i5 8th Gen / 8GB RAM / 256GB SSD)',
    brand: 'HP',
    series: 'EliteBook G5 Series',
    specs: 'Intel Core i5-8350U • 8GB DDR4 (Upgradable) • 256GB NVMe SSD • 14" FHD IPS • Full Aluminum Body • Backlit KB • Type-C',
    price: '৳ 28,500',
    tag: 'Budget G5',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2023/09/hp-elitebook-840-g5.html'
  },
  {
    id: 'dell-latitude-7400',
    title: 'Dell Latitude 7400 (Core i7 8th Gen / 16GB RAM / 512GB SSD)',
    brand: 'Dell',
    series: 'Latitude 7000 Series',
    specs: 'Intel Core i7-8665U (Up to 4.8GHz) • 16GB DDR4 • 512GB NVMe SSD • 14" FHD IPS Carbon Fiber / Aluminum • Thunderbolt 3 • ExpressCharge',
    price: '৳ 38,500',
    tag: 'Core i7 Premium',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700&auto=format&fit=crop&q=80'
  },
  {
    id: 'dell-latitude-5400',
    title: 'Dell Latitude 5400 (Core i5 8th Gen / 8GB RAM / 256GB SSD)',
    brand: 'Dell',
    series: 'Latitude 5000 Series',
    specs: 'Intel Core i5-8365U • 8GB RAM • 256GB M.2 SSD • 14" FHD Display • High Battery Capacity • Rugged Business Build',
    price: '৳ 27,000',
    tag: 'Budget Business',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80'
  },
  {
    id: 'hp-840-g4-dual-drive',
    title: 'HP EliteBook 840 G4 (Core i5 7th Gen / 8GB RAM / 256GB SSD + 1TB HDD)',
    brand: 'HP',
    series: 'EliteBook G4 Series',
    specs: 'Intel Core i5-7200U • 8GB RAM • 256GB SSD + 1000GB HDD Storage • 14" Slim Display • Good Battery Backup',
    price: '৳ 24,500',
    tag: 'Dual Storage',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2023/09/hp-elitebook-840-g4.html'
  },
  {
    id: 'lenovo-t470s-i5-6th',
    title: 'Lenovo ThinkPad T470s (Core i5 6th Gen / 8GB RAM / 256GB SSD)',
    brand: 'Lenovo',
    series: 'ThinkPad T-Series',
    specs: 'Intel Core i5-6300U • 8GB RAM • 256GB SSD • 14" FHD IPS • Ultra-durable keyboard • Dual battery support',
    price: '৳ 22,500',
    tag: 'Entry ThinkPad',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80',
    url: 'https://www.jhflaptopzone.com/2024/02/lenovo-thinkpad-t470s.html'
  }
];

export const TESTING_TOOLS: DownloadItem[] = [
  {
    id: 'tt-1',
    title: 'Battery Info View',
    category: 'Battery Diagnostic',
    link: 'https://drive.google.com/file/d/1xt4B3e6xAAi_hBBaqjhfYe9B4JBYxEyG/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Check exact battery cycle count, designed capacity, and current health percentage.'
  },
  {
    id: 'tt-2',
    title: 'Hard Disk Sentinel Pro 6.20',
    category: 'SSD / HDD Health',
    link: 'https://drive.google.com/file/d/1nm2tcJ16ZTe4XoJc_Yq23gR27pme602X/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Industry-standard SSD & Hard Disk 100% health & performance verification tool.'
  },
  {
    id: 'tt-3',
    title: 'HDTunePro',
    category: 'Disk Benchmark',
    link: 'https://drive.google.com/file/d/1kvhFdigFAe4EnjcdeR3fhs_WNI-e27gY/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Read/Write benchmark and sector error scanner for storage drives.'
  },
  {
    id: 'tt-4',
    title: 'Dead Pixel Tester (v3.0)',
    category: 'Display / Screen',
    link: 'https://drive.google.com/file/d/1GdKUAujUDqM1WZPb-s0d0I9ivsNaHqeJ/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Full-screen color cycle utility to detect dead/stuck pixels on laptop panels.'
  },
  {
    id: 'tt-5',
    title: 'LCD Tester Portable',
    category: 'Display / Screen',
    link: 'https://drive.google.com/file/d/1fLQHgvnhsg26bf0KggASh00jxqCiSjdC/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Color accuracy, grayscale gradation and backlight bleed checker.'
  },
  {
    id: 'tt-6',
    title: 'Keyboard Test Utility',
    category: 'Keyboard / Input',
    link: 'https://drive.google.com/file/d/1sz2fYi9ttxq4NpB4zmgdCiVSGQWWBJDZ/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Interactive on-screen keyboard tester to check every single key response.'
  },
  {
    id: 'tt-7',
    title: 'Keyboard Test Portable',
    category: 'Keyboard / Input',
    link: 'https://drive.google.com/file/d/1a_mQeRSEYLVliWdFInBVeeTDcES9ECkk/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Lightweight portable keypress diagnostic application.'
  },
  {
    id: 'tt-8',
    title: 'FurMark 1.21.1 GPU Stress Test',
    category: 'GPU / Graphics',
    link: 'https://drive.google.com/file/d/1KK_7kB823YlsltX6G3geUYy5Jy8AaqS5/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Heavy stress test for graphics cards and thermal stability.'
  },
  {
    id: 'tt-9',
    title: 'GPU-Z Utility',
    category: 'GPU / Graphics',
    link: 'https://drive.google.com/file/d/11c1Dwyc8bQ0tMbU3wrFYIhuFwOc3Jfa7/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Detailed clock speeds, VRAM, and GPU architecture specifications.'
  },
  {
    id: 'tt-10',
    title: 'HWMonitor x64',
    category: 'Hardware Monitor',
    link: 'https://drive.google.com/file/d/1uQzAeQmvncxOJl9j__dYkQqb-KuDhA4Z/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Real-time CPU temperatures, fan RPM, voltage levels, and wattage.'
  },
  {
    id: 'tt-11',
    title: 'HeavyLoad Benchmark Setup',
    category: 'CPU Stress Test',
    link: 'https://drive.google.com/file/d/1mOxwEWbR-idghBPhAaDI80efE_fpRl2M/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Stress testing CPU cores and cache to guarantee stability under maximum workload.'
  },
  {
    id: 'tt-12',
    title: 'HeavyLoad v3.4',
    category: 'CPU Stress Test',
    link: 'https://drive.google.com/file/d/1zGgBpAOuNP1jnO-n4Us3uju_sLOPTNDA/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Portable CPU & RAM stress-testing utility.'
  },
  {
    id: 'tt-13',
    title: 'Heaven 4.0 Benchmark',
    category: 'Full System 3D',
    link: 'https://drive.google.com/file/d/1cZyK9GP1Muw9irX7kqXSFeY-pYdqJpGw/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Unigine 3D DirectX benchmark for visual rendering performance.'
  },
  {
    id: 'tt-14',
    title: 'MemTest86 USB Bootable',
    category: 'RAM / Memory',
    link: 'https://drive.google.com/file/d/1l5cjL7pE_0bt-aFwgeNUT46YVT8YO2tP/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Comprehensive bootable RAM diagnostic tool to find memory cell defects.'
  },
  {
    id: 'tt-15',
    title: 'CHWiNFO32 Hardware Inspector',
    category: 'Hardware Info',
    link: 'https://drive.google.com/file/d/1dsjcEHy0V5fO_rAsSDG-tj94YYWYdgkB/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Deep motherboard, chipset, PCIe lane, and sensor information.'
  },
  {
    id: 'tt-16',
    title: 'WebCam ECap 1.0.0.9',
    category: 'Camera / WebCam',
    link: 'https://drive.google.com/file/d/1YoJQ9NFxlhFqa7HXM9kE3geMvH91mg-d/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Quick webcam resolution, mic audio, and video feed inspection tool.'
  },
  {
    id: 'tt-17',
    title: 'Cam Test Utility',
    category: 'Camera / WebCam',
    link: 'https://drive.google.com/file/d/1e0-sTLhp1h-eRVTyhZpqu3pZZc5HG8Fs/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Laptop built-in HD web camera testing software.'
  },
  {
    id: 'tt-18',
    title: 'SDI (Snappy Driver Installer) x64',
    category: 'Driver Updater',
    link: 'https://drive.google.com/file/d/1bLo3CvTTCfW-5oA996Q3Sq8fHj13Rk7s/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Automated offline driver installer for all brand laptops.'
  }
];

export const SOFTWARE_LIBRARY: DownloadItem[] = [
  {
    id: 'sw-1',
    title: 'Windows 10 & Office Activator (KMS Auto)',
    category: 'System Utilities',
    link: 'https://drive.google.com/file/d/1Zf2CF41XA9CMje1-nzc3qBtlBCTj_xDR/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Permanent genuine KMS activator for Windows 10 & Microsoft Office.'
  },
  {
    id: 'sw-2',
    title: 'Windows 7, 8.1 & Office Activator (Loader)',
    category: 'System Utilities',
    link: 'https://drive.google.com/file/d/1Zv2IeUj-yQsyyLiZ7_5cwLilFeuW_LNA/view?usp=drive_link',
    source: 'Google Drive',
    description: 'DAZ Windows 7 & 8.1 loader with Office activation.'
  },
  {
    id: 'sw-3',
    title: 'Adobe Photoshop 2022 Full',
    category: 'Graphics & Design',
    link: 'https://drive.google.com/file/d/17dUmaqHZNZuBPb-HjZiVId0Ar67Kp0uv/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Pre-activated Photoshop 2022 with Neural Filters.'
  },
  {
    id: 'sw-4',
    title: 'Adobe Illustrator 2022 Full',
    category: 'Graphics & Design',
    link: 'https://drive.google.com/file/d/1RwbDOMXJy68sUbM9Uu-Gb7LBOIDwqn4z/view?usp=sharing',
    source: 'Google Drive',
    description: 'Full version vector graphics design software.'
  },
  {
    id: 'sw-5',
    title: 'Adobe Photoshop CS 8.0 Lite',
    category: 'Graphics & Design',
    link: 'https://drive.google.com/file/d/1c8t3DCHY1FItPlje4iC6FveACQsfpsxR/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Ultra-fast classic Photoshop for low-spec PCs.'
  },
  {
    id: 'sw-6',
    title: 'AutoCAD 2023 Full Setup',
    category: 'Engineering & CAD',
    link: 'https://drive.google.com/file/d/1_TkMaVjHvsvpndyAl5wY69ZKVQOJlFB0/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Complete 2D/3D architectural CAD package.'
  },
  {
    id: 'sw-7',
    title: 'AutoCAD 2007 Classic Setup',
    category: 'Engineering & CAD',
    link: 'https://drive.google.com/file/d/1mJAPiOshWaV5Yz9nxMHYMJsO5d10lCH0/view?usp=sharing',
    source: 'Google Drive',
    description: 'Lightweight AutoCAD 2007 with installation guide.'
  },
  {
    id: 'sw-8',
    title: 'Wondershare Filmora 14.0 Video Editor',
    category: 'Video Editing',
    link: 'https://drive.google.com/file/d/1WMMRZh4iKF9lofJmh8yanQIh2nRuyMKj/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Full video editing suite with AI features and effects.'
  },
  {
    id: 'sw-9',
    title: 'Internet Download Manager (IDM) 6.42',
    category: 'Download Managers',
    link: 'https://drive.google.com/file/d/1oYVugrvqIMDuRPw75dV5_A6m6wkyHDkU/view?usp=drive_link',
    source: 'Google Drive',
    description: 'High-speed download accelerator with integration patch.'
  },
  {
    id: 'sw-10',
    title: 'WinRAR x64 Bit (Full Lifetime)',
    category: 'Compression',
    link: 'https://drive.google.com/file/d/1YcY9kjBlOSfpuerZ0yurzvXMN0x2eRFT/view?usp=drive_link',
    source: 'Google Drive',
    description: '64-Bit WinRAR with rarreg.key lifetime license.'
  },
  {
    id: 'sw-11',
    title: '7-Zip 64-Bit Compressor',
    category: 'Compression',
    link: 'https://drive.google.com/file/d/1xlj7dMqTnkXq7qKqb0uWvpwzPXVwVP4d/view?usp=sharing',
    source: 'Google Drive',
    description: 'Free open source file archiver with high ratio.'
  },
  {
    id: 'sw-12',
    title: 'Avro Keyboard Bangla',
    category: 'Typing & Bangla',
    link: 'https://drive.google.com/file/d/1dG_h-1yLr5S8zWigvwFeXPp6V_ZU7mGv/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Phonetic Bangla typing software with Unicode fonts.'
  },
  {
    id: 'sw-13',
    title: 'Bijoy 52 (Bayanno) with Activation Code',
    category: 'Typing & Bangla',
    link: 'https://drive.google.com/file/d/1o8v0yvtdQevOCs0ddGYfTa3vFraPMHmE/view?usp=drive_link',
    source: 'Google Drive',
    description: 'ANSI & Unicode Bangla typing software with serial activation key.'
  },
  {
    id: 'sw-14',
    title: 'Typing Master Pro Full',
    category: 'Typing & Bangla',
    link: 'https://drive.google.com/file/d/1wQgQ4VQeJ6-p140NMOGP5Ktm-F31SpT2/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Professional typing tutor with speed building courses.'
  },
  {
    id: 'sw-15',
    title: 'Microsoft Office 2013 Professional Plus',
    category: 'Office Suites',
    link: 'https://drive.google.com/file/d/14TZoZNSQ1hAcmcTkMr2MPr2UgOehqXcR/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Word, Excel, PowerPoint, Access 2013 Pro x64/x86.'
  },
  {
    id: 'sw-16',
    title: 'Rufus 4.3 (Bootable USB Creator)',
    category: 'Boot & ISO Tools',
    link: 'https://mega.nz/file/Y8JRDBZK#gr8pbiMTQiEiCSGkq3L0BCENvmFrVVYAWCbbGx_WAC4',
    source: 'Mega',
    description: 'Create UEFI & MBR bootable USB drives from ISOs.'
  },
  {
    id: 'sw-17',
    title: 'MiniTool Partition Wizard Pro Edition',
    category: 'Disk Management',
    link: 'https://drive.google.com/file/d/1CC_1eCX4cvVgtm3o0snLUuOI2hvdFFGF/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Disk partition resizing, conversion MBR to GPT without data loss.'
  },
  {
    id: 'sw-18',
    title: 'EaseUS Partition Master Full',
    category: 'Disk Management',
    link: 'https://drive.google.com/file/d/1bSfgoCL1adlAIOgggvxF-hgh028zj1lA/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Comprehensive hard drive & SSD partition manager.'
  },
  {
    id: 'sw-19',
    title: 'K-Lite Codec Pack Full',
    category: 'Media Players',
    link: 'https://drive.google.com/file/d/1KjVQr3vMTYK70r4tuJJ7o1U_ct5hl0fO/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Universal media audio and video playback codecs + MPC-HC.'
  },
  {
    id: 'sw-20',
    title: 'iCare Data Recovery Pro',
    category: 'Data Recovery',
    link: 'https://drive.google.com/file/d/1cwT5EZKRTSA7ZzFfS3nxWPq28nP0oMfj/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Recover deleted files from formatted or corrupted drives.'
  },
  {
    id: 'sw-21',
    title: 'Everything Instant File Search Utility',
    category: 'System Utilities',
    link: 'https://drive.google.com/file/d/1s4By2XSuMqo0qE5kU9eRlBmrwtc6MtUR/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Instant lightning-fast filename search tool for Windows.'
  },
  {
    id: 'sw-22',
    title: 'Windows Repair Professional',
    category: 'System Utilities',
    link: 'https://drive.google.com/file/d/1G1obbWUcNL5mHrkWKtb75r9ma3kYuDs0/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Fix registry issues, system file corruptions and permissions.'
  }
];

export const OS_ISOS: DownloadItem[] = [
  {
    id: 'os-1',
    title: 'Windows 11 Pro + Office 2021 Pre-Activated',
    category: 'Operating System',
    link: 'https://drive.google.com/file/d/14MmzwaT1CbVhWj__8Ls5r5zZZMK71ZKV/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Clean Windows 11 64-Bit image with integrated pre-activated Office 2021.'
  },
  {
    id: 'os-2',
    title: 'Windows 10 Pro 64-Bit ISO',
    category: 'Operating System',
    link: 'https://drive.google.com/file/d/1qEg_UJH18QRSKGGT15k97eub2SfP4lb3/view?usp=sharing',
    source: 'Google Drive',
    description: 'Official untouched Windows 10 Pro 64-Bit installation image.'
  },
  {
    id: 'os-3',
    title: 'Windows 10 & 11 Pro With Office 2021 Pre-Active Bundle',
    category: 'Operating System',
    link: 'https://drive.google.com/file/d/1fZNvkHQxRuchTij8OVxNl8XgbjjDR9iH/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Dual Windows 10 & 11 bundle ready for business deployment.'
  },
  {
    id: 'os-4',
    title: 'Multi Boot Pendrive (Ventoy Tool)',
    category: 'Boot Tool',
    link: 'https://drive.google.com/file/d/1s0U5JxgmQU1HxfUqAOEozOwFfAcHPwQi/view?usp=sharing',
    source: 'Google Drive',
    description: 'Boot multiple ISO files directly from a single USB flash drive.'
  },
  {
    id: 'os-5',
    title: '11th Gen Boot VMD Driver File',
    category: 'Driver / Fix',
    link: 'https://drive.google.com/file/d/1z3dV2ON9gO-kztYX2oRW-4i9_kVLPwMy/view?usp=sharing',
    source: 'Google Drive',
    description: 'Intel RST VMD driver to detect NVMe SSDs during Windows installation on 11th Gen laptops.'
  },
  {
    id: 'os-6',
    title: 'Live OS (USB Portable Windows)',
    category: 'Recovery OS',
    link: 'https://drive.google.com/file/d/1hps507ke9nczOXkjE_hqidTvB8yBI50a/view?usp=sharing',
    source: 'Google Drive',
    description: 'Emergency bootable Windows PE to recover files from broken systems.'
  },
  {
    id: 'os-7',
    title: 'Windows 7 Final Version with Drivers',
    category: 'Legacy OS',
    link: 'https://drive.google.com/file/d/1gPVpMmJQfy3JFuLOOef9345VxFf-Mtn5/view?usp=sharing',
    source: 'Google Drive',
    description: 'Clean Windows 7 Ultimate SP1 64-bit with USB 3.0 & NVMe patches.'
  },
  {
    id: 'os-8',
    title: 'Acronis True Image 2018 Backup',
    category: 'Disk Imaging',
    link: 'https://drive.google.com/file/d/1pGZNprJytt1parTu7I1PcS6VAqS4B4IN/view?usp=sharing',
    source: 'Google Drive',
    description: 'Full system partition cloning and image restore tool.'
  },
  {
    id: 'os-9',
    title: 'Windows Admin Password Reset Tool',
    category: 'Password Recovery',
    link: 'https://drive.google.com/file/d/1u0S9Ux5Qd_XmFtMEz3F6EdC_iYBrgDvW/view?usp=drive_link',
    source: 'Google Drive',
    description: 'Unlock and remove forgotten Windows login passwords.'
  }
];

export const WARRANTY_TIERS: WarrantyTier[] = [
  {
    id: 'dubai-original',
    title: 'Dubai Original Business Laptop Policy',
    titleBn: 'দুবাই অরিজিনাল বিজনেস ল্যাপটপ পলিসি',
    titleHi: 'दुबई ओरिजिनल बिजनेस लैपटॉप वारंटी पॉलिसी',
    badge: 'Recommended • Maximum Peace of Mind',
    badgeBn: 'সবচেয়ে জনপ্রিয় • শতভাগ নিরাপদ',
    badgeHi: 'अनुशंसित • पूर्ण मानसिक शांति',
    badgeColor: 'bg-emerald-600 text-white',
    emoji: '🏆',
    descriptionBn: `সম্পূর্ণ ল্যাপটপের ১ মাসের রিপ্লেস পাবেন (স্পেয়ার পার্টস সহ)। SSD এর ক্ষেত্রে ১ বছরের রিপ্লেস পাবেন এবং ৬ মাসের RAM রিপ্লেস পাবেন (শর্ত সাপেক্ষে)। ৫ বছরের সার্ভিস ওয়ারেন্টি পাবেন এবং লাইফ টাইম এক্সচেঞ্জ সুবিধা পাবেন (শর্ত সাপেক্ষে)।`,
    descriptionEn: `1 Month full laptop replacement guarantee (including spare parts). 1 Year replacement for SSD and 6 Months replacement for RAM (terms apply). 5 Years free service warranty and lifetime exchange facility (terms apply).`,
    descriptionHi: `पूरे लैपटॉप की 1 महीने की रिप्लेसमेंट गारंटी (स्पेयर पार्ट्स सहित)। SSD के लिए 1 साल का रिप्लेसमेंट और RAM के लिए 6 महीने का रिप्लेसमेंट (शर्तों के अनुसार)। 5 साल की फ्री सर्विस वारंटी और लाइफटाइम एक्सचेंज सुविधा।`,
    highlights: [
      '১ মাস সম্পূর্ণ ল্যাপটপ পার্টস-সহ রিপ্লেসমেন্ট গ্যারান্টি',
      'SSD এর জন্য ১ বছর পূর্ণ রিপ্লেসমেন্ট',
      'RAM এর জন্য ৬ মাস রিপ্লেসমেন্ট',
      '৫ বছরের সম্পূর্ণ ফ্রি সার্ভিস ওয়ারেন্টি',
      'লাইফ-টাইম এক্সচেঞ্জ সুবিধা (শর্তসাপেক্ষে)'
    ],
    highlightsEn: [
      '1 Month Full Laptop & Spare Parts Replacement Guarantee',
      '1 Year Complete Replacement for SSD',
      '6 Months Replacement for RAM',
      '5 Years Free Service Warranty',
      'Lifetime Exchange Facility (T&C Apply)'
    ],
    highlightsHi: [
      '1 महीना पूरा लैपटॉप और पार्ट्स रिप्लेसमेंट गारंटी',
      'SSD के लिए 1 साल पूर्ण रिप्लेसमेंट',
      'RAM के लिए 6 महीने रिप्लेसमेंट',
      '5 साल पूरी तरह से मुफ़्त सर्विस वारंटी',
      'लाइफटाइम एक्सचेंज सुविधा (नियम व शर्तें लागू)'
    ]
  },
  {
    id: 'china-product',
    title: 'China Laptop Warranty Policy',
    titleBn: 'চায়না ল্যাপটপ ওয়ারেন্টি পলিসি',
    titleHi: 'चाइना लैपटॉप वारंटी पॉलिसी',
    badge: 'Standard Budget Tier',
    badgeBn: 'বাজেট টিয়ার',
    badgeHi: 'मानक बजट श्रेणी',
    badgeColor: 'bg-amber-600 text-white',
    emoji: '👍',
    descriptionBn: `যে সকল ল্যাপটপ কালার করা এবং SSD এবং RAM নরমাল China সে সকল ল্যাপটপের শুধুমাত্র ১৫ দিনের স্পেয়ার পার্টস রিপ্লেস পাবেন। বিক্রয় তারিখ হতে ১ দিন বেশি হলে পার্টসের দাম দিতে হবে।`,
    descriptionEn: `Laptops that have been repainted with standard China SSD and RAM have a 15-day spare parts replacement period. After 15 days from the purchase date, spare parts will be charged at standard price.`,
    descriptionHi: `जो लैपटॉप री-पेंट किए गए हैं और सामान्य चाइना SSD और RAM वाले हैं, उनके लिए केवल 15 दिनों का स्पेयर पार्ट्स रिप्लेसमेंट मिलता है। बिक्री तिथि के 15 दिन बाद पार्ट्स का भुगतान करना होगा।`,
    highlights: [
      '১৫ দিনের স্পেয়ার পার্টস রিপ্লেসমেন্ট সুবিধা',
      '১৫ দিন অতিবাহিত হলে পার্টসের নির্ধারিত মূল্য প্রযোজ্য',
      'স্বচ্ছ ও স্পষ্ট টার্মস অ্যান্ড কন্ডিশন'
    ],
    highlightsEn: [
      '15 Days Spare Parts Replacement Facility',
      'Standard Parts Pricing Applies After 15 Days',
      'Transparent and Honest Terms & Conditions'
    ],
    highlightsHi: [
      '15 दिन स्पेयर पार्ट्स रिप्लेसमेंट सुविधा',
      '15 दिन बीतने के बाद निर्धारित पार्ट्स मूल्य लागू',
      'पारदर्शी और स्पष्ट नियम व शर्तें'
    ]
  },
  {
    id: 'local-laptop',
    title: 'Local Laptop (BD-Stall Type) Policy',
    titleBn: 'লোকাল টানা ল্যাপটপ পলিসি',
    titleHi: 'लोकल री-पेंट लैपटॉप पॉलिसी',
    badge: 'Entry Level',
    badgeBn: 'এন্ট্রি লেভেল',
    badgeHi: 'प्रवेश स्तर',
    badgeColor: 'bg-slate-700 text-white',
    emoji: '🤔',
    descriptionBn: `ঢাকার টানা মাল যেগুলা কালার করা ওই সকল ল্যাপটপের কোন গ্যারান্টি নাই। শুধু মাত্র ৭ দিনের সার্ভিস ওয়ারেন্টি পাবেন।`,
    descriptionEn: `Local market repainted laptops do not carry a replacement guarantee. Only 7 days of service warranty is provided.`,
    descriptionHi: `स्थानीय मार्केट के री-पेंटेड लैपटॉप पर कोई गारंटी नहीं होती है। केवल 7 दिनों की सर्विस वारंटी दी जाती है।`,
    highlights: [
      '৭ দিনের সাধারণ সার্ভিস ওয়ারেন্টি',
      'স্বচ্ছ প্রোডাক্ট ডেসক্রিপশন যাতে গ্রাহক কোনো বিভ্রান্তিতে না পড়েন'
    ],
    highlightsEn: [
      '7 Days General Service Warranty',
      'Clear Product Description to Avoid Any Misunderstanding'
    ],
    highlightsHi: [
      '7 दिनों की सामान्य सर्विस वारंटी',
      'स्पष्ट उत्पाद विवरण ताकि ग्राहक को कोई भ्रम न हो'
    ]
  }
];
