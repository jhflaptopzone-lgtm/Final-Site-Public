import React, { useState, useEffect, useRef } from 'react';
import { Product, LaptopCondition } from '../types';
import { X, Save, Sparkles, Image, Check, AlertCircle, Plus, Upload } from 'lucide-react';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  productToEdit?: Product | null;
}

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    slug: '',
    brand: 'Lenovo' as Product['brand'],
    model: '',
    category: 'Business Laptop' as Product['category'],
    condition: 'Dubai Grade A++' as LaptopCondition,
    processor: 'Intel Core i5-1135G7',
    generation: '11th Gen',
    ram: '16GB DDR4',
    storage: '512GB NVMe SSD',
    graphics: 'Intel Iris Xe Graphics',
    display: '14.0" Full HD IPS Anti-Glare',
    screenSize: '14.0"',
    resolution: '1920x1080',
    batteryCondition: 'Original Battery 4-5 Hours Backup',
    keyboardCondition: 'Original Backlit Keyboard',
    bodyCondition: 'A++ Scratchless Business Chassis',
    operatingSystem: 'Windows 11 Pro 64-bit Genuine',
    includedAccessories: 'Original Charger, Power Cord, Laptop Bag, Wireless Mouse',
    purchasePrice: 38000,
    sellingPrice: 46500,
    discountPrice: 45000,
    stockQuantity: 5,
    minimumStockAlert: 2,
    warranty: '1 Month Replacement + 5 Years Free Service Warranty',
    shortDescription: 'Military-grade tested business laptop imported directly from Dubai.',
    specifications: 'Thunderbolt 4, HDMI, USB 3.2, HD Webcam with privacy shutter.',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80',
    status: 'published' as Product['status'],
    isFeatured: true,
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        sku: productToEdit.sku,
        name: productToEdit.name,
        slug: productToEdit.slug,
        brand: productToEdit.brand,
        model: productToEdit.model,
        category: productToEdit.category,
        condition: productToEdit.condition,
        processor: productToEdit.processor,
        generation: productToEdit.generation,
        ram: productToEdit.ram,
        storage: productToEdit.storage,
        graphics: productToEdit.graphics,
        display: productToEdit.display,
        screenSize: productToEdit.screenSize,
        resolution: productToEdit.resolution,
        batteryCondition: productToEdit.batteryCondition,
        keyboardCondition: productToEdit.keyboardCondition,
        bodyCondition: productToEdit.bodyCondition,
        operatingSystem: productToEdit.operatingSystem,
        includedAccessories: productToEdit.includedAccessories.join(', '),
        purchasePrice: productToEdit.purchasePrice,
        sellingPrice: productToEdit.sellingPrice,
        discountPrice: productToEdit.discountPrice || productToEdit.sellingPrice,
        stockQuantity: productToEdit.stockQuantity,
        minimumStockAlert: productToEdit.minimumStockAlert,
        warranty: productToEdit.warranty,
        shortDescription: productToEdit.shortDescription,
        specifications: productToEdit.specifications,
        imageUrl: productToEdit.images[0] || '',
        status: productToEdit.status,
        isFeatured: productToEdit.isFeatured,
      });
    } else {
      // Auto-generate SKU
      const randomNum = Math.floor(10 + Math.random() * 90);
      setFormData((prev) => ({
        ...prev,
        sku: `JHF-LP-${randomNum}`,
      }));
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const profitMargin = formData.sellingPrice - formData.purchasePrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const accessoriesArray = formData.includedAccessories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      includedAccessories: accessoriesArray,
      images: [formData.imageUrl],
      profitMargin,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    onSave(payload);
    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setFormData((prev) => ({ ...prev, imageUrl: res }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-white">
              {productToEdit ? 'Edit Laptop Details' : 'Add New Laptop to Inventory'}
            </h2>
            <p className="text-xs text-slate-400">Complete specifications, inventory control, and profit margins</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-5 text-xs">
          
          {/* Section 1: Basic Info */}
          <div>
            <div className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>1. Basic Identification &amp; Model</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">SKU Number *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Full Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Lenovo ThinkPad L14 Gen-2 (Core i5 11th Gen / 16GB / 512GB SSD)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brand *</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Lenovo">Lenovo (ThinkPad Series)</option>
                  <option value="HP">HP (EliteBook Series)</option>
                  <option value="Dell">Dell (Latitude Series)</option>
                  <option value="Apple">Apple (MacBook)</option>
                  <option value="Asus">Asus</option>
                  <option value="Acer">Acer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., ThinkPad L14 Gen 2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Condition Grade *</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Dubai Grade A++">Dubai Grade A++ (Pristine)</option>
                  <option value="Grade A+">Grade A+ (Near New)</option>
                  <option value="Grade A">Grade A (Normal Used)</option>
                  <option value="Brand New">Brand New Sealed</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specifications */}
          <div>
            <div className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span>2. Technical Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Processor</label>
                <input
                  type="text"
                  value={formData.processor}
                  onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                  placeholder="Intel Core i5-1135G7"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Generation</label>
                <input
                  type="text"
                  value={formData.generation}
                  onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                  placeholder="11th Gen"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">RAM Capacity</label>
                <input
                  type="text"
                  value={formData.ram}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  placeholder="16GB DDR4"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Storage Drive</label>
                <input
                  type="text"
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  placeholder="512GB NVMe SSD"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Graphics</label>
                <input
                  type="text"
                  value={formData.graphics}
                  onChange={(e) => setFormData({ ...formData, graphics: e.target.value })}
                  placeholder="Intel Iris Xe Graphics"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Display &amp; Panel</label>
                <input
                  type="text"
                  value={formData.display}
                  onChange={(e) => setFormData({ ...formData, display: e.target.value })}
                  placeholder="14.0&quot; Full HD IPS Anti-Glare"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Battery Health &amp; Backup</label>
                <input
                  type="text"
                  value={formData.batteryCondition}
                  onChange={(e) => setFormData({ ...formData, batteryCondition: e.target.value })}
                  placeholder="4-5 Hours Backup"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operating System</label>
                <input
                  type="text"
                  value={formData.operatingSystem}
                  onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })}
                  placeholder="Windows 11 Pro Genuine"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Warranty Period</label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  placeholder="1 Month Replacement + 5 Years Free Service"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-300 font-semibold mb-1">Included Accessories (comma separated)</label>
              <input
                type="text"
                value={formData.includedAccessories}
                onChange={(e) => setFormData({ ...formData, includedAccessories: e.target.value })}
                placeholder="Original Charger, Power Cord, Laptop Bag, Wireless Mouse"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Section 3: Financials & Stock Control */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>3. Financials &amp; Stock Inventory</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Purchase Cost (৳) *</label>
                <input
                  type="number"
                  required
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Selling Price (৳) *</label>
                <input
                  type="number"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Low Stock Alert Limit</label>
                <input
                  type="number"
                  min={1}
                  value={formData.minimumStockAlert}
                  onChange={(e) => setFormData({ ...formData, minimumStockAlert: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Calculated Profit per Unit:</span>
              <span className={`font-bold text-sm ${profitMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ৳{profitMargin.toLocaleString()} ({formData.purchasePrice > 0 ? Math.round((profitMargin / formData.purchasePrice) * 100) : 0}%)
              </span>
            </div>
          </div>

          {/* Section 4: Image & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold text-xs">Laptop Photo / Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={photoInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Photo from Device</span>
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Paste image URL (https://...) or upload above"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />

              {formData.imageUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">✓ Image Loaded Successfully</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Publishing Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="published">Published (Live on Catalog)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-200 font-semibold">Mark as Featured Laptop (Front Page Hero)</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{productToEdit ? 'Save Changes' : 'Create Laptop'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
