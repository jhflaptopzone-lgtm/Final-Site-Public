import React, { useState } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import {
  Boxes,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  X,
  Search,
  Edit,
  Trash2,
  Check,
} from 'lucide-react';

interface InventoryViewProps {
  initialAction?: 'none' | 'stock_in' | 'stock_out';
}

export const InventoryView: React.FC<InventoryViewProps> = ({ initialAction = 'none' }) => {
  const {
    products,
    inventoryTransactions,
    adjustStock,
    directUpdateProductStock,
    deleteInventoryTransaction,
    clearAllInventoryTransactions,
    suppliers,
  } = useAdminStore();
  const { currentUser } = useAdminAuth();

  const [activeModal, setActiveModal] = useState<'none' | 'stock_in' | 'stock_out' | 'adjust'>(initialAction);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [batchNumber, setBatchNumber] = useState('');
  const [supplier, setSupplier] = useState('Dubai Tech Importers Ltd.');
  const [reason, setReason] = useState('New Shipment Received from Dubai');
  const [searchHistory, setSearchHistory] = useState('');

  // Quick Direct Stock Edit state
  const [quickEditProduct, setQuickEditProduct] = useState<{ id: string; name: string; sku: string; stock: number; alert: number } | null>(null);
  const [newStockQty, setNewStockQty] = useState(0);
  const [newAlertLimit, setNewAlertLimit] = useState(2);

  const activeProducts = products.filter((p) => !p.isDeleted);
  const lowStockItems = activeProducts.filter((p) => p.stockQuantity <= p.minimumStockAlert);

  const handleOpenAction = (type: 'stock_in' | 'stock_out' | 'adjust', defaultProdId?: string) => {
    setActiveModal(type);
    if (defaultProdId) {
      setSelectedProductId(defaultProdId);
      const p = products.find((prod) => prod.id === defaultProdId);
      if (p) setUnitCost(p.purchasePrice);
    }
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    adjustStock({
      productId: selectedProductId,
      type: activeModal === 'stock_in' ? 'in' : activeModal === 'stock_out' ? 'out' : 'adjustment',
      quantity,
      unitCost,
      batchNumber,
      supplier,
      reason,
    });

    setActiveModal('none');
    setQuantity(1);
  };

  const filteredHistory = inventoryTransactions.filter((tx) => {
    const q = (searchHistory || '').toLowerCase();
    const prodName = (tx.productName || '').toLowerCase();
    const sku = (tx.sku || '').toLowerCase();
    const reason = (tx.reason || '').toLowerCase();
    const recordedBy = (tx.recordedByName || tx.performedBy || '').toLowerCase();
    return (
      prodName.includes(q) ||
      sku.includes(q) ||
      reason.includes(q) ||
      recordedBy.includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-400" />
            <span>Real-Time Inventory &amp; Stock Ledger</span>
          </h1>
          <p className="text-xs text-slate-400">
            Append-only transactional stock tracking, inbound shipments from Dubai, adjustments, and depletion history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAction('stock_in')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Stock In (Inbound)</span>
          </button>
          <button
            onClick={() => handleOpenAction('stock_out')}
            className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-rose-500/30 transition flex items-center gap-1.5"
          >
            <PackageMinus className="w-4 h-4" />
            <span>Stock Out (Write-off)</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alerts Box */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Critical Low Stock Warning ({lowStockItems.length} items)</span>
            </div>
            <span className="text-[11px] text-amber-300">Action Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs truncate max-w-[170px]">{item.name}</div>
                  <div className="text-[10px] text-slate-400">
                    SKU: {item.sku} • In Stock:{' '}
                    <strong className="text-amber-400">{item.stockQuantity}</strong> (Threshold: {item.minimumStockAlert})
                  </div>
                </div>
                <button
                  onClick={() => handleOpenAction('stock_in', item.id)}
                  className="text-[11px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg transition shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Current Stock Levels by Model</h2>
            <p className="text-xs text-slate-400">Active warehouse quantities and reorder thresholds</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">{activeProducts.length} Active Catalog Items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Laptop Model</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">Unit Cost</th>
                <th className="py-2.5 px-3">Selling Price</th>
                <th className="py-2.5 px-3 text-center">Available Units</th>
                <th className="py-2.5 px-3">Stock Valuation</th>
                <th className="py-2.5 px-3 text-right">Quick Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-blue-400">{p.sku}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.condition}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{p.brand}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">৳{p.purchasePrice.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono font-bold text-white">৳{p.sellingPrice.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span
                      className={`font-extrabold px-2.5 py-0.5 rounded-full ${
                        p.stockQuantity <= p.minimumStockAlert
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                    ৳{(p.purchasePrice * p.stockQuantity).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setQuickEditProduct({
                            id: p.id,
                            name: p.name,
                            sku: p.sku,
                            stock: p.stockQuantity,
                            alert: p.minimumStockAlert,
                          });
                          setNewStockQty(p.stockQuantity);
                          setNewAlertLimit(p.minimumStockAlert);
                        }}
                        className="text-[11px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-2.5 py-1 rounded-lg border border-blue-500/30 font-semibold transition flex items-center gap-1"
                        title="Directly edit stock quantity"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit Stock</span>
                      </button>
                      <button
                        onClick={() => handleOpenAction('stock_in', p.id)}
                        className="text-[11px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/30 font-semibold transition"
                      >
                        + In
                      </button>
                      <button
                        onClick={() => handleOpenAction('stock_out', p.id)}
                        className="text-[11px] bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 px-2 py-1 rounded-lg border border-rose-500/30 font-semibold transition"
                      >
                        - Out
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Append-Only Inventory Movement Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Append-Only Stock Movement History</h2>
              <p className="text-xs text-slate-400">Immutable audit record of every inventory addition and removal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {inventoryTransactions.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all stock movement transactions? This wipes dummy audit logs so you have a fresh history.')) {
                    clearAllInventoryTransactions();
                  }
                }}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                title="Wipe transaction history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date &amp; Time</th>
                <th className="py-2.5 px-3">Laptop &amp; SKU</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-center">Qty Change</th>
                <th className="py-2.5 px-3">Previous &rarr; New</th>
                <th className="py-2.5 px-3">Reason / Supplier</th>
                <th className="py-2.5 px-3 text-right">Recorded By</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {new Date(tx.createdAt || tx.timestamp || Date.now()).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{tx.productName}</div>
                    <div className="text-[10px] font-mono text-blue-400">{tx.sku || ''}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        tx.type === 'in' || tx.type === 'stock_in'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tx.type === 'out' || tx.type === 'stock_out'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    {tx.type === 'in' || tx.type === 'stock_in' ? (
                      <span className="text-emerald-400">+{tx.quantity}</span>
                    ) : (
                      <span className="text-rose-400">-{tx.quantity}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {tx.previousStock} &rarr; <strong className="text-white">{tx.newStock}</strong>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-200">{tx.reason}</div>
                    {(tx.supplierName || (tx as any).supplier) && (
                      <div className="text-[10px] text-slate-400">Supplier: {tx.supplierName || (tx as any).supplier}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 text-[11px] font-medium">
                    {tx.recordedByName || tx.performedBy || 'System'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this transaction log entry?')) {
                          deleteInventoryTransaction(tx.id);
                        }
                      }}
                      className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Delete this transaction log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In / Out Modal */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {activeModal === 'stock_in' ? (
                  <>
                    <PackagePlus className="w-4 h-4 text-emerald-400" />
                    <span>Inbound Stock (Receive Shipment)</span>
                  </>
                ) : (
                  <>
                    <PackageMinus className="w-4 h-4 text-rose-400" />
                    <span>Outbound Stock (Deplete / Defective)</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Laptop Item *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setUnitCost(p.purchasePrice);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} (Current: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity Units *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit Cost (৳)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {activeModal === 'stock_in' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Supplier / Origin</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g., Dubai Tech Importers Ltd."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Batch or Reference Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., DXB-2026-SEP-01"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Transaction Reason *</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., New stock arrival from Dubai"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1.5 px-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`font-bold py-1.5 px-4 rounded-xl text-white shadow ${
                    activeModal === 'stock_in' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm Movement
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Quick Direct Edit Stock Modal */}
      {quickEditProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-400" />
                <span>Quick Stock Count Override</span>
              </h3>
              <button
                onClick={() => setQuickEditProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-white">{quickEditProduct.name}</div>
              <div className="text-[11px] text-blue-400 font-mono">SKU: {quickEditProduct.sku}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Current Registered Stock: <strong className="text-white">{quickEditProduct.stock} units</strong>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                directUpdateProductStock(quickEditProduct.id, newStockQty, newAlertLimit);
                setQuickEditProduct(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New Available Stock Units (Quantity) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Directly sets warehouse stock to this exact number and logs an audit correction.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  value={newAlertLimit}
                  onChange={(e) => setNewAlertLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickEditProduct(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1.5 px-3.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Stock Count</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
