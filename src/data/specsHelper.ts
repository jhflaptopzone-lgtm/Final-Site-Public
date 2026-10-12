import React from 'react';
import {
  LaptopItem,
  DownloadItem,
  WarrantyTier,
  STORE_INFO,
  LAPTOPS_DATA,
  TESTING_TOOLS,
  SOFTWARE_LIBRARY,
  OS_ISOS,
  WARRANTY_TIERS
} from '../data/jhfData';

export interface DetailedLaptopSpecs {
  brand: string;
  condition: string;
  laptopType: string;
  processorType: string;
  processorSpeed: string;
  chipset: string;
  screenSize: string;
  ram: string;
  hardDisk: string;
  diskType: string;
  graphicsCard: string;
  audioSpeaker: string;
  networking: string;
  webcam: string;
  cardReader: string;
  battery: string;
  keyboard: string;
  extraSlot: string;
  productWeight: string;
  series: string;
  productWarranty: string;
  replacementGuarantee: string;
  serviceWarranty: string;
  description: string[];
  security: string;
  color: string;
  charger: string;
  portsSlots: string;
}

export function getDetailedSpecsForLaptop(laptop: LaptopItem): DetailedLaptopSpecs {
  const isLenovo = laptop.brand === 'Lenovo';
  const isHP = laptop.brand === 'HP';
  const isDell = laptop.brand === 'Dell';

  if (laptop.id === 'lenovo-l14-gen2') {
    return {
      brand: 'Lenovo',
      condition: 'Used (A Grade 100% Fresh Dubai Import)',
      laptopType: 'Standard Business Laptop / Ultrabook',
      processorType: 'Intel Core i5 11th Gen 1135G7 (4 Cores, 8 Threads, 8MB Cache)',
      processorSpeed: '2.40 GHz Base Clock, up to 4.20 GHz Intel Turbo Boost',
      chipset: 'Intel Integrated SoC',
      screenSize: '14.0" Full HD (1920 x 1080) IPS Anti-Glare 250 Nits Display',
      ram: '16 GB DDR4 3200 MHz High-Speed RAM (Upgradable to 64GB)',
      hardDisk: '512 GB M.2 NVMe PCIe High Speed SSD',
      diskType: 'M.2 NVMe PCIe SSD',
      graphicsCard: 'Intel Iris Xe Graphics (Shared up to 8GB Graphics)',
      audioSpeaker: 'Dolby Audio Premium Stereo Speakers, Dual Array Mic',
      networking: 'Intel Wi-Fi 6 AX201 (2x2 802.11ax) + Bluetooth 5.2 + Gigabit LAN RJ-45',
      webcam: '720p HD Camera with ThinkShutter Physical Privacy Switch',
      cardReader: 'MicroSD Card Reader',
      battery: '3-Cell 45Wh Li-Polymer Fast Charge (3 to 5 Hours Tested Backup)',
      keyboard: 'Standard Spill-resistant ThinkPad Ergonomic Keyboard',
      extraSlot: '1x Extra RAM Slot available, M.2 SSD replaceable',
      productWeight: 'Approx 1.59 kg',
      series: 'Lenovo ThinkPad L-Series (L14 Gen 2)',
      productWarranty: 'Dubai Original Laptop Warranty',
      replacementGuarantee: '30 Days Full Replacement Guarantee (Parts Included)',
      serviceWarranty: '05 Years Free Service Warranty',
      description: [
        'Lenovo ThinkPad L14 Gen-2 delivers business-grade durability and power for heavy multitasking.',
        'Equipped with 11th Gen Core i5 Intel Iris Xe graphics capable of smooth 4K video rendering and light graphic tasks.',
        'Military MIL-STD-810H certified chassis with spill-resistant keyboard.',
        'Full HD Anti-Glare IPS display offers comfortable viewing during long working hours.',
        'USB Type-C Thunderbolt 4 port supports fast charging and multi-monitor output.'
      ],
      security: 'TPM 2.0 Security Chip, ThinkShutter Privacy Cover, Kensington Lock',
      color: 'Matte Black',
      charger: 'Original Lenovo 65W Type-C Fast Charger Included',
      portsSlots: '1x Thunderbolt 4 / USB4, 1x USB-C 3.2 Gen 1, 2x USB-A 3.2 Gen 1, 1x HDMI 2.0, 1x RJ45, 1x Audio Combo, 1x MicroSD'
    };
  }

  if (laptop.id === 'lenovo-t14s-gen1') {
    return {
      brand: 'Lenovo',
      condition: 'Used (A Grade 100% Fresh Dubai Import)',
      laptopType: 'Ultra-Slim Premium Executive Laptop',
      processorType: 'Intel Core i5 10th Gen 10210U (4 Cores, 8 Threads)',
      processorSpeed: '1.60 GHz Base, up to 4.20 GHz Turbo',
      chipset: 'Intel SoC',
      screenSize: '14.0" FHD (1920x1080) IPS Anti-Glare 300 Nits Thin Bezel',
      ram: '16 GB DDR4 Dual Channel High Speed RAM',
      hardDisk: '512 GB M.2 NVMe PCIe SSD',
      diskType: 'M.2 NVMe SSD',
      graphicsCard: 'Intel UHD Graphics 620',
      audioSpeaker: 'Dolby Audio Speaker System with Dual Far-Field Mics',
      networking: 'Wi-Fi 6 AX201 802.11ax + Bluetooth 5.1',
      webcam: '720p HD with ThinkShutter Camera Privacy',
      cardReader: 'MicroSD Card Reader',
      battery: '57Wh High-Capacity Battery (4 to 6 Hours Tested Backup)',
      keyboard: 'Backlit Spill-Resistant Precision ThinkPad Keyboard',
      extraSlot: 'M.2 NVMe Slot',
      productWeight: '1.27 kg (Super Lightweight Carbon Fiber & Magnesium)',
      series: 'Lenovo ThinkPad T-Series (T14s Slim)',
      productWarranty: 'Dubai Original Laptop Warranty',
      replacementGuarantee: '30 Days Full Replacement Guarantee',
      serviceWarranty: '05 Years Free Service Warranty',
      description: [
        'Super slim lightweight flagship business ultrabook with premium magnesium chassis.',
        'High battery endurance perfect for travel, presentations, and remote work.',
        'Crisp FHD IPS display with anti-reflective coating.',
        'Type-C rapid charge technology reaching 80% charge in 60 minutes.'
      ],
      security: 'Match-on-Chip Touch Fingerprint Reader, dTPM 2.0',
      color: 'Classic ThinkPad Matte Black',
      charger: 'Original Lenovo 65W Type-C Fast Charger Included',
      portsSlots: '2x USB 3.2 Gen 1, 2x USB-C (1x Thunderbolt 3), 1x HDMI 1.4b, Headphone/Mic, MicroSD'
    };
  }

  if (laptop.id === 'hp-840-g8-32gb' || laptop.id === 'hp-840-g8-16gb') {
    const is32 = laptop.id === 'hp-840-g8-32gb';
    return {
      brand: 'HP',
      condition: 'Used (A Grade 100% Fresh Dubai Import)',
      laptopType: 'Premium Business CNC Aluminum Ultrabook',
      processorType: 'Intel Core i5 11th Gen 1135G7 / 1145G7 vPro (8MB Cache)',
      processorSpeed: '2.40 GHz Base Clock, up to 4.20 GHz Turbo',
      chipset: 'Intel Integrated SoC',
      screenSize: '14.0" Full HD (1920 x 1080) IPS eDP Anti-Glare 400 Nits 100% sRGB',
      ram: is32 ? '32 GB DDR4 3200MHz Dual Channel RAM' : '16 GB DDR4 3200MHz RAM',
      hardDisk: '512 GB PCIe Gen3x4 NVMe SSD',
      diskType: 'M.2 NVMe PCIe SSD',
      graphicsCard: 'Intel Iris Xe Graphics (up to 16GB Dynamic Shared Graphics)',
      audioSpeaker: 'Audio by Bang & Olufsen, Quad High-Definition Speakers, Dual Multi-Array Mic',
      networking: 'Intel Wi-Fi 6 AX201 (2x2) + Bluetooth 5.0',
      webcam: '720p HD IR Privacy Camera with Windows Hello Facial Recognition',
      cardReader: 'Smart Card & Nano SIM slot support',
      battery: '3-Cell 53Wh Long Life Battery (4 to 6 Hours Tested Backup)',
      keyboard: 'HP Premium Backlit Spill-resistant Keyboard with Drain System',
      extraSlot: '2x SODIMM Slots (Both Upgradeable)',
      productWeight: '1.35 kg (Full Aircraft-Grade CNC Aluminum Unibody)',
      series: 'HP EliteBook 800 G8 Series (840 G8)',
      productWarranty: 'Dubai Original Laptop Warranty',
      replacementGuarantee: '30 Days Full Replacement Guarantee (Parts Included)',
      serviceWarranty: '05 Years Free Service Warranty',
      description: [
        'Flagship executive laptop made of 100% CNC machined silver aluminum body.',
        'Bang & Olufsen high-fidelity audio system with exceptional clarity for meetings and media.',
        'Bright 400 Nits Full HD IPS display with accurate color reproduction.',
        'Dual Thunderbolt 4 ports with Power Delivery and DisplayPort 1.4 support.'
      ],
      security: 'HP Sure View Privacy, IR Face Unlock, Touch Fingerprint Sensor, TPM 2.0',
      color: 'Natural Silver Aluminum',
      charger: 'Original HP 65W Type-C Fast Charger Included',
      portsSlots: '2x Thunderbolt 4 / USB-C 40Gbps, 2x SuperSpeed USB-A 5Gbps, 1x HDMI 2.0, 1x Audio combo'
    };
  }

  // Generic fallback generator
  return {
    brand: laptop.brand,
    condition: 'Used (A Grade 100% Fresh Dubai Import)',
    laptopType: 'Business-Class Reliable Laptop',
    processorType: laptop.title.includes('i7')
      ? 'Intel Core i7 High Performance Quad/Hexa Core'
      : laptop.title.includes('11th')
      ? 'Intel Core i5 11th Gen High-Efficiency Processor'
      : laptop.title.includes('10th')
      ? 'Intel Core i5 10th Gen Quad Core'
      : 'Intel Core i5 8th Gen Quad Core Turbo Processor',
    processorSpeed: '1.90 GHz Base, up to 4.20 GHz with Intel Turbo Boost',
    chipset: 'Intel Integrated Chipset',
    screenSize: '14.0" Full HD (1920 x 1080) IPS Anti-Glare Display',
    ram: laptop.title.includes('32GB') ? '32 GB DDR4' : laptop.title.includes('16GB') ? '16 GB DDR4' : '8 GB DDR4',
    hardDisk: laptop.title.includes('512GB') ? '512 GB M.2 NVMe SSD' : '256 GB M.2 NVMe SSD',
    diskType: 'M.2 NVMe PCIe High Speed SSD',
    graphicsCard: laptop.title.includes('11th') ? 'Intel Iris Xe Graphics' : 'Intel UHD Graphics 620',
    audioSpeaker: isHP ? 'Bang & Olufsen Stereo Speakers' : 'Dolby Audio HD Stereo Speakers',
    networking: 'Intel Dual-Band Wi-Fi + Bluetooth + Gigabit Ethernet',
    webcam: '720p HD Webcam with Privacy Shutter',
    cardReader: 'Multi-Format SD / MicroSD Reader',
    battery: 'Li-Ion Fast Charge (3 to 5 Hours Tested Battery Life)',
    keyboard: 'Spill-Resistant Ergonomic Keyboard (Backlit Support)',
    extraSlot: 'RAM & SSD Upgradeable Slots',
    productWeight: 'Approx 1.45 kg',
    series: laptop.series,
    productWarranty: 'Dubai Original Business Laptop Warranty',
    replacementGuarantee: '30 Days Full Replacement Guarantee (Parts Included)',
    serviceWarranty: '05 Years Free Service Warranty',
    description: [
      `${laptop.title} is thoroughly hardware-tested with 100% health SSD and verified battery health.`,
      'Ideal for programming, freelancing, office work, online teaching, AutoCAD, and multitasking.',
      'Military-grade durable casing ensuring longevity and scratch resistance.',
      'Ready to use with pre-installed clean Windows 10/11 Pro and essential utility software.'
    ],
    security: 'Fingerprint Reader, TPM 2.0 Security, Kensington Lock Slot',
    color: isHP ? 'Silver Aluminum' : isDell ? 'Gunmetal Grey' : 'Matte Black',
    charger: 'Original Fast Power Adapter Included',
    portsSlots: 'USB Type-C, USB 3.1 Ports, HDMI, RJ45 LAN, 3.5mm Headphone Jack'
  };
}
