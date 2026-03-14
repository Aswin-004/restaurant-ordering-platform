/* eslint-disable */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Eye, EyeOff, LogOut, Package, Clock, CheckCircle,
  X as XIcon, Sparkles, Plus, Trash2, Edit2, ToggleLeft, ToggleRight,
  Key, UtensilsCrossed, BarChart3, RefreshCw, ArrowLeft, TrendingUp, IndianRupee, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  loginAdmin, verifyToken as verifyTokenApi, logoutAdmin, changePassword as changePasswordApi,
  getAdminOrders, adminUpdateOrderStatus,
  getSpecials, createSpecial, updateSpecial, deleteSpecial as deleteSpecialApi, toggleSpecial as toggleSpecialApi,
  getMenu, createMenuItem, updateMenuItem, deleteMenuItem as deleteMenuItemApi
} from '../services/api';

/* ────────────────────────────────────────────────────────
   Lazy-load recharts only when Analytics tab is active
   ──────────────────────────────────────────────────────── */
let Recharts = null;
const loadRecharts = () => import('recharts').then(m => { Recharts = m; });

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-emerald-100 text-emerald-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-200 text-green-900',
  cancelled: 'bg-red-100 text-red-800',
};

const TABS = [
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'specials', label: 'Specials', icon: Sparkles },
  { key: 'menu', label: 'Menu', icon: UtensilsCrossed },
];

