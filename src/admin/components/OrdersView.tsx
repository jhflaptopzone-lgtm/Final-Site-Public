import React, { useState } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { SalesInvoiceModal } from './SalesInvoiceModal';
import {
  ShoppingCart,
  Search,
  Filter,
  MessageSquare,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  X,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, updatePaymentStatus, deleteOrder, clearAllOrders, settings, exportDataAsCsv } = useAdminStore();
  const { currentUser, hasPermission } = useAdminAuth();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    if (selectedStatus !== 'all' && ord.orderStatus !== selectedStatus) return false;
    const q = (search || '').toLowerCase();
    return (
      (ord.orderNumber || '').toLowerCase().includes(q) ||
      (ord.customerName || '').toLowerCase().includes(q) ||
      (ord.customerPhone || '').includes(q) ||
      (ord.district || '').toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'shipped':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'delivered':
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'cancelled':
      case 'returned':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getWhatsAppMessage = (order: Order) => {
    const itemNames = order.items.map((i) => `${i.productName} (Qty: ${i.quantity})`).join(', ');
    const msg = `Assalamu Alaikum ${order.customerName},\n\nGreetings from *JHF Laptop Zone*!\nBest Laptop Buy , Sell & Accessories Importer, Traders & Suppliers\n\nYour Order *#${order.orderNumber}* has been confirmed.\n\n*Product:* ${itemNames}\n*Total Bill:* ৳${order.totalAmount.toLocaleString()}\n*Delivery Address:* ${order.deliveryAddress}, ${order.district}\n*Status:* ${order.orderStatus.toUpperCase()}\n\n*Mobile:* 01935-693071 , 01731-693071\n*Main Office:* Sonali Trade, Shop No : 1001 & 1040, ECS Computer City Centre, Multiplan, New Elephant Road, Dhaka\n*Branch Office:* Baroipara Bazar, Chandra, Gazipur\n*Email:* jhflaptopzone@gmail.com\n*Facebook:* www.facebook.com/jhflaptopzone\n*Web:* www.jhflaptopzone.com`;
    return encodeURIComponent(msg);
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <span>Order Management &amp; Fulfillment</span>
          </h1>
          <p className="text-xs text-slate-400">
            Track customer sales, delivery statuses, courier tracking numbers, and WhatsApp receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewInvoiceModalOpen(true)}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition font-bold shadow-lg shadow-emerald-600/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Sales Invoice</span>
          </button>

          {orders.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('⚠️ Are you sure you want to delete ALL orders? This clears demo orders so you can record your real customer orders and invoices.')) {
                  clearAllOrders();
                }
              }}
              className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-2 rounded-xl flex items-center gap-1.5 transition font-semibold"
              title="Clear all demo orders"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Dummy</span>
            </button>
          )}

          <button
            onClick={() => exportDataAsCsv('orders')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition font-semibold"
          >
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order #, Phone, Name, District..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 shrink-0">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="new">New</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped / In Courier</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order No &amp; Date</th>
                <th className="py-3 px-3">Customer Details</th>
                <th className="py-3 px-3">Items &amp; Specs</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Order Status</th>
                <th className="py-3 px-3">Courier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No orders found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Order No */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-xs">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                      <div className="text-[10px] text-blue-400 truncate max-w-[140px]">{ord.district}</div>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-3">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="text-slate-200">
                          <span className="font-medium text-white">{item.productName}</span>
                          <span className="text-[10px] text-slate-400 ml-1">x{item.quantity}</span>
                        </div>
                      ))}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-emerald-400">৳{ord.totalAmount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{ord.paymentMethod.replace('_', ' ')}</div>
                    </td>

                    {/* Payment Status Dropdown */}
                    <td className="py-3 px-3">
                      <select
                        value={ord.paymentStatus}
                        onChange={(e) => updatePaymentStatus(ord.id, e.target.value as PaymentStatus)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase focus:outline-none ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <option value="pending" className="bg-slate-900 text-amber-300">Pending</option>
                        <option value="partially_paid" className="bg-slate-900 text-blue-300">Partially Paid</option>
                        <option value="paid" className="bg-slate-900 text-emerald-300">Paid</option>
                        <option value="refunded" className="bg-slate-900 text-rose-300">Refunded</option>
                      </select>
                    </td>

                    {/* Order Status Dropdown */}
                    <td className="py-3 px-3">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase focus:outline-none ${getStatusColor(
                          ord.orderStatus
                        )}`}
                      >
                        <option value="new" className="bg-slate-900 text-amber-300">New</option>
                        <option value="pending" className="bg-slate-900 text-amber-300">Pending</option>
                        <option value="confirmed" className="bg-slate-900 text-blue-300">Confirmed</option>
                        <option value="processing" className="bg-slate-900 text-blue-300">Processing</option>
                        <option value="shipped" className="bg-slate-900 text-cyan-300">Shipped</option>
                        <option value="delivered" className="bg-slate-900 text-emerald-300">Delivered</option>
                        <option value="completed" className="bg-slate-900 text-emerald-300">Completed</option>
                        <option value="cancelled" className="bg-slate-900 text-rose-300">Cancelled</option>
                        <option value="returned" className="bg-slate-900 text-rose-300">Returned</option>
                      </select>
                    </td>

                    {/* Courier Tracking */}
                    <td className="py-3 px-3">
                      <div className="text-[11px] text-slate-300 font-semibold">{ord.courierService || 'Standard'}</div>
                      <div className="text-[10px] font-mono text-slate-400">{ord.trackingNumber || 'Pending'}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveInvoiceOrder(ord)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={`https://wa.me/88${ord.customerPhone.replace(/\D/g, '')}?text=${getWhatsAppMessage(ord)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1 text-[11px] font-semibold"
                          title="WhatsApp Customer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete Order #${ord.orderNumber} for ${ord.customerName}?`)) {
                              deleteOrder(ord.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                          title="Delete this order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Invoice Modal for Specific Order */}
      {activeInvoiceOrder && (
        <SalesInvoiceModal
          order={activeInvoiceOrder}
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}

      {/* Standalone Sales Invoice Modal */}
      {isNewInvoiceModalOpen && (
        <SalesInvoiceModal
          order={null}
          onClose={() => setIsNewInvoiceModalOpen(false)}
        />
      )}

    </div>
  );
};
