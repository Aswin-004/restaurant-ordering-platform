import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, LogOut, Package, Clock, CheckCircle, X as XIcon, Sparkles, Plus, Trash2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'classic@admin2026'; // Store in .env in production

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('orders');
  
  // Specials state
  const [specials, setSpecials] = useState([]);
  const [specialsLoading, setSpecialsLoading] = useState(false);
  const [showSpecialForm, setShowSpecialForm] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState(null);
  const [specialForm, setSpecialForm] = useState({
    name: '',
    description: '',
    original_price: '',
    special_price: '',
    image: '',
    badge: "Today's Special"
  });

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchOrders();
      fetchSpecials();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple authentication
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      toast.success('Login successful!');
      fetchOrders();
      fetchSpecials();
    } else {
      toast.error('Invalid credentials');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    toast.success('Logged out successfully');
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status`, {
        status: newStatus
      });
      toast.success('Order status updated');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-200 text-green-900',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Specials Management Functions
  const fetchSpecials = async () => {
    setSpecialsLoading(true);
    try {
      const response = await axios.get(`${API}/specials?active_only=false`);
      setSpecials(response.data);
    } catch (error) {
      console.log('Failed to fetch specials');
    } finally {
      setSpecialsLoading(false);
    }
  };

  const handleSpecialSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...specialForm,
        original_price: parseFloat(specialForm.original_price),
        special_price: parseFloat(specialForm.special_price)
      };

      if (editingSpecial) {
        await axios.put(`${API}/specials/${editingSpecial.id}`, payload);
        toast.success('Special updated!');
      } else {
        await axios.post(`${API}/specials`, payload);
        toast.success('Special created!');
      }
      
      fetchSpecials();
      resetSpecialForm();
    } catch (error) {
      toast.error('Failed to save special');
    }
  };

  const deleteSpecial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this special?')) return;
    try {
      await axios.delete(`${API}/specials/${id}`);
      toast.success('Special deleted!');
      fetchSpecials();
    } catch (error) {
      toast.error('Failed to delete special');
    }
  };

  const toggleSpecial = async (id) => {
    try {
      await axios.patch(`${API}/specials/${id}/toggle`);
      toast.success('Special toggled!');
      fetchSpecials();
    } catch (error) {
      toast.error('Failed to toggle special');
    }
  };

  const editSpecial = (special) => {
    setEditingSpecial(special);
    setSpecialForm({
      name: special.name,
      description: special.description,
      original_price: special.original_price.toString(),
      special_price: special.special_price.toString(),
      image: special.image || '',
      badge: special.badge
    });
    setShowSpecialForm(true);
  };

  const resetSpecialForm = () => {
    setSpecialForm({
      name: '',
      description: '',
      original_price: '',
      special_price: '',
      image: '',
      badge: "Today's Special"
    });
    setEditingSpecial(null);
    setShowSpecialForm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8B0000] to-[#6B0000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#8B0000] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#8B0000] mb-2">Admin Panel</h1>
            <p className="text-gray-600">Classic Restaurant</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000]"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000] pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8B0000] text-white hover:bg-[#6B0000] py-3 text-lg font-semibold"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-gray-600 hover:text-[#8B0000] text-sm"
          >
            ← Back to Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#8B0000]">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Classic Restaurant</p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
        {/* Tabs */}
        <div className="container mx-auto px-4 pb-2">
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 px-4 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-b-2 border-[#8B0000] text-[#8B0000]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-5 h-5" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('specials')}
              className={`pb-2 px-4 font-semibold flex items-center gap-2 transition-colors ${
                activeTab === 'specials'
                  ? 'border-b-2 border-[#8B0000] text-[#8B0000]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Today's Specials
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'orders' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-[#8B0000] mb-2">{orders.length}</div>
                <div className="text-gray-600">Total Orders</div>
              </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {orders.filter(o => o.status === 'confirmed' || o.status === 'preparing').length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
            <div className="text-gray-600">Delivered</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === status
                    ? 'bg-[#8B0000] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Orders' : status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
            <button
              onClick={fetchOrders}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-md text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#8B0000] mb-1">
                      {order.order_number}
                    </h3>
                    <p className="text-gray-600">{order.customer_name} • {order.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Items:</span>
                    <p className="font-semibold">{order.items}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <p className="font-semibold text-[#8B0000]">₹{order.total}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Order Type:</span>
                    <p className="font-semibold capitalize">{order.order_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span>
                    <p className="font-semibold capitalize">{order.payment_method} ({order.payment_status})</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    className="text-[#8B0000] hover:underline text-sm font-semibold"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        ) : (
        <>
          {/* Specials Management */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#8B0000]">Today's Specials</h2>
                <button
                  onClick={() => setShowSpecialForm(!showSpecialForm)}
                  className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6B0000] flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Special
                </button>
              </div>

              {showSpecialForm && (
                <form onSubmit={handleSpecialSubmit} className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Special Name"
                      value={specialForm.name}
                      onChange={(e) => setSpecialForm({ ...specialForm, name: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={specialForm.description}
                      onChange={(e) => setSpecialForm({ ...specialForm, description: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Original Price"
                      value={specialForm.original_price}
                      onChange={(e) => setSpecialForm({ ...specialForm, original_price: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                      step="0.01"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Special Price"
                      value={specialForm.special_price}
                      onChange={(e) => setSpecialForm({ ...specialForm, special_price: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                      step="0.01"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={specialForm.image}
                      onChange={(e) => setSpecialForm({ ...specialForm, image: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Badge Text"
                      value={specialForm.badge}
                      onChange={(e) => setSpecialForm({ ...specialForm, badge: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      {editingSpecial ? 'Update Special' : 'Create Special'}
                    </button>
                    <button
                      type="button"
                      onClick={resetSpecialForm}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {specialsLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading specials...</p>
                </div>
              ) : specials.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No specials yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specials.map((special) => (
                    <div key={special.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-[#8B0000]">{special.name}</h3>
                          <p className="text-sm text-gray-600">{special.description}</p>
                        </div>
                        <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                          {special.badge}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500 line-through">₹{special.original_price}</p>
                          <p className="text-lg font-bold text-green-600">₹{special.special_price}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editSpecial(special)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleSpecial(special.id)}
                          className={`flex-1 px-3 py-2 rounded text-sm flex items-center justify-center gap-1 ${
                            special.active
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          {special.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteSpecial(special.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedOrder(null)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#8B0000]">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#FFF8DC] rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">{selectedOrder.order_number}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Customer Details</h4>
                  <p>{selectedOrder.customer_name}</p>
                  <p>{selectedOrder.phone}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.address}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Order Items</h4>
                  <p>{selectedOrder.items}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Delivery Charge:</span>
                    <span>₹{selectedOrder.delivery_charge}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-[#8B0000]">₹{selectedOrder.total}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Update Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          selectedOrder.status === status
                            ? 'bg-[#8B0000] text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {status.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
