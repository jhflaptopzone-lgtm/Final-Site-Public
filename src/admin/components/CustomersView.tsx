import React, { useState } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import { Customer } from '../types';
import {
  Users,
  Search,
  MessageSquare,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  X,
  Save,
  Edit,
  Trash2,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, clearAllCustomers, exportDataAsCsv } = useAdminStore();
  const { hasPermission } = useAdminAuth();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const q = (search || '').toLowerCase();
    const custName = (c.fullName || (c as any).name || '').toLowerCase();
    const custPhone = (c.phoneNumber || (c as any).phone || '');
    const custDistrict = (c.district || '').toLowerCase();
    return (
      custName.includes(q) ||
      custPhone.includes(q) ||
      custDistrict.includes(q)
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addCustomer({
      fullName: name,
      phoneNumber: phone,
      email,
      address,
      district,
      notes,
    });

    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Customer Relationship Management (CRM)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Maintain customer purchase histories, delivery addresses across Bangladesh, and WhatsApp communication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('Customers', 'write') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          )}

          {customers.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('⚠️ Are you sure you want to delete ALL customers? This clears demo customer profiles.')) {
                  clearAllCustomers();
                }
              }}
              className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-2 rounded-xl flex items-center gap-1.5 transition font-semibold"
              title="Clear all demo customer records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Dummy</span>
            </button>
          )}

          <button
            onClick={() => exportDataAsCsv('customers')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl border border-slate-700 font-semibold"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Customer Name, Phone, District..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Location &amp; District</th>
                <th className="py-3 px-3 text-center">Orders</th>
                <th className="py-3 px-3">Lifetime Value</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const displayName = c.fullName || (c as any).name || 'Customer';
                  const displayPhone = c.phoneNumber || (c as any).phone || '';
                  const totalSpent = c.totalSpending ?? (c as any).totalSpent ?? 0;
                  return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{displayName}</div>
                      <div className="text-[10px] text-slate-400">ID: {c.id.slice(0, 8)}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-200">{displayPhone}</div>
                      {c.email && <div className="text-[10px] text-slate-400">{c.email}</div>}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-white font-medium">{c.district}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{c.address}</div>
                    </td>

                    <td className="py-3 px-3 text-center font-bold font-mono text-blue-400">
                      {c.totalOrders || 0}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      ৳{totalSpent.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                      {c.notes || '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/88${displayPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Assalamu Alaikum ${displayName}, thank you for being a valued client of JHF LAPTOP ZONE. How can we assist you today?`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
                          title="WhatsApp Customer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        </a>

                        <button
                          onClick={() => setEditingCustomer(c)}
                          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-400" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete customer ${displayName}?`)) {
                              deleteCustomer(c.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Add New Customer</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Dhaka, Chittagong..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Delivery Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Road #, Area..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Staff Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Requested 16GB RAM upgrade, Corporate client"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1.5 px-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded-xl shadow"
                >
                  Save Customer
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-400" />
                <span>Edit Customer</span>
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateCustomer(editingCustomer.id, {
                  fullName: editingCustomer.fullName || (editingCustomer as any).name,
                  phoneNumber: editingCustomer.phoneNumber || (editingCustomer as any).phone,
                  email: editingCustomer.email,
                  district: editingCustomer.district,
                  address: editingCustomer.address,
                  notes: editingCustomer.notes,
                });
                setEditingCustomer(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.fullName || (editingCustomer as any).name || ''}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      fullName: e.target.value,
                      name: e.target.value,
                    } as any)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.phoneNumber || (editingCustomer as any).phone || ''}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      phoneNumber: e.target.value,
                      phone: e.target.value,
                    } as any)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingCustomer.email || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, email: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={editingCustomer.district || ''}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, district: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Orders</label>
                  <input
                    type="number"
                    value={editingCustomer.totalOrders || (editingCustomer as any).ordersCount || 0}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        totalOrders: Number(e.target.value),
                        ordersCount: Number(e.target.value),
                      } as any)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Street Address</label>
                <textarea
                  rows={2}
                  value={editingCustomer.address || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, address: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Staff Notes</label>
                <input
                  type="text"
                  value={editingCustomer.notes || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, notes: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1.5 px-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-4 rounded-xl shadow"
                >
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
