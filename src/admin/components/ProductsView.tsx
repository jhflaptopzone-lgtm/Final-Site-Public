import React, { useState } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import { Product } from '../types';
import { SmartProductAddModal } from './SmartProductAddModal';
import { BulkStockImportModal } from './BulkStockImportModal';
import { BarcodeGenerator } from './BarcodeGenerator';
import {
  Laptop,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  DollarSign,
  Boxes,
  Layers,
  Copy,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';

interface ProductsViewProps {
  initialTrashMode?: boolean;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ initialTrashMode = false }) => {
  const { products, addProduct, updateProduct, softDeleteProduct, restoreProduct, permanentDeleteProduct, clearAllProducts, exportDataAsCsv, exportDataAsJson } = useAdminStore();
  const { hasPermission, currentUser } = useAdminAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [showTrash, setShowTrash] = useState(initialTrashMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [duplicateProduct, setDuplicateProduct] = useState<Product | null>(null);

  // Barcode quick print modal state
  const [barcodePrintProduct, setBarcodePrintProduct] = useState<Product | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  // Soft Delete Modal
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('Stock cleared / Defective / Discontinued');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const filteredProducts = products.filter((prod) => {
    // Trash filter
    if (showTrash) {
      if (!prod.isDeleted) return false;
    } else {
      if (prod.isDeleted) return false;
    }

    // Brand filter
    if (selectedBrand !== 'all' && prod.brand !== selectedBrand) return false;

    // Search query
    const q = (searchTerm || '').toLowerCase();
    return (
      (prod.name || '').toLowerCase().includes(q) ||
      (prod.sku || '').toLowerCase().includes(q) ||
      (prod.processor || '').toLowerCase().includes(q) ||
      (prod.brand || '').toLowerCase().includes(q) ||
      (prod.model || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setDuplicateProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setDuplicateProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenDuplicate = (product: Product) => {
    setEditingProduct(null);
    setDuplicateProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      showToast(`Updated "${productData.name}" successfully.`);
    } else {
      addProduct(productData);
      showToast(`Added "${productData.name}" with SKU: ${productData.sku}`);
    }
  };

  const handleConfirmSoftDelete = () => {
    if (deleteModalId) {
      softDeleteProduct(deleteModalId, deleteReason);
      setDeleteModalId(null);
      showToast('Product moved to trash.');
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="space-y-5">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Smart Product Add / Edit Modal */}
      <SmartProductAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        duplicateFromProduct={duplicateProduct}
      />

      {/* Bulk Stock Import Modal (CSV/Excel) */}
      <BulkStockImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={(count) => {
          showToast(`Successfully imported ${count} laptops into inventory.`);
        }}
      />

      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Laptop className="w-5 h-5 text-emerald-400" />
            <span>{showTrash ? 'Deleted Products & Soft Delete Trash' : 'Laptop Catalog & Inventory'}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {showTrash
              ? 'Review archived items. You can restore them to catalog or permanently purge with Super Admin permission.'
              : 'Smart model search, auto-spec configurations, Dubai Grade stock, barcodes, and profit margin analysis.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`text-xs font-semibold px-3 py-2 rounded-xl border transition flex items-center gap-1.5 ${
              showTrash
                ? 'bg-amber-600/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{showTrash ? 'Show Active Catalog' : 'View Trash'}</span>
          </button>

          {!showTrash && hasPermission('Products', 'write') && (
            <>
              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-2 rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                title="Import multiple laptops using CSV/Excel spreadsheet"
              >
                <Layers className="w-4 h-4" />
                <span>Bulk Import (CSV)</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Add New Stock</span>
              </button>
            </>
          )}

          {!showTrash && products.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('⚠️ WARNING: Are you sure you want to delete ALL laptops from the catalog? This will clear all demo/dummy laptops so you can add your own real products.')) {
                  clearAllProducts();
                }
              }}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
              title="Clear all demo laptops"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => exportDataAsCsv('products')}
              className="text-[11px] text-slate-300 hover:text-white font-medium px-2 py-1 rounded-lg hover:bg-slate-700 transition font-mono"
              title="Export as CSV"
            >
              CSV
            </button>
            <button
              onClick={() => exportDataAsJson('products')}
              className="text-[11px] text-slate-300 hover:text-white font-medium px-2 py-1 rounded-lg hover:bg-slate-700 transition font-mono"
              title="Export as JSON"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Quick Barcode Label Modal */}
      {barcodePrintProduct && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base">Barcode Label Print</h3>
              </div>
              <button
                onClick={() => setBarcodePrintProduct(null)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 p-4 rounded-xl text-center space-y-2">
              <div className="font-extrabold text-sm tracking-wide">JHF LAPTOP ZONE</div>
              <div className="text-xs font-bold truncate">{barcodePrintProduct.name}</div>
              <div className="text-[11px] text-slate-600 font-mono">
                {barcodePrintProduct.processor.split('(')[0]} • {barcodePrintProduct.ram} • {barcodePrintProduct.storage}
              </div>
              <div className="py-2 flex justify-center">
                <BarcodeGenerator value={barcodePrintProduct.sku} height={50} />
              </div>
              <div className="flex justify-between text-xs font-bold pt-1 border-t">
                <span>SKU: {barcodePrintProduct.sku}</span>
                <span className="text-emerald-700">৳ {barcodePrintProduct.sellingPrice.toLocaleString()}</span>
              </div>
              {barcodePrintProduct.serialNumber && (
                <div className="text-[10px] font-mono text-slate-500">
                  S/N: {barcodePrintProduct.serialNumber}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBarcodePrintProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Label</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Model, SKU, Specs..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Brand:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Brands</option>
            <option value="Lenovo">Lenovo (ThinkPad)</option>
            <option value="HP">HP (EliteBook)</option>
            <option value="Dell">Dell (Latitude)</option>
            <option value="Apple">Apple</option>
            <option value="Asus">Asus</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Laptop Item</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Brand &amp; Grade</th>
                <th className="py-3 px-3">Purchase Cost</th>
                <th className="py-3 px-3">Selling Price</th>
                <th className="py-3 px-3">Margin</th>
                <th className="py-3 px-3">Stock Units</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No products found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isLowStock = prod.stockQuantity <= prod.minimumStockAlert;
                  const profit = prod.sellingPrice - prod.purchasePrice;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0] || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100'}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white max-w-xs truncate">{prod.name}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">
                              {prod.processor} • {prod.ram} • {prod.storage}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-300 font-semibold">{prod.sku}</td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-white">{prod.brand}</span>
                        <div className="text-[10px] text-emerald-400 font-medium">{prod.condition}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400">৳{prod.purchasePrice.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono font-bold text-white">৳{prod.sellingPrice.toLocaleString()}</td>

                      <td className="py-3 px-3 font-mono font-semibold">
                        <span className={profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          +৳{profit.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md ${
                            prod.stockQuantity === 0
                              ? 'bg-rose-500/20 text-rose-400'
                              : isLowStock
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {prod.stockQuantity} in stock
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {prod.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {showTrash ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => restoreProduct(prod.id)}
                              className="text-xs bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 px-2 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 transition font-semibold"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>

                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`Permanently purge ${prod.name}? This CANNOT be undone.`)) {
                                    permanentDeleteProduct(prod.id);
                                  }
                                }}
                                className="text-xs bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 px-2 py-1 rounded-lg border border-rose-500/30 transition font-semibold"
                                title="Permanent Delete (Super Admin)"
                              >
                                Purge
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setBarcodePrintProduct(prod)}
                              className="px-2 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                              title="Print barcode label for this laptop"
                            >
                              <Printer className="w-3 h-3" />
                              <span className="hidden xl:inline">Barcode</span>
                            </button>

                            <button
                              onClick={() => handleOpenDuplicate(prod)}
                              className="px-2 py-1 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition"
                              title="Duplicate as new product with unique SKU"
                            >
                              <Copy className="w-3 h-3" />
                              <span className="hidden xl:inline">Duplicate</span>
                            </button>

                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="px-2 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition"
                              title="Edit product specs, price & picture"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${prod.name}" from catalog?`)) {
                                  permanentDeleteProduct(prod.id);
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition"
                              title="Delete product"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Soft Delete Reason Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Soft Delete Product</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              This will remove the product from the public store catalog and move it to the Admin Trash.
            </p>

            <label className="block text-xs text-slate-300 font-semibold mb-1">Reason for removal *</label>
            <textarea
              rows={2}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 mb-4"
            ></textarea>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteModalId(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1.5 px-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSoftDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-4 rounded-xl shadow flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Move to Trash</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
