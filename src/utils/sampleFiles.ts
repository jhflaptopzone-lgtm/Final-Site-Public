import { StoredFile } from '../types/file';
import { calculateSha256 } from './fileHelpers';

export async function createSampleFiles(): Promise<StoredFile[]> {
  const now = Date.now();

  // 1. Sample Markdown Documentation file
  const markdownText = `# Project Readme & Overview

Welcome to **File Uploader**!
This application lets you upload, inspect, and organize your files right in your browser.

## Key Features
- **Drag & Drop & Browse**: Select any file format (images, documents, media, code, archives)
- **Instant Metadata**: Extracted file dimensions, size, duration, and SHA-256 integrity checksums
- **Rich In-App Previews**: High-resolution image zoom, interactive CSV spreadsheets, markdown & syntax viewing
- **Browser Persistence**: Uploaded assets persist safely in browser storage without size constraints

### Sample Table
| Feature | Status | Technology |
| :--- | :--- | :--- |
| File Storage | Ready | IndexedDB Blob Storage |
| Integrity | Ready | Web Crypto SHA-256 |
| Responsive | Ready | Tailwind CSS |

*Happy uploading!*
`;
  const mdBlob = new Blob([markdownText], { type: 'text/markdown' });
  const mdHash = await calculateSha256(mdBlob);

  // 2. Sample SVG Vector Graphic
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#27272a" />
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" rx="20" fill="url(#g1)" />
  <circle cx="200" cy="120" r="48" fill="url(#g2)" opacity="0.9" />
  <path d="M180 120 L195 135 L225 105" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <text x="200" y="210" fill="#f4f4f5" font-size="18" font-family="system-ui, sans-serif" font-weight="600" text-anchor="middle">Vector Asset Graphic</text>
  <text x="200" y="235" fill="#a1a1aa" font-size="13" font-family="system-ui, sans-serif" text-anchor="middle">Ready for deployment</text>
</svg>`;
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
  const svgHash = await calculateSha256(svgBlob);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;

  // 3. Sample CSV Dataset
  const csvContent = `id,product_name,category,price,inventory_count,status
101,Acoustic Headphones,Audio,149.99,42,In Stock
102,Mechanical Keyboard,Peripherals,119.50,18,In Stock
103,4K Ultra-Wide Monitor,Displays,499.00,7,Low Stock
104,Wireless Ergo Mouse,Peripherals,69.00,85,In Stock
105,USB-C Hub Pro,Accessories,45.00,0,Out of Stock`;
  const csvBlob = new Blob([csvContent], { type: 'text/csv' });
  const csvHash = await calculateSha256(csvBlob);

  return [
    {
      id: 'sample-image-1',
      name: 'banner_asset.svg',
      size: svgBlob.size,
      type: 'image/svg+xml',
      category: 'image',
      blob: svgBlob,
      dataUrl: svgDataUrl,
      createdAt: now - 3600000 * 2,
      lastModified: now - 3600000 * 2,
      sha256: svgHash,
      dimensions: { width: 400, height: 300 },
      tags: ['asset', 'illustration'],
      favorite: true,
      notes: 'Sample vector image demonstrating instant preview and metadata.',
    },
    {
      id: 'sample-doc-1',
      name: 'README.md',
      size: mdBlob.size,
      type: 'text/markdown',
      category: 'code',
      blob: mdBlob,
      textContent: markdownText,
      createdAt: now - 3600000 * 5,
      lastModified: now - 3600000 * 5,
      sha256: mdHash,
      tags: ['docs', 'guide'],
      favorite: false,
      notes: 'Sample documentation file with markdown rendering.',
    },
    {
      id: 'sample-csv-1',
      name: 'inventory_catalog.csv',
      size: csvBlob.size,
      type: 'text/csv',
      category: 'code',
      blob: csvBlob,
      textContent: csvContent,
      createdAt: now - 3600000 * 12,
      lastModified: now - 3600000 * 12,
      sha256: csvHash,
      tags: ['data', 'inventory'],
      favorite: false,
      notes: 'Sample tabular dataset demonstrating table preview mode.',
    },
  ];
}
