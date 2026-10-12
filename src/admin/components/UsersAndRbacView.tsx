import React, { useState, useMemo } from 'react';
import { useAdminStore } from '../adminStore';
import { useAdminAuth } from '../authContext';
import { AdminRole, AdminUser } from '../types';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  Key,
  Info,
  Trash2,
  Edit2,
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Users,
  ShieldAlert,
} from 'lucide-react';

export const UsersAndRbacView: React.FC = () => {
  const {
    adminUsers = [],
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
    updateAdminUserStatus,
  } = useAdminStore();
  const { currentUser } = useAdminAuth();

  const usersList = adminUsers || [];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<AdminRole>('sales_staff');
  const [userStatus, setUserStatus] = useState<'active' | 'disabled'>('active');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<AdminRole>('sales_staff');
  const [editStatus, setEditStatus] = useState<'active' | 'disabled'>('active');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Delete User Modal State
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  // Feedback banner state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const roleDescriptions: Record<AdminRole, string> = {
    super_admin: 'Full unrestricted system access, can purge products, manage user roles, and delete accounts.',
    admin: 'Complete store operations, inventory management, and order handling, without role mutation.',
    manager: 'Can manage products, customer orders, inventory restocks, and view financials.',
    sales_staff: 'Access to customer CRM, order entry, and invoice generation.',
    inventory_staff: 'Limited to warehouse stock in, stock out, and product quantities.',
    customer_support: 'View orders, access customer WhatsApp hotlines, and manage comments.',
    content_editor: 'Manage zones, tools, OS ISOs, and product specifications.',
    viewer: 'Read-only access to dashboard statistics without edit permissions.',
  };

  const roleBadgeColors: Record<AdminRole, string> = {
    super_admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    admin: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    manager: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    sales_staff: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    inventory_staff: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    customer_support: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    content_editor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    viewer: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (user.name && user.name.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.phone && user.phone.toLowerCase().includes(q)) ||
        user.role.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, searchQuery, roleFilter, statusFilter]);

  // Generate random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      showFeedback('error', 'Name and Email are required.');
      return;
    }

    // Check for duplicate email
    const cleanEmail = userEmail.trim().toLowerCase();
    const existing = usersList.find((u) => (u.email || '').toLowerCase() === cleanEmail);
    if (existing) {
      showFeedback('error', `A user with email "${cleanEmail}" already exists.`);
      return;
    }

    addAdminUser({
      name: userName.trim(),
      email: cleanEmail,
      password: userPassword.trim(),
      role: userRole,
      status: userStatus,
      phone: userPhone.trim(),
    });

    showFeedback('success', `Authorized account for "${userName}" successfully created.`);
    setIsAddUserOpen(false);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserPhone('');
    setUserRole('sales_staff');
    setUserStatus('active');
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditStatus(user.status === 'disabled' ? 'disabled' : 'active');
    setEditPassword('');
    setShowEditPassword(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) {
      showFeedback('error', 'Staff name cannot be empty.');
      return;
    }

    const updatedFields: Partial<AdminUser> = {
      name: editName.trim(),
      phone: editPhone.trim(),
      role: editRole,
      status: editStatus,
    };

    // If superadmin changed email and it's not the primary superadmin
    const isSuperAdminAccount =
      editingUser.email.toLowerCase() === 'jhfboss' ||
      editingUser.email.toLowerCase() === 'jhflaptopzone@gmail.com' ||
      editingUser.role === 'super_admin';

    if (!isSuperAdminAccount) {
      updatedFields.email = editEmail.trim().toLowerCase();
    }

    // If new password was entered
    if (editPassword.trim()) {
      updatedFields.password = editPassword.trim();
    }

    updateAdminUser(editingUser.uid, updatedFields);
    showFeedback('success', `User profile for "${editName}" updated successfully.`);
    setEditingUser(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;

    const res = deleteAdminUser(deletingUser.uid);
    if (res.success) {
      showFeedback('success', `User account for "${deletingUser.name}" has been removed.`);
    } else {
      showFeedback('error', res.message || 'Failed to remove user account.');
    }
    setDeletingUser(null);
  };

  // Metrics
  const totalCount = usersList.length;
  const superAdminCount = usersList.filter((u) => u.role === 'super_admin').length;
  const activeCount = usersList.filter((u) => u.status === 'active').length;
  const suspendedCount = usersList.filter((u) => u.status === 'disabled').length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span>User Manager &amp; RBAC Security</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Superadmin directory to add, modify, suspend, and remove administrator and staff accounts.
          </p>
        </div>

        {isSuperAdmin ? (
          <button
            onClick={() => {
              setUserPassword(generateStrongPassword());
              setIsAddUserOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Staff / Admin</span>
          </button>
        ) : (
          <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>User modification restricted to Super Admin</span>
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Accounts</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Authorized staff</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Super Admins</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{superAdminCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Root system level</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Active Staff</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Can login to admin</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Suspended</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{suspendedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Login access revoked</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone or role..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="sales_staff">Sales Staff</option>
            <option value="inventory_staff">Inventory Staff</option>
            <option value="customer_support">Customer Support</option>
            <option value="content_editor">Content Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="disabled">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">
              Admin Users Directory ({filteredUsers.length} of {totalCount})
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Credentials and roles are verified locally and synced to Cloud Firestore.
            </p>
          </div>
          <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
            Zero-Trust RBAC
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-400">No admin accounts found</p>
            <p className="mt-1">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-3">Role &amp; Privilege</th>
                  <th className="py-3.5 px-3">Role Description</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Last Active</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((user) => {
                  const uid = user.uid || (user as any).id;
                  const isPrimarySuperAdmin =
                    (user.email || '').toLowerCase() === 'jhfboss' ||
                    (user.email || '').toLowerCase() === 'jhflaptopzone@gmail.com' ||
                    user.role === 'super_admin';
                  const isCurrentUser = currentUser?.email && (user.email || '').toLowerCase() === currentUser.email.toLowerCase();

                  return (
                    <tr key={uid} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-sm shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isPrimarySuperAdmin && (
                                <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                  Primary Superadmin
                                </span>
                              )}
                              {isCurrentUser && !isPrimarySuperAdmin && (
                                <span className="text-[9px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">{user.email}</div>
                            {user.phone && (
                              <div className="text-[10px] text-slate-500">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                            roleBadgeColors[user.role] || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300 text-[11px] max-w-xs">
                        {roleDescriptions[user.role]}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            user.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          ></span>
                          <span>{user.status === 'active' ? 'Active' : 'Suspended'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                        {user.lastLogin && user.lastLogin !== 'Never'
                          ? new Date(user.lastLogin).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Never'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuperAdmin ? (
                            <>
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEdit(user)}
                                title="Edit Staff Profile & Password"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Suspend / Activate Toggle */}
                              {!isPrimarySuperAdmin && !isCurrentUser && (
                                <button
                                  onClick={() =>
                                    updateAdminUserStatus(
                                      uid,
                                      user.status === 'active' ? 'disabled' : 'active'
                                    )
                                  }
                                  title={user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition ${
                                    user.status === 'active'
                                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
                                  }`}
                                >
                                  {user.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>
                              )}

                              {/* Delete Button */}
                              {!isPrimarySuperAdmin && !isCurrentUser ? (
                                <button
                                  onClick={() => setDeletingUser(user)}
                                  title="Remove Staff Account"
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 italic px-1">Protected</span>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500">Read Only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================== ADD USER MODAL ===================== */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Authorize New Staff Member</h3>
                  <p className="text-[11px] text-slate-400">Add an administrator or staff login to JHF Laptop Zone</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Shakil Mahmud"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="019XXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address / Login ID *</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="shakil@jhflaptopzone.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Login Password *</label>
                  <button
                    type="button"
                    onClick={() => setUserPassword(generateStrongPassword())}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-10 py-2 text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role &amp; Permissions *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as AdminRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="super_admin">Super Admin (Full Root Access)</option>
                    <option value="admin">Admin (All Store Operations)</option>
                    <option value="manager">Manager (Orders, Products, Stock)</option>
                    <option value="sales_staff">Sales Staff (Orders, CRM, Invoices)</option>
                    <option value="inventory_staff">Inventory Staff (Stock In/Out)</option>
                    <option value="customer_support">Customer Support (Hotlines, Chats)</option>
                    <option value="content_editor">Content &amp; Zones Editor</option>
                    <option value="viewer">Viewer (Read-Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Status</label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as 'active' | 'disabled')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="active">Active (Can log in immediately)</option>
                    <option value="disabled">Suspended (Access blocked)</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-purple-300 p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 leading-relaxed">
                <strong>Privilege Scope:</strong> {roleDescriptions[userRole]}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-5 rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Authorize Staff Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT USER MODAL ===================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Edit Staff Account: {editingUser.name}</h3>
                  <p className="text-[11px] text-slate-400">Modify permissions, role, status or reset password</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="019XXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address / Login ID</label>
                <input
                  type="text"
                  required
                  disabled={
                    editingUser.role === 'super_admin' ||
                    editingUser.email.toLowerCase() === 'jhfboss' ||
                    editingUser.email.toLowerCase() === 'jhflaptopzone@gmail.com'
                  }
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Change Password (Leave blank to keep current)</label>
                  <button
                    type="button"
                    onClick={() => setEditPassword(generateStrongPassword())}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password if updating..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-10 py-2 text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                  <select
                    value={editRole}
                    disabled={
                      editingUser.role === 'super_admin' ||
                      editingUser.email.toLowerCase() === 'jhfboss' ||
                      editingUser.email.toLowerCase() === 'jhflaptopzone@gmail.com'
                    }
                    onChange={(e) => setEditRole(e.target.value as AdminRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-60"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="sales_staff">Sales Staff</option>
                    <option value="inventory_staff">Inventory Staff</option>
                    <option value="customer_support">Customer Support</option>
                    <option value="content_editor">Content Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    disabled={
                      editingUser.role === 'super_admin' ||
                      editingUser.email.toLowerCase() === 'jhfboss' ||
                      editingUser.email.toLowerCase() === 'jhflaptopzone@gmail.com'
                    }
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'disabled')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-60"
                  >
                    <option value="active">Active (Permitted)</option>
                    <option value="disabled">Suspended (Blocked)</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-purple-300 p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 leading-relaxed">
                <strong>Current Role:</strong> {roleDescriptions[editRole]}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Remove Staff Account?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 mb-4 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Staff Name: </span>
                <strong className="text-white">{deletingUser.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Email: </span>
                <strong className="font-mono text-purple-300">{deletingUser.email}</strong>
              </div>
              <div>
                <span className="text-slate-400">Assigned Role: </span>
                <span className="uppercase text-[10px] font-bold text-amber-400">{deletingUser.role.replace('_', ' ')}</span>
              </div>
            </div>

            <p className="text-xs text-rose-300/90 mb-5 leading-relaxed">
              This staff member will immediately lose access to the admin dashboard, orders, inventory, and invoices.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 px-4 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
