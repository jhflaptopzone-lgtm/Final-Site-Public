import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, LaptopCondition } from '../types';
import { useAdminStore } from '../adminStore';
import {
  LAPTOP_MODEL_CATALOG,
  LaptopCatalogModel,
  searchLaptopCatalog,
  RAM_PRESETS,
  RAM_TYPE_PRESETS,
  STORAGE_PRESETS,
  STORAGE_TYPE_PRESETS,
  CONDITION_OPTIONS,
  GRADE_OPTIONS,
  BATTERY_STATUS_OPTIONS,
  WARRANTY_OPTIONS,
  POPULAR_BRANDS,
  generateSmartSku,
} from '../data/laptopModelCatalog';
import { BarcodeGenerator } from './BarcodeGenerator';
import {
  X,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Printer,
  Copy,
  Layers,
  Save,
  ShieldCheck,
  BatteryCharging,
  Cpu,
  HardDrive,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  ExternalLink,
  Eye,
  DollarSign,
  Bookmark,
  Sliders,
} from 'lucide-react';

interface SmartProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  productToEdit?: Product | null;
  duplicateFromProduct?: Product | null;
}

interface FieldAutoState {
  [key: string]: boolean; // true if auto-loaded, false if customized by user
}

export const SmartProductAddModal: React.FC<SmartProductAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  duplicateFromProduct,
}) => {
  const { products } = useAdminStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Search state
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [searchBrandFilter, setSearchBrandFilter] = useState<string>('all');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const [selectedCatalogModel, setSelectedCatalogModel] = useState<LaptopCatalogModel | null>(null);

  // Auto vs Custom field tracker
  const [autoFields, setAutoFields] = useState<FieldAutoState>({});

  // Active Collapsible Sections
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    specs: true,
    batteryCondition: true,
    pricing: true,
    inventory: true,
    media: true,
    advanced: false,
  });

  // Save workflow state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'validating' | 'saving' | 'success'>('idle');
  const [savedProductSummary, setSavedProductSummary] = useState<{
    name: string;
    sku: string;
    price: number;
    stock: number;
  } | null>(null);

  // Barcode print modal
  const [isBarcodePrintOpen, setIsBarcodePrintOpen] = useState(false);

  // Templates
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    slug: '',
    brand: 'HP' as Product['brand'],
    series: 'EliteBook',
    model: '840 G8',
    generation: '11th Gen',
    category: 'Business Laptop' as Product['category'],
    condition: 'Dubai Grade A++' as LaptopCondition,
    grade: 'A++' as 'A++' | 'A+' | 'A' | 'B+' | 'B' | 'C',
    serialNumber: '',
    
    // Processor
    processor: 'Intel Core i5-1135G7 (up to 4.20 GHz)',
    
    // RAM
    ram: '16GB',
    ramType: 'DDR4-3200MHz',
    
    // Storage
    storage: '512GB NVMe SSD',
    storageType: 'NVMe M.2 SSD',
    
    // Display & Graphics
    display: '14.0" Full HD (1920x1080) IPS Anti-Glare 400 nits',
    screenSize: '14.0"',
    resolution: '1920x1080',
    refreshRate: '60Hz',
    graphics: 'Intel Iris Xe Graphics',
    vram: 'Shared Dynamic',
    
    // Connectivity & Hardware
    ports: '2x Thunderbolt 4 Type-C, 2x USB 3.2 Gen 1, 1x HDMI 2.0b, Audio combo',
    camera: '720p HD Privacy Camera with IR',
    keyboard: 'Backlit Spill-resistant Keyboard',
    wifi: 'Intel Wi-Fi 6 AX201 (2x2)',
    bluetooth: 'Bluetooth 5.0',
    operatingSystem: 'Windows 11 Pro 64-bit Genuine',
    includedAccessories: 'Original Charger, Power Cord, Laptop Bag, Wireless Mouse',
    
    // Battery
    batteryCondition: 'HP Long Life 3-cell 53Wh (Excellent)',
    batteryHealth: 94,
    cycleCount: 95,
    batteryBackupHours: '5–7 hours',
    batteryStatus: 'Excellent' as 'Excellent' | 'Good' | 'Fair' | 'Needs Replacement',
    
    // Warranty
    warranty: '1 Month Replacement + 5 Years Free Service',
    
    // Pricing
    purchasePrice: 42000,
    repairCost: 0,
    otherCost: 0,
    sellingPrice: 49500,
    discountPrice: 48000,
    
    // Inventory
    stockQuantity: 5,
    minimumStockAlert: 2,
    
    // Media & Descriptions
    shortDescription: 'Military-grade tested business laptop with pristine motherboard health.',
    specifications: 'Thunderbolt 4, IPS Anti-Glare Display, Backlit Keyboard, All-day Battery.',
    images: [
      'https://images.unsplash.com/photo-1544731612-de292439cc67?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'published' as Product['status'],
    isFeatured: true,
    specificationSource: 'Model Catalog' as Product['specificationSource'],
  });

  // Validation errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Load saved templates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jhf_laptop_templates');
      if (stored) {
        setSavedTemplates(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize or reset form based on productToEdit or duplicateFromProduct
  useEffect(() => {
    if (!isOpen) {
      setSaveStatus('idle');
      setSavedProductSummary(null);
      return;
    }

    const existingSkus = products.map((p) => p.sku);

    if (productToEdit) {
      // Edit Mode
      setFormData({
        sku: productToEdit.sku,
        name: productToEdit.name,
        slug: productToEdit.slug,
        brand: productToEdit.brand,
        series: productToEdit.series || '',
        model: productToEdit.model,
        generation: productToEdit.generation,
        category: productToEdit.category,
        condition: productToEdit.condition,
        grade: productToEdit.grade || 'A++',
        serialNumber: productToEdit.serialNumber || '',
        processor: productToEdit.processor,
        ram: productToEdit.ram,
        ramType: productToEdit.ramType || 'DDR4-3200MHz',
        storage: productToEdit.storage,
        storageType: productToEdit.storageType || 'NVMe M.2 SSD',
        display: productToEdit.display,
        screenSize: productToEdit.screenSize || '14.0"',
        resolution: productToEdit.resolution || '1920x1080',
        refreshRate: productToEdit.refreshRate || '60Hz',
        graphics: productToEdit.graphics,
        vram: productToEdit.vram || 'Shared',
        ports: productToEdit.ports || '',
        camera: productToEdit.camera || '',
        keyboard: productToEdit.keyboard || productToEdit.keyboardCondition || '',
        wifi: productToEdit.wifi || '',
        bluetooth: productToEdit.bluetooth || '',
        operatingSystem: productToEdit.operatingSystem,
        includedAccessories: productToEdit.includedAccessories.join(', '),
        batteryCondition: productToEdit.batteryCondition,
        batteryHealth: productToEdit.batteryHealth || 90,
        cycleCount: productToEdit.batteryCycleCount || 100,
        batteryBackupHours: productToEdit.batteryBackupHours || '4-6 hours',
        batteryStatus: productToEdit.batteryStatus || 'Good',
        warranty: productToEdit.warranty,
        purchasePrice: productToEdit.purchasePrice,
        repairCost: productToEdit.repairCost || 0,
        otherCost: productToEdit.otherCost || 0,
        sellingPrice: productToEdit.sellingPrice,
        discountPrice: productToEdit.discountPrice || productToEdit.sellingPrice,
        stockQuantity: productToEdit.stockQuantity,
        minimumStockAlert: productToEdit.minimumStockAlert,
        shortDescription: productToEdit.shortDescription,
        specifications: productToEdit.specifications,
        images: productToEdit.images && productToEdit.images.length > 0 ? productToEdit.images : ['https://images.unsplash.com/photo-1544731612-de292439cc67?w=800'],
        status: productToEdit.status,
        isFeatured: productToEdit.isFeatured,
        specificationSource: 'Admin Edited',
      });
      setAutoFields({});
    } else if (duplicateFromProduct) {
      // Duplicate Mode
      const newSku = generateSmartSku(duplicateFromProduct.brand, duplicateFromProduct.model, existingSkus);
      setFormData({
        ...formData,
        sku: newSku,
        name: `${duplicateFromProduct.name} (Copy)`,
        brand: duplicateFromProduct.brand,
        series: duplicateFromProduct.series || '',
        model: duplicateFromProduct.model,
        generation: duplicateFromProduct.generation,
        category: duplicateFromProduct.category,
        condition: duplicateFromProduct.condition,
        grade: duplicateFromProduct.grade || 'A++',
        serialNumber: '', // reset serial for duplicate physical laptop
        processor: duplicateFromProduct.processor,
        ram: duplicateFromProduct.ram,
        ramType: duplicateFromProduct.ramType || 'DDR4',
        storage: duplicateFromProduct.storage,
        storageType: duplicateFromProduct.storageType || 'NVMe SSD',
        display: duplicateFromProduct.display,
        graphics: duplicateFromProduct.graphics,
        warranty: duplicateFromProduct.warranty,
        purchasePrice: duplicateFromProduct.purchasePrice,
        sellingPrice: duplicateFromProduct.sellingPrice,
        discountPrice: duplicateFromProduct.discountPrice || duplicateFromProduct.sellingPrice,
        stockQuantity: 1,
        images: duplicateFromProduct.images || [],
        specificationSource: 'Admin Edited',
      });
      setAutoFields({});
    } else {
      // New Mode: Preload with smart default (HP 840 G8) and auto-flags
      const initialModel = LAPTOP_MODEL_CATALOG[0];
      handleSelectModel(initialModel, false);
    }
  }, [isOpen, productToEdit, duplicateFromProduct]);

  // Search Results
  const searchResults = useMemo(() => {
    return searchLaptopCatalog(modelSearchQuery, searchBrandFilter);
  }, [modelSearchQuery, searchBrandFilter]);

  // Handle Model Autocomplete Selection
  const handleSelectModel = (modelItem: LaptopCatalogModel, markAllAuto = true) => {
    setSelectedCatalogModel(modelItem);
    setIsSearchDropdownOpen(false);
    setModelSearchQuery(modelItem.fullName);

    const existingSkus = products.map((p) => p.sku);
    const generatedSku = generateSmartSku(modelItem.brand, modelItem.model, existingSkus);
    const generatedTitle = `${modelItem.brand} ${modelItem.series} ${modelItem.model} (${modelItem.generation} / ${modelItem.defaultRam} / ${modelItem.defaultStorage})`.trim();

    setFormData((prev) => ({
      ...prev,
      sku: generatedSku,
      brand: modelItem.brand,
      series: modelItem.series,
      model: modelItem.model,
      name: generatedTitle,
      generation: modelItem.generation,
      category: modelItem.category,
      condition: modelItem.condition,
      grade: modelItem.grade,
      processor: modelItem.defaultCpu,
      ram: modelItem.defaultRam,
      ramType: modelItem.ramType,
      storage: modelItem.defaultStorage,
      storageType: modelItem.storageType,
      display: modelItem.display,
      screenSize: modelItem.screenSize,
      resolution: modelItem.resolution,
      refreshRate: modelItem.refreshRate,
      graphics: modelItem.gpu,
      vram: modelItem.vram,
      operatingSystem: modelItem.os,
      batteryCondition: modelItem.batteryCondition,
      batteryHealth: modelItem.batteryHealth,
      cycleCount: modelItem.cycleCount,
      batteryBackupHours: modelItem.estimatedBackup,
      warranty: modelItem.warranty,
      purchasePrice: modelItem.suggestedPurchaseCost,
      sellingPrice: modelItem.suggestedSellingPrice,
      discountPrice: modelItem.suggestedSellingPrice - modelItem.suggestedDiscount,
      ports: modelItem.ports,
      camera: modelItem.camera,
      keyboard: modelItem.keyboard,
      wifi: modelItem.wifi,
      bluetooth: modelItem.bluetooth,
      images: modelItem.images.length > 0 ? [...modelItem.images] : prev.images,
      shortDescription: `Original ${modelItem.brand} business series laptop with ${modelItem.defaultCpu}, ${modelItem.defaultRam} RAM, and ${modelItem.defaultStorage}. Tested 100% genuine Dubai stock.`,
      specifications: `${modelItem.display} • ${modelItem.gpu} • ${modelItem.ports}`,
      specificationSource: 'Model Catalog',
    }));

    if (markAllAuto) {
      // Mark fields as AUTO
      const initialAutos: FieldAutoState = {
        brand: true,
        series: true,
        model: true,
        generation: true,
        processor: true,
        ram: true,
        ramType: true,
        storage: true,
        storageType: true,
        display: true,
        graphics: true,
        batteryCondition: true,
        batteryHealth: true,
        warranty: true,
        purchasePrice: true,
        sellingPrice: true,
        ports: true,
      };
      setAutoFields(initialAutos);
    }
  };

  // Keyboard navigation for search suggestions
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchDropdownOpen || searchResults.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsSearchDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[searchSelectedIndex]) {
        handleSelectModel(searchResults[searchSelectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchDropdownOpen(false);
    }
  };

  // Update field and mark as CUSTOM
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto update full title if brand, model, cpu, ram, or storage changes
      if (['brand', 'model', 'series', 'processor', 'ram', 'storage'].includes(field)) {
        const shortCpu = (field === 'processor' ? value : updated.processor).split('(')[0].trim();
        updated.name = `${updated.brand} ${updated.series || ''} ${updated.model} (${shortCpu} / ${updated.ram} / ${updated.storage})`.replace(/\s+/g, ' ').trim();
      }

      return updated;
    });

    // Mark as CUSTOM
    setAutoFields((prev) => ({
      ...prev,
      [field]: false,
    }));

    // Clear error for field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Profit Calculations
  const totalCost = (formData.purchasePrice || 0) + (formData.repairCost || 0) + (formData.otherCost || 0);
  const activeSellingPrice = formData.discountPrice && formData.discountPrice > 0 ? formData.discountPrice : formData.sellingPrice;
  const estimatedProfit = activeSellingPrice - totalCost;
  const profitMarginPercent = totalCost > 0 ? ((estimatedProfit / totalCost) * 100).toFixed(1) : '0';

  // Toggle collapsible section
  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Auto Generate SKU button
  const handleRegenerateSku = () => {
    const existingSkus = products.map((p) => p.sku);
    const newSku = generateSmartSku(formData.brand, formData.model, existingSkus);
    handleFieldChange('sku', newSku);
  };

  // Photo Upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 5MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormData((prev) => ({
            ...prev,
            images: [result, ...prev.images.filter((img) => img !== result)],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Image remove
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Set Main Image
  const handleSetMainImage = (indexToMain: number) => {
    setFormData((prev) => {
      const selected = prev.images[indexToMain];
      const rest = prev.images.filter((_, idx) => idx !== indexToMain);
      return { ...prev, images: [selected, ...rest] };
    });
  };

  // Apply a template
  const handleApplyTemplate = (tmpl: any) => {
    setFormData((prev) => ({
      ...prev,
      condition: tmpl.condition || prev.condition,
      grade: tmpl.grade || prev.grade,
      warranty: tmpl.warranty || prev.warranty,
      ram: tmpl.ram || prev.ram,
      ramType: tmpl.ramType || prev.ramType,
      storage: tmpl.storage || prev.storage,
      storageType: tmpl.storageType || prev.storageType,
    }));
  };

  // Save current as template
  const handleSaveCurrentAsTemplate = () => {
    if (!templateNameInput.trim()) return;
    const newTmpl = {
      id: 'tmpl-' + Date.now(),
      name: templateNameInput.trim(),
      brand: formData.brand,
      condition: formData.condition,
      grade: formData.grade,
      warranty: formData.warranty,
      ram: formData.ram,
      ramType: formData.ramType,
      storage: formData.storage,
      storageType: formData.storageType,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTmpl, ...savedTemplates];
    setSavedTemplates(updated);
    localStorage.setItem('jhf_laptop_templates', JSON.stringify(updated));
    setTemplateNameInput('');
    setShowSaveTemplateModal(false);
  };

  // Validation before save
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.brand) errors.brand = 'Brand is required';
    if (!formData.model.trim()) errors.model = 'Model is required';
    if (!formData.name.trim()) errors.name = 'Full Title is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';

    // Unique SKU check (exclude current product if editing)
    const upperSku = formData.sku.trim().toUpperCase();
    const isDuplicateSku = products.some(
      (p) => p.sku?.toUpperCase() === upperSku && p.id !== productToEdit?.id
    );
    if (isDuplicateSku) {
      errors.sku = `SKU '${formData.sku}' is already taken by another product`;
    }

    // Unique Serial check if entered
    if (formData.serialNumber.trim()) {
      const upperSerial = formData.serialNumber.trim().toUpperCase();
      const isDuplicateSerial = products.some(
        (p) => p.serialNumber?.toUpperCase() === upperSerial && p.id !== productToEdit?.id
      );
      if (isDuplicateSerial) {
        errors.serialNumber = `Serial '${formData.serialNumber}' is already registered in inventory`;
      }
    }

    if (formData.sellingPrice <= 0) {
      errors.sellingPrice = 'Selling price must be greater than 0';
    }
    if (formData.stockQuantity < 0) {
      errors.stockQuantity = 'Stock cannot be negative';
    }
    if (!formData.images || formData.images.length === 0) {
      errors.images = 'At least 1 product image is recommended';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Workflow with animation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaveStatus('validating');

    setTimeout(() => {
      const isValid = validateForm();
      if (!isValid) {
        setSaveStatus('idle');
        return;
      }

      setSaveStatus('saving');

      setTimeout(() => {
        const accessoriesArray = formData.includedAccessories
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const payload = {
          ...formData,
          includedAccessories: accessoriesArray,
          totalCost,
          profitMargin: estimatedProfit,
          slug:
            formData.slug ||
            `${formData.brand}-${formData.model}-${formData.sku}`
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-'),
        };

        onSave(payload);

        setSavedProductSummary({
          name: formData.name,
          sku: formData.sku,
          price: activeSellingPrice,
          stock: formData.stockQuantity,
        });

        setSaveStatus('success');
      }, 700);
    }, 500);
  };

  const handleAddAnother = () => {
    setSaveStatus('idle');
    setSavedProductSummary(null);
    // Reset for next laptop
    const existingSkus = products.map((p) => p.sku);
    const initialModel = LAPTOP_MODEL_CATALOG[0];
    handleSelectModel(initialModel, true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-[#0b0f17] border border-slate-800 w-full max-w-7xl rounded-2xl shadow-2xl relative my-4 max-h-[96vh] flex flex-col text-slate-200 overflow-hidden">
        
        {/* Top Bar / Header */}
        <div className="bg-[#0e1420] border-b border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  {productToEdit ? 'Edit Laptop Configuration' : 'Smart Product Add & Auto-Configuration'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  AUTO-CONFIG V2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Type model to auto-load genuine specifications, customize hardware, set pricing, and verify live preview.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector Dropdown */}
            {savedTemplates.length > 0 && (
              <div className="relative hidden md:block">
                <select
                  onChange={(e) => {
                    const found = savedTemplates.find((t) => t.id === e.target.value);
                    if (found) handleApplyTemplate(found);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-xl text-xs px-2.5 py-1.5 text-slate-300 hover:text-white cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Apply Saved Template...
                  </option>
                  {savedTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.ram}/{t.storage})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowSaveTemplateModal(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl border border-slate-700 hidden sm:flex items-center gap-1 transition"
              title="Save current configuration as a preset template"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Template</span>
            </button>

            <button
              onClick={() => setIsBarcodePrintOpen(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 transition font-mono"
              title="Preview and print barcode label"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Barcode</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Overlay Workflow */}
        {saveStatus === 'success' && savedProductSummary && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1">
              {productToEdit ? 'Product Updated Successfully!' : 'New Laptop Added to Inventory!'}
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              The product and its specifications have been saved and synchronized with the inventory and public catalog.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full text-left space-y-2 mb-6 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">PRODUCT:</span>
                <span className="text-white font-bold truncate max-w-[200px]">{savedProductSummary.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">SKU NUMBER:</span>
                <span className="text-emerald-400 font-bold">{savedProductSummary.sku}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">SELLING PRICE:</span>
                <span className="text-white font-bold">৳ {savedProductSummary.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">STOCK QUANTITY:</span>
                <span className="text-emerald-400 font-bold">{savedProductSummary.stock} units</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAddAnother}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Product</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition border border-slate-700 cursor-pointer"
              >
                Go to Inventory List
              </button>
            </div>
          </div>
        )}

        {/* Main Body: Two Column Layout (Form on Left, Live Preview on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT: Full Configuration Form */}
          <div className="lg:col-span-8 overflow-y-auto p-4 sm:p-6 space-y-5 border-r border-slate-800/80">
            
            {/* ================= SECTION: SMART MODEL SEARCH & AUTOCOMPLETE ================= */}
            <div className="bg-[#101724] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-extrabold text-sm text-white font-mono tracking-wide">
                    1. SMART MODEL SEARCH &amp; AUTOCOMPLETE
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <span>Source:</span>
                  <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                    JHF Catalog (Verified)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Brand Dropdown */}
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 font-bold">
                    BRAND SELECT
                  </label>
                  <select
                    value={searchBrandFilter}
                    onChange={(e) => setSearchBrandFilter(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Brands (HP, Dell, Lenovo...)</option>
                    {POPULAR_BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Autocomplete Search Input */}
                <div className="sm:col-span-3 relative">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1 font-bold">
                    TYPE LAPTOP MODEL (e.g., HP EliteBook 840, Dell Latitude 7420, ThinkPad T14...)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={modelSearchQuery}
                      onChange={(e) => {
                        setModelSearchQuery(e.target.value);
                        setIsSearchDropdownOpen(true);
                        setSearchSelectedIndex(0);
                      }}
                      onFocus={() => setIsSearchDropdownOpen(true)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Type model name (HP EliteBook 840, Dell 7420, T14...)"
                      className="w-full bg-[#0b0f17] border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-500 font-mono transition"
                    />
                    {modelSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setModelSearchQuery('');
                          setIsSearchDropdownOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isSearchDropdownOpen && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0f1726] border border-emerald-500/50 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-800">
                      <div className="p-2 bg-slate-900/90 text-[10px] font-mono text-slate-400 flex items-center justify-between border-b border-slate-800">
                        <span>SUGGESTED MODELS ({searchResults.length})</span>
                        <span>Use ↑ ↓ keys and Enter to auto-load</span>
                      </div>
                      {searchResults.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectModel(item)}
                          onMouseEnter={() => setSearchSelectedIndex(idx)}
                          className={`p-3 cursor-pointer transition flex items-center justify-between ${
                            searchSelectedIndex === idx
                              ? 'bg-emerald-600/20 text-white'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-emerald-400 font-mono">
                              {item.brand.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <div className="font-bold text-xs text-white flex items-center gap-2">
                                <span>{item.fullName}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                  {item.generation}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {item.defaultCpu} • {item.defaultRam} • {item.defaultStorage}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              ৳ {item.suggestedSellingPrice.toLocaleString()}
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono">Suggested</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Variant Quick Presets if model selected */}
              {selectedCatalogModel && selectedCatalogModel.variants.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-white font-bold">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>CONFIGURATION VARIANT PRESETS:</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">Click any variant to load its specs &amp; pricing</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCatalogModel.variants.map((v, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          handleFieldChange('processor', v.cpu);
                          handleFieldChange('ram', v.ram);
                          handleFieldChange('storage', v.storage);
                          handleFieldChange('purchasePrice', v.purchaseCost);
                          handleFieldChange('sellingPrice', v.sellingPrice);
                          handleFieldChange('discountPrice', v.discountPrice || v.sellingPrice);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-2 font-mono ${
                          formData.ram === v.ram && formData.storage === v.storage
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-md font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{v.name}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          ৳ {v.sellingPrice.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* ================= SECTION: BASIC IDENTIFICATION ================= */}
              <div className="bg-[#0e1420] border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('basic')}
                  className="w-full p-4 flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 transition border-b border-slate-800/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-sm text-white font-mono">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>BASIC IDENTIFICATION &amp; CODING</span>
                  </div>
                  {openSections.basic ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.basic && (
                  <div className="p-4 sm:p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* SKU Generator */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-bold font-mono">
                            SKU Number *
                          </label>
                          <button
                            type="button"
                            onClick={handleRegenerateSku}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
                            title="Generate a new unique SKU"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Auto Gen</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.sku}
                          onChange={(e) => handleFieldChange('sku', e.target.value.toUpperCase())}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase"
                        />
                        {formErrors.sku && <p className="text-rose-400 text-[10px] mt-1">{formErrors.sku}</p>}
                      </div>

                      {/* Brand */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">
                          Brand *
                        </label>
                        <select
                          value={formData.brand}
                          onChange={(e) => handleFieldChange('brand', e.target.value)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          {POPULAR_BRANDS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Series / Sub-Brand */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-bold">Series</label>
                          {autoFields.series !== false ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">AUTO</span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">CUSTOM</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.series}
                          onChange={(e) => handleFieldChange('series', e.target.value)}
                          placeholder="e.g. EliteBook, Latitude, ThinkPad"
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      {/* Model */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-bold">Model Number *</label>
                          {autoFields.model !== false ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">AUTO</span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">CUSTOM</span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.model}
                          onChange={(e) => handleFieldChange('model', e.target.value)}
                          placeholder="e.g. 840 G8"
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                        {formErrors.model && <p className="text-rose-400 text-[10px] mt-1">{formErrors.model}</p>}
                      </div>

                      {/* Generation */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-bold">Generation</label>
                          {autoFields.generation !== false ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">AUTO</span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">CUSTOM</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.generation}
                          onChange={(e) => handleFieldChange('generation', e.target.value)}
                          placeholder="e.g. 11th Gen, M1, 8th Gen"
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      {/* Serial Number (Optional / Physical unit) */}
                      <div>
                        <label className="block text-slate-300 font-bold font-mono mb-1">
                          Serial Number (Physical Laptop)
                        </label>
                        <input
                          type="text"
                          value={formData.serialNumber}
                          onChange={(e) => handleFieldChange('serialNumber', e.target.value.toUpperCase())}
                          placeholder="e.g. 5CD1234XYZ"
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                        />
                        {formErrors.serialNumber && (
                          <p className="text-rose-400 text-[10px] mt-1">{formErrors.serialNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Full Product Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-bold">Full Product Title *</label>
                        <span className="text-[10px] text-slate-400">Auto-assembled from specs</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ================= SECTION: CORE SPECS (CPU, RAM, STORAGE) ================= */}
              <div className="bg-[#0e1420] border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('specs')}
                  className="w-full p-4 flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 transition border-b border-slate-800/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-sm text-white font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span>PROCESSOR, MEMORY (RAM) &amp; STORAGE (SSD)</span>
                  </div>
                  {openSections.specs ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.specs && (
                  <div className="p-4 sm:p-5 space-y-4 text-xs">
                    
                    {/* CPU Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Processor (CPU)</span>
                        </label>
                        {autoFields.processor !== false ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">AUTO</span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">CUSTOM</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.processor}
                        onChange={(e) => handleFieldChange('processor', e.target.value)}
                        placeholder="Intel Core i5-1135G7 (up to 4.20 GHz)"
                        className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />

                      {/* CPU Options Preset Chips if available */}
                      {selectedCatalogModel && selectedCatalogModel.cpuOptions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedCatalogModel.cpuOptions.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleFieldChange('processor', c)}
                              className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition ${
                                formData.processor === c
                                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RAM Selector Chips */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <span>RAM Capacity &amp; Type</span>
                        </label>
                        {autoFields.ram !== false ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">AUTO</span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">CUSTOM</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {RAM_PRESETS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleFieldChange('ram', r)}
                            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition ${
                              formData.ram === r
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                        {/* Custom RAM manual input */}
                        <input
                          type="text"
                          value={formData.ram}
                          onChange={(e) => handleFieldChange('ram', e.target.value)}
                          placeholder="Custom RAM (e.g. 24GB)"
                          className="w-32 bg-[#0b0f17] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <select
                          value={formData.ramType}
                          onChange={(e) => handleFieldChange('ramType', e.target.value)}
                          className="bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300"
                        >
                          {RAM_TYPE_PRESETS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Storage / SSD Selector Chips */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Storage (SSD / Drive)</span>
                        </label>
                        {autoFields.storage !== false ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">AUTO</span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">CUSTOM</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {STORAGE_PRESETS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleFieldChange('storage', `${s} SSD`)}
                            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition ${
                              formData.storage.startsWith(s)
                                ? 'bg-emerald-600 text-black border-emerald-500 shadow-md shadow-emerald-600/30'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                        {/* Custom Storage manual input */}
                        <input
                          type="text"
                          value={formData.storage}
                          onChange={(e) => handleFieldChange('storage', e.target.value)}
                          placeholder="Custom SSD (e.g. 512GB + 1TB)"
                          className="w-36 bg-[#0b0f17] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <select
                          value={formData.storageType}
                          onChange={(e) => handleFieldChange('storageType', e.target.value)}
                          className="bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300"
                        >
                          {STORAGE_TYPE_PRESETS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Display & Graphics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Display &amp; Resolution</label>
                        <input
                          type="text"
                          value={formData.display}
                          onChange={(e) => handleFieldChange('display', e.target.value)}
                          placeholder='14.0" Full HD IPS Anti-Glare'
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Graphics (GPU)</label>
                        <input
                          type="text"
                          value={formData.graphics}
                          onChange={(e) => handleFieldChange('graphics', e.target.value)}
                          placeholder="Intel Iris Xe / NVIDIA Quadro"
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* ================= SECTION: BATTERY, CONDITION & WARRANTY ================= */}
              <div className="bg-[#0e1420] border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('batteryCondition')}
                  className="w-full p-4 flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 transition border-b border-slate-800/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-sm text-white font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>BATTERY TELEMETRY, CONDITION GRADE &amp; WARRANTY</span>
                  </div>
                  {openSections.batteryCondition ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.batteryCondition && (
                  <div className="p-4 sm:p-5 space-y-4 text-xs">
                    
                    {/* Condition & Grade */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Condition *</label>
                        <select
                          value={formData.condition}
                          onChange={(e) => handleFieldChange('condition', e.target.value as LaptopCondition)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          {CONDITION_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Dubai Grade *</label>
                        <select
                          value={formData.grade}
                          onChange={(e) => handleFieldChange('grade', e.target.value as any)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                        >
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              Grade {g}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Operating System</label>
                        <input
                          type="text"
                          value={formData.operatingSystem}
                          onChange={(e) => handleFieldChange('operatingSystem', e.target.value)}
                          placeholder="Windows 11 Pro Genuine"
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    {/* Battery Information */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="font-bold text-white flex items-center gap-1.5 font-mono">
                        <BatteryCharging className="w-4 h-4 text-emerald-400" />
                        <span>BATTERY HEALTH &amp; CYCLE COUNT</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Battery Health (%)</label>
                          <input
                            type="number"
                            min="50"
                            max="100"
                            value={formData.batteryHealth}
                            onChange={(e) => handleFieldChange('batteryHealth', parseInt(e.target.value) || 90)}
                            className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Cycle Count</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.cycleCount}
                            onChange={(e) => handleFieldChange('cycleCount', parseInt(e.target.value) || 0)}
                            className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Estimated Backup</label>
                          <input
                            type="text"
                            value={formData.batteryBackupHours}
                            onChange={(e) => handleFieldChange('batteryBackupHours', e.target.value)}
                            placeholder="5–7 hours"
                            className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Battery Status</label>
                          <select
                            value={formData.batteryStatus}
                            onChange={(e) => handleFieldChange('batteryStatus', e.target.value)}
                            className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                          >
                            {BATTERY_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Warranty */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>Warranty Terms</span>
                        </label>
                        {autoFields.warranty !== false ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">AUTO</span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">CUSTOM</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={formData.warranty}
                          onChange={(e) => handleFieldChange('warranty', e.target.value)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          {WARRANTY_OPTIONS.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={formData.warranty}
                          onChange={(e) => handleFieldChange('warranty', e.target.value)}
                          placeholder="Or enter custom warranty terms..."
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* ================= SECTION: PRICING & COST CALCULATOR ================= */}
              <div className="bg-[#0e1420] border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('pricing')}
                  className="w-full p-4 flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 transition border-b border-slate-800/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-sm text-white font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>PRICING, COST CALCULATOR &amp; PROFIT MARGIN</span>
                  </div>
                  {openSections.pricing ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.pricing && (
                  <div className="p-4 sm:p-5 space-y-4 text-xs">
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Purchase Cost (৳)</label>
                        <input
                          type="number"
                          value={formData.purchasePrice}
                          onChange={(e) => handleFieldChange('purchasePrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Repair/Upgrade (৳)</label>
                        <input
                          type="number"
                          value={formData.repairCost}
                          onChange={(e) => handleFieldChange('repairCost', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Regular Selling Price *</label>
                        <input
                          type="number"
                          required
                          value={formData.sellingPrice}
                          onChange={(e) => handleFieldChange('sellingPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-emerald-400"
                        />
                        {formErrors.sellingPrice && <p className="text-rose-400 text-[10px] mt-1">{formErrors.sellingPrice}</p>}
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Discounted Offer Price</label>
                        <input
                          type="number"
                          value={formData.discountPrice}
                          onChange={(e) => handleFieldChange('discountPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Calculated Telemetry Box */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-3 text-center font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px]">TOTAL COST:</span>
                        <div className="text-sm font-bold text-white mt-0.5">৳ {totalCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">ESTIMATED PROFIT:</span>
                        <div className={`text-sm font-bold mt-0.5 ${estimatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ৳ {estimatedProfit.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">MARGIN (%):</span>
                        <div className={`text-sm font-bold mt-0.5 ${parseFloat(profitMarginPercent) >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {profitMarginPercent}%
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* ================= SECTION: INVENTORY & STOCK ================= */}
              <div className="bg-[#0e1420] border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('inventory')}
                  className="w-full p-4 flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 transition border-b border-slate-800/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-sm text-white font-mono">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>INVENTORY CONTROL &amp; STOCK STATUS</span>
                  </div>
                  {openSections.inventory ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.inventory && (
                  <div className="p-4 sm:p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Initial Stock Quantity *</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formData.stockQuantity}
                          onChange={(e) => handleFieldChange('stockQuantity', parseInt(e.target.value) || 0)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-base"
                        />
                        {formErrors.stockQuantity && <p className="text-rose-400 text-[10px] mt-1">{formErrors.stockQuantity}</p>}
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Minimum Stock Alert</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.minimumStockAlert}
                          onChange={(e) => handleFieldChange('minimumStockAlert', parseInt(e.target.value) || 1)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Catalog Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleFieldChange('status', e.target.value as any)}
                          className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          <option value="published">Published (Live Online)</option>
                          <option value="draft">Draft (Private)</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                      <strong>Out-of-Stock Rule:</strong> When stock quantity is set to 0, public website automatically marks this laptop as <strong>SOLD OUT</strong> and disables direct ordering while keeping customer inquiry active.
                    </div>
                  </div>
                )}
              </div>

              {/* ================= SECTION: MEDIA & IMAGES ================= */}
              <div className="bg-[#0e1420] border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('media')}
                  className="w-full p-4 flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 transition border-b border-slate-800/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 font-bold text-sm text-white font-mono">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>PRODUCT MEDIA &amp; GALLERY</span>
                  </div>
                  {openSections.media ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {openSections.media && (
                  <div className="p-4 sm:p-5 space-y-4 text-xs">
                    
                    {/* Drag and drop upload zone */}
                    <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 text-center bg-slate-950/40 transition">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                          <Upload className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="font-bold text-white text-xs">
                          Click to Upload Real Laptop Photos or Drag &amp; Drop
                        </div>
                        <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP up to 5MB</p>
                      </div>
                    </div>

                    {/* Image thumbnails list with Reorder & Remove */}
                    {formData.images.length > 0 && (
                      <div>
                        <div className="text-[11px] font-mono text-slate-400 mb-2">
                          ACTIVE GALLERY (First image is primary thumbnail)
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {formData.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-video flex items-center justify-center"
                            >
                              <img
                                src={img}
                                alt={`Product ${idx}`}
                                className="w-full h-full object-cover"
                              />
                              {idx === 0 && (
                                <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-black text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shadow">
                                  MAIN
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                {idx !== 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMainImage(idx)}
                                    className="p-1 rounded bg-blue-600 text-white text-[10px] font-semibold"
                                    title="Make Primary Image"
                                  >
                                    Main
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="p-1 rounded bg-rose-600 text-white text-[10px]"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image URL input fallback */}
                    <div>
                      <label className="block text-slate-400 mb-1">Or Add Image by URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          id="new-img-url-input"
                          className="flex-1 bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('new-img-url-input') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              setFormData((prev) => ({
                                ...prev,
                                images: [...prev.images, input.value.trim()],
                              }));
                              input.value = '';
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Submit Save Button */}
              <div className="pt-2 sticky bottom-0 bg-[#0b0f17]/90 backdrop-blur-md pb-2 z-10 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveStatus !== 'idle'}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {saveStatus === 'validating' && (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>VALIDATING DATA...</span>
                    </>
                  )}
                  {saveStatus === 'saving' && (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SAVING TO INVENTORY...</span>
                    </>
                  )}
                  {saveStatus === 'idle' && (
                    <>
                      <Save className="w-4 h-4" />
                      <span>SAVE NEW STOCK</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT: Live Customer-Facing Product Preview */}
          <div className="lg:col-span-4 bg-[#090d14] p-4 sm:p-6 overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LIVE PRODUCT PREVIEW</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  PUBLIC STORE VIEW
                </span>
              </div>

              {/* Public Laptop Card Simulation */}
              <div className="bg-[#101724] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                
                {/* Image & Badges */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={formData.images[0] || 'https://images.unsplash.com/photo-1544731612-de292439cc67?w=800'}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    <span className="bg-emerald-600 text-black text-[10px] font-bold font-mono px-2 py-0.5 rounded shadow">
                      {formData.condition}
                    </span>
                    <span className="bg-slate-900/90 text-white text-[9px] font-mono px-2 py-0.5 rounded border border-slate-700">
                      Grade {formData.grade}
                    </span>
                  </div>

                  {formData.stockQuantity <= 0 ? (
                    <span className="absolute bottom-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-bold font-mono px-2.5 py-1 rounded shadow animate-pulse">
                      SOLD OUT
                    </span>
                  ) : (
                    <span className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                      In Stock: {formData.stockQuantity}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                      {formData.brand} • {formData.series || formData.category}
                    </div>
                    <h4 className="text-sm font-extrabold text-white line-clamp-2 mt-0.5">
                      {formData.name || 'Laptop Model Name'}
                    </h4>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">SKU: {formData.sku}</div>
                  </div>

                  {/* Spec Chips Grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 block text-[9px]">CPU:</span>
                      <span className="truncate block font-bold">{formData.processor.split('(')[0]}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 block text-[9px]">RAM:</span>
                      <span className="font-bold text-emerald-400">{formData.ram}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 block text-[9px]">STORAGE:</span>
                      <span className="font-bold text-white">{formData.storage}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 block text-[9px]">BATTERY:</span>
                      <span className="font-bold text-cyan-400">{formData.batteryHealth}% ({formData.batteryBackupHours})</span>
                    </div>
                  </div>

                  {/* Warranty Note */}
                  <div className="text-[10px] text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate">{formData.warranty}</span>
                  </div>

                  {/* Pricing Box */}
                  <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400">OFFER PRICE</div>
                      <div className="text-base font-extrabold text-emerald-400 font-mono">
                        ৳ {activeSellingPrice.toLocaleString()}
                      </div>
                    </div>
                    {formData.discountPrice && formData.discountPrice < formData.sellingPrice && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 line-through">
                          ৳ {formData.sellingPrice.toLocaleString()}
                        </span>
                        <div className="text-[9px] font-mono text-rose-400">
                          Save ৳ {(formData.sellingPrice - formData.discountPrice).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Button Simulation */}
                  <button
                    type="button"
                    disabled={formData.stockQuantity <= 0}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition font-mono ${
                      formData.stockQuantity <= 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow'
                    }`}
                  >
                    {formData.stockQuantity <= 0 ? 'SOLD OUT' : 'ORDER NOW'}
                  </button>

                </div>
              </div>

              {/* Barcode Widget Preview */}
              <div className="mt-4 p-3 bg-[#101724] border border-slate-800 rounded-2xl text-center">
                <div className="text-[10px] font-mono text-slate-400 mb-1">INVENTORY BARCODE</div>
                <div className="bg-white p-2 rounded-xl inline-block shadow">
                  <BarcodeGenerator value={formData.sku || 'JHF-LP-0000'} height={36} />
                </div>
              </div>

            </div>

            {/* Bottom info note */}
            <div className="mt-4 text-[10px] text-slate-500 font-mono text-center">
              Changes reflect live in real-time. Public site updates immediately upon save.
            </div>

          </div>

        </div>

      </div>

      {/* Save as Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-3">
            <h3 className="text-sm font-bold text-white">Save as Product Template</h3>
            <p className="text-xs text-slate-400">
              Enter a name for this template to quickly apply condition, RAM, storage, and warranty to future laptops.
            </p>
            <input
              type="text"
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              placeholder="e.g. HP EliteBook Grade A++ Template"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsTemplate}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Print Dialog */}
      {isBarcodePrintOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base">Print Product Barcode Label</h3>
              <button
                onClick={() => setIsBarcodePrintOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Label View */}
            <div className="border-2 border-dashed border-slate-300 p-4 rounded-xl text-center font-sans space-y-2">
              <div className="font-extrabold text-sm tracking-wide">JHF LAPTOP ZONE</div>
              <div className="text-xs font-bold truncate">{formData.name}</div>
              <div className="text-[11px] text-slate-600 font-mono">
                {formData.processor.split('(')[0]} • {formData.ram} • {formData.storage}
              </div>
              <div className="py-2 flex justify-center">
                <BarcodeGenerator value={formData.sku} height={50} />
              </div>
              <div className="flex justify-between text-xs font-bold pt-1 border-t">
                <span>SKU: {formData.sku}</span>
                <span className="text-emerald-700">৳ {activeSellingPrice.toLocaleString()}</span>
              </div>
              {formData.serialNumber && (
                <div className="text-[10px] font-mono text-slate-500">
                  S/N: {formData.serialNumber}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBarcodePrintOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Label</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