const AdminPanel = () => {
  const navigate = useNavigate();

  /* Auth */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpForm, setCpForm] = useState({ old_password: '', new_password: '', confirm_password: '' });

  /* Data */
  const [orders, setOrders] = useState([]);
  const [specials_, setSpecials] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialsLoading, setSpecialsLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);

  /* UI */
  const [activeTab, setActiveTab] = useState('orders');
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rechartsLoaded, setRechartsLoaded] = useState(false);

  /* Specials form */
  const [showSpecialForm, setShowSpecialForm] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState(null);
  const [specialForm, setSpecialForm] = useState({ name: '', description: '', original_price: '', special_price: '', image: '', badge: "Today's Special" });

  /* Menu form */
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({ category: '', name: '', price: '', description: '', image: '', available: true });

  /* Init */
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    const token = localStorage.getItem('admin_token');
    if (token) checkToken();
    /* eslint-enable react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && !rechartsLoaded) {
      loadRecharts().then(() => setRechartsLoaded(true)).catch(() => {});
    }
  }, [activeTab, rechartsLoaded]);

  const checkToken = async () => {
    try {
      const res = await verifyTokenApi();
      if (res.data.authenticated) {
        setIsAuthenticated(true);
        setUsername(res.data.username);
        fetchAll();
      }
    } catch {
      localStorage.removeItem('admin_token');
    }
  };

  const fetchAll = () => { fetchOrders(); fetchSpecialsData(); fetchMenuData(); };

  /* Auth handlers */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { toast.error('Enter username and password'); return; }
    setIsLoading(true);
    try {
      const res = await loginAdmin(username, password);
      localStorage.setItem('admin_token', res.data.access_token);
      setIsAuthenticated(true);
      setPassword('');
      toast.success(`Welcome ${res.data.username}!`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally { setIsLoading(false); }
  };

  const handleLogout = async () => {
    try { await logoutAdmin(); } catch {}
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setUsername('');
    toast.success('Logged out');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (cpForm.new_password !== cpForm.confirm_password) { toast.error('Passwords do not match'); return; }
    if (cpForm.new_password.length < 8) { toast.error('Min 8 characters'); return; }
    try {
      await changePasswordApi(cpForm.old_password, cpForm.new_password);
      toast.success('Password updated');
      setShowChangePassword(false);
      setCpForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  /* Orders */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch { setOrders([]); } finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await adminUpdateOrderStatus(orderId, status);
      toast.success('Status updated');
      fetchOrders();
      setSelectedOrder(null);
    } catch { toast.error('Failed to update'); }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  /* Specials */
  const fetchSpecialsData = async () => {
    setSpecialsLoading(true);
    try {
      const res = await getSpecials(false);
      setSpecials(Array.isArray(res.data) ? res.data : []);
    } catch { setSpecials([]); } finally { setSpecialsLoading(false); }
  };

  const handleSpecialSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...specialForm, original_price: parseFloat(specialForm.original_price), special_price: parseFloat(specialForm.special_price) };
      if (editingSpecial) { await updateSpecial(editingSpecial.id, payload); toast.success('Updated!'); }
      else { await createSpecial(payload); toast.success('Created!'); }
      fetchSpecialsData(); resetSpecialForm();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteSpecial = async (id) => {
    if (!window.confirm('Delete this special?')) return;
    try { await deleteSpecialApi(id); toast.success('Deleted'); fetchSpecialsData(); } catch { toast.error('Failed'); }
  };

  const handleToggleSpecial = async (id) => {
    try { await toggleSpecialApi(id); fetchSpecialsData(); } catch { toast.error('Failed'); }
  };

  const editSpecialFn = (s) => {
    setEditingSpecial(s);
    setSpecialForm({ name: s.name, description: s.description, original_price: String(s.original_price), special_price: String(s.special_price), image: s.image || '', badge: s.badge });
    setShowSpecialForm(true);
  };

  const resetSpecialForm = () => {
    setSpecialForm({ name: '', description: '', original_price: '', special_price: '', image: '', badge: "Today's Special" });
    setEditingSpecial(null);
    setShowSpecialForm(false);
  };

  /* Menu */
  const fetchMenuData = async () => {
    setMenuLoading(true);
    try {
      const res = await getMenu(false);
      setMenuItems(Array.isArray(res.data) ? res.data : []);
    } catch { setMenuItems([]); } finally { setMenuLoading(false); }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...menuForm, price: parseFloat(menuForm.price) };
      if (editingMenuItem) { await updateMenuItem(editingMenuItem.id, payload); toast.success('Updated!'); }
      else { await createMenuItem(payload); toast.success('Created!'); }
      fetchMenuData(); resetMenuForm();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await deleteMenuItemApi(id); toast.success('Deleted'); fetchMenuData(); } catch { toast.error('Failed'); }
  };

  const toggleAvail = async (item) => {
    try { await updateMenuItem(item.id, { available: !item.available }); fetchMenuData(); } catch { toast.error('Failed'); }
  };

  const editMenuFn = (item) => {
    setEditingMenuItem(item);
    setMenuForm({ category: item.category, name: item.name, price: String(item.price), description: item.description || '', image: item.image || '', available: item.available });
    setShowMenuForm(true);
  };

  const resetMenuForm = () => {
    setMenuForm({ category: '', name: '', price: '', description: '', image: '', available: true });
    setEditingMenuItem(null);
    setShowMenuForm(false);
  };

  /* Analytics helpers */
  const analytics = useMemo(() => {
    const nonCancelled = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = nonCancelled.reduce((s, o) => s + (o.total || 0), 0);
    const byStatus = {};
    orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
    const statusData = Object.entries(byStatus).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

    const byDate = {};
    orders.forEach(o => {
      const d = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Unknown';
      if (!byDate[d]) byDate[d] = { date: d, orders: 0, revenue: 0 };
      byDate[d].orders++;
      if (o.status !== 'cancelled') byDate[d].revenue += (o.total || 0);
    });
    const dailyData = Object.values(byDate).slice(-7);

    return {
      totalRevenue,
      statusData,
      dailyData,
      avgOrder: nonCancelled.length ? Math.round(totalRevenue / nonCancelled.length) : 0,
      uniqueCustomers: new Set(orders.map(o => o.phone)).size,
    };
  }, [orders]);

  /* ════════════════════════════════════════════════════════
     LOGIN SCREEN
     ════════════════════════════════════════════════════════ */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-800 to-brand-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-brand-800">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Classic Restaurant</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-700 text-sm" placeholder="Enter username" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-700 pr-11 text-sm" placeholder="Enter password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-brand-700 text-white hover:bg-brand py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-3 text-gray-500 hover:text-brand-700 text-xs flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Website
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     AUTHENTICATED DASHBOARD
     ════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-display font-bold text-brand-800">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">Classic Restaurant &bull; {username}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowChangePassword(true)} className="p-2 text-gray-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors" title="Change Password">
              <Key className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-brand-700 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">

        {/* ═══════════════ ORDERS TAB ═══════════════ */}
        {activeTab === 'orders' && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total', value: orders.length, icon: Package, color: 'text-brand-700 bg-brand-50' },
                { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                { label: 'In Progress', value: orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length, icon: RefreshCw, color: 'text-blue-600 bg-blue-50' },
                { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-5">
              {['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === s ? 'bg-brand-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'}`}>
                  {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
                </button>
              ))}
              <button onClick={fetchOrders} className="ml-auto px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {/* Order list */}
            {loading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <div key={order.id} onClick={() => setSelectedOrder(order)}
                    className="bg-white rounded-xl p-4 border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-bold text-brand-700 text-sm">{order.order_number}</span>
                        <p className="text-xs text-gray-500">{order.customer_name} &bull; {order.phone}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 truncate max-w-[60%]">{order.items}</span>
                      <span className="font-bold text-gray-800">₹{order.total}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                      <span><Clock className="w-3 h-3 inline mr-0.5" />{order.created_at ? new Date(order.created_at).toLocaleString() : ''}</span>
                      <span className="capitalize">{order.order_type} &bull; {order.payment_method}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══════════════ ANALYTICS TAB ═══════════════ */}
        {activeTab === 'analytics' && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600 bg-green-50' },
                { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-brand-700 bg-brand-50' },
                { label: 'Avg Order', value: `₹${analytics.avgOrder}`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
                { label: 'Customers', value: analytics.uniqueCustomers, icon: Users, color: 'text-purple-600 bg-purple-50' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-gray-800">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {rechartsLoaded && Recharts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Daily Orders & Revenue */}
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <h3 className="font-bold text-sm text-gray-800 mb-4">Daily Orders &amp; Revenue</h3>
                  <Recharts.ResponsiveContainer width="100%" height={250}>
                    <Recharts.BarChart data={analytics.dailyData}>
                      <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <Recharts.XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <Recharts.YAxis tick={{ fontSize: 11 }} />
                      <Recharts.Tooltip />
                      <Recharts.Bar dataKey="orders" fill="#b30000" radius={[4, 4, 0, 0]} name="Orders" />
                      <Recharts.Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Revenue" />
                    </Recharts.BarChart>
                  </Recharts.ResponsiveContainer>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white rounded-xl p-5 border border-gray-100">
                  <h3 className="font-bold text-sm text-gray-800 mb-4">Order Status Distribution</h3>
                  <Recharts.ResponsiveContainer width="100%" height={250}>
                    <Recharts.PieChart>
                      <Recharts.Pie data={analytics.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                        label={({ name, value }) => `${name} (${value})`}>
                        {analytics.statusData.map((_, i) => (
                          <Recharts.Cell key={i} fill={['#b30000', '#D4AF37', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#6366f1', '#f59e0b'][i % 8]} />
                        ))}
                      </Recharts.Pie>
                      <Recharts.Tooltip />
                    </Recharts.PieChart>
                  </Recharts.ResponsiveContainer>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white rounded-xl p-5 border border-gray-100 md:col-span-2">
                  <h3 className="font-bold text-sm text-gray-800 mb-4">Revenue Trend</h3>
                  <Recharts.ResponsiveContainer width="100%" height={200}>
                    <Recharts.LineChart data={analytics.dailyData}>
                      <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <Recharts.XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <Recharts.YAxis tick={{ fontSize: 11 }} />
                      <Recharts.Tooltip />
                      <Recharts.Line type="monotone" dataKey="revenue" stroke="#b30000" strokeWidth={2} dot={{ fill: '#b30000' }} name="Revenue" />
                    </Recharts.LineChart>
                  </Recharts.ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 text-sm">Loading charts...</div>
            )}
          </>
        )}

        {/* ═══════════════ SPECIALS TAB ═══════════════ */}
        {activeTab === 'specials' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Today's Specials</h2>
              <button onClick={() => setShowSpecialForm(!showSpecialForm)} className="bg-brand-700 text-white px-4 py-2 rounded-xl hover:bg-brand text-sm font-semibold flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Special
              </button>
            </div>

            {showSpecialForm && (
              <form onSubmit={handleSpecialSubmit} className="bg-white rounded-xl p-5 border border-gray-100 mb-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Special Name" value={specialForm.name} onChange={e => setSpecialForm({ ...specialForm, name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" required />
                  <input type="text" placeholder="Description" value={specialForm.description} onChange={e => setSpecialForm({ ...specialForm, description: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" />
                  <input type="number" placeholder="Original Price" value={specialForm.original_price} onChange={e => setSpecialForm({ ...specialForm, original_price: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" step="0.01" required />
                  <input type="number" placeholder="Special Price" value={specialForm.special_price} onChange={e => setSpecialForm({ ...specialForm, special_price: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" step="0.01" required />
                  <input type="text" placeholder="Image URL" value={specialForm.image} onChange={e => setSpecialForm({ ...specialForm, image: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" />
                  <input type="text" placeholder="Badge Text" value={specialForm.badge} onChange={e => setSpecialForm({ ...specialForm, badge: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 text-sm font-semibold">{editingSpecial ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={resetSpecialForm} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-300 text-sm">Cancel</button>
                </div>
              </form>
            )}

            {specialsLoading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : specials_.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No specials yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specials_.map(s => (
                  <div key={s.id} className="bg-white rounded-xl p-4 border border-gray-100 hover:border-brand-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-brand-700">{s.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{s.description}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-400 line-through">₹{s.original_price}</span>
                      <span className="font-bold text-green-600">₹{s.special_price}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => editSpecialFn(s)} className="flex-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 text-xs font-medium flex items-center justify-center gap-1">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleToggleSpecial(s.id)} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${s.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {s.is_active ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                        {s.is_active ? 'On' : 'Off'}
                      </button>
                      <button onClick={() => handleDeleteSpecial(s.id)} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ MENU TAB ═══════════════ */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Menu Items ({menuItems.length})</h2>
              <div className="flex gap-2">
                <button onClick={fetchMenuData} className="bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 text-xs flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
                <button onClick={() => setShowMenuForm(!showMenuForm)} className="bg-brand-700 text-white px-4 py-2 rounded-xl hover:bg-brand text-sm font-semibold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>

            {showMenuForm && (
              <form onSubmit={handleMenuSubmit} className="bg-white rounded-xl p-5 border border-gray-100 mb-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Category" value={menuForm.category} onChange={e => setMenuForm({ ...menuForm, category: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" required />
                  <input type="text" placeholder="Item Name" value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" required />
                  <input type="number" placeholder="Price" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" step="0.01" required />
                  <input type="text" placeholder="Description" value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" />
                  <input type="text" placeholder="Image URL" value={menuForm.image} onChange={e => setMenuForm({ ...menuForm, image: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-700" />
                  <label className="flex items-center gap-2 px-4 py-2.5 text-sm">
                    <input type="checkbox" checked={menuForm.available} onChange={e => setMenuForm({ ...menuForm, available: e.target.checked })} className="w-4 h-4 accent-brand-700" />
                    <span className="font-medium">Available</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 text-sm font-semibold">{editingMenuItem ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={resetMenuForm} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-300 text-sm">Cancel</button>
                </div>
              </form>
            )}

            {menuLoading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : menuItems.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <UtensilsCrossed className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No menu items yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {menuItems.map(item => (
                  <div key={item.id} className={`bg-white rounded-xl p-3.5 border border-gray-100 flex items-center justify-between gap-3 ${!item.available ? 'opacity-60' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-800">{item.name}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.category}</span>
                        {!item.available && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Unavailable</span>}
                      </div>
                      <div className="text-sm font-bold text-brand-700 mt-0.5">₹{item.price}</div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => editMenuFn(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleAvail(item)} className={`p-2 rounded-lg ${item.available ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {item.available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDeleteMenu(item.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-700">{selectedOrder.order_number}</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><XIcon className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="bg-cream rounded-xl p-3">
                  <p className="text-xs text-gray-500">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : ''}</p>
                  <p className="font-semibold">{selectedOrder.customer_name} &bull; {selectedOrder.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedOrder.address}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Items</p>
                  <p className="font-medium">{selectedOrder.items}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{selectedOrder.subtotal}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Delivery</span><span>₹{selectedOrder.delivery_charge}</span></div>
                  <div className="flex justify-between font-bold pt-1.5 border-t"><span>Total</span><span className="text-brand-700">₹{selectedOrder.total}</span></div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Update Status</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                      <button key={s} onClick={() => updateStatus(selectedOrder.id, s)}
                        className={`px-2 py-2 rounded-lg text-[11px] font-semibold capitalize transition-colors ${selectedOrder.status === s ? 'bg-brand-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowChangePassword(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-700">Change Password</h2>
                <button onClick={() => setShowChangePassword(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><XIcon className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <input type="password" value={cpForm.old_password} onChange={e => setCpForm({ ...cpForm, old_password: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-700 text-sm" placeholder="Current password" required />
                <input type="password" value={cpForm.new_password} onChange={e => setCpForm({ ...cpForm, new_password: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-700 text-sm" placeholder="New password (min 8 chars)" required />
                <input type="password" value={cpForm.confirm_password} onChange={e => setCpForm({ ...cpForm, confirm_password: e.target.value })} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-700 text-sm" placeholder="Confirm new password" required />
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex-1 bg-brand-700 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand">Update</button>
                  <button type="button" onClick={() => setShowChangePassword(false)} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-300">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
