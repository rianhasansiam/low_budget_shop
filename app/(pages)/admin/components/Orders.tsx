'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Download, Eye, Trash2, X, Package, MapPin, CreditCard, Loader2, Phone } from 'lucide-react'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useOrders } from '@/lib/redux/hooks'
import Swal from 'sweetalert2'
import { 
  setOrders, 
  setOrdersLoading, 
  setOrdersError, 
  setOrdersPagination,
  updateOrderStatus,
  deleteOrder as deleteOrderAction,
  Order
} from '@/lib/redux/slices/ordersSlice'

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const dispatch = useAppDispatch()
  const { orders, loading, error, pagination, hasFetched } = useOrders()

  // Fetch orders ONCE on mount - not on status filter change
  useEffect(() => {
    // Skip if already fetched
    if (hasFetched) return
    
    const fetchOrders = async () => {
      dispatch(setOrdersLoading(true))
      try {
        // Fetch ALL orders once, then filter client-side
        const response = await fetch('/api/orders')
        if (!response.ok) throw new Error('Failed to fetch orders')
        
        const data = await response.json()
        dispatch(setOrders(data.data || []))
        dispatch(setOrdersPagination(data.pagination))
      } catch (err) {
        dispatch(setOrdersError(err instanceof Error ? err.message : 'Failed to fetch orders'))
      }
    }

    fetchOrders()
  }, [dispatch, hasFetched])

  // Filter orders based on search term AND status filter (all client-side)
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return []
    return orders.filter(order => {
      if (!order) return false
      
      // Status filter
      if (statusFilter && order.status !== statusFilter) return false
      
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      if (searchLower) {
        return (
          (order._id && order._id.toLowerCase().includes(searchLower)) ||
          (order.customer_name && order.customer_name.toLowerCase().includes(searchLower)) ||
          (order.email && order.email.toLowerCase().includes(searchLower)) ||
          (order.phone && order.phone.includes(searchTerm)) ||
          (order.items && order.items.some(item => item?.name?.toLowerCase().includes(searchLower)))
        )
      }
      return true
    })
  }, [orders, searchTerm, statusFilter])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`
  }

  // Get status badge styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'shipped':
        return 'bg-blue-100 text-blue-700'
      case 'processing':
        return 'bg-purple-100 text-purple-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update order')
      
      // Update Redux store
      dispatch(updateOrderStatus({ id: orderId, status: newStatus as Order['status'] }))
      
      // Update selected order if it's the one being updated
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] })
      }
      
      // Success toast
      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        text: `Order status changed to "${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}"`,
        confirmButtonColor: '#f97316',
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      })
    } catch (err) {
      console.error('Error updating order:', err)
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update order status',
        confirmButtonColor: '#f97316',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      })
    }
  }

  // Handle delete
  const handleDelete = async (orderId: string) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Order?',
      text: 'This action cannot be undone. Are you sure you want to delete this order?',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    })
    
    if (!result.isConfirmed) {
      return
    }
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete order')
      
      // Update Redux store
      dispatch(deleteOrderAction(orderId))
      
      if (selectedOrder?._id === orderId) {
        setIsModalOpen(false)
        setSelectedOrder(null)
      }
      
      // Success alert
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Order has been deleted successfully.',
        confirmButtonColor: '#f97316',
        timer: 2000,
        timerProgressBar: true
      })
    } catch (err) {
      console.error('Error deleting order:', err)
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete order. Please try again.',
        confirmButtonColor: '#f97316'
      })
    }
  }

  // Open order details modal
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  // Export orders as CSV
  const handleExport = () => {
    if (filteredOrders.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Orders to Export',
        text: 'There are no orders to export.',
        confirmButtonColor: '#f97316'
      })
      return
    }
    
    const csvContent = [
      ['Order ID', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Date', 'Payment Method'].join(','),
      ...filteredOrders.map(order => [
        order._id,
        order.customer_name,
        order.email,
        order.phone || 'N/A',
        order.total_amount,
        order.status,
        order.order_date,
        order.payment_method
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    // Success toast
    Swal.fire({
      icon: 'success',
      title: 'Export Successful!',
      text: `${filteredOrders.length} orders exported to CSV.`,
      confirmButtonColor: '#f97316',
      timer: 2000,
      timerProgressBar: true,
      toast: true,
      position: 'top-end',
      showConfirmButton: false
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load orders. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage customer orders ({pagination?.total || 0} total)
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
        >
          <option value="">All Status</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Items</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const { date, time } = formatDate(order.order_date)
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-orange-600">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customer_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{order.phone || 'No phone'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusStyle(order.status)}`}
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{date}</p>
                          <p className="text-xs text-gray-500">{time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openOrderDetails(order)}
                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(order._id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{selectedOrder._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedOrder.order_date).date} at {formatDate(selectedOrder.order_date).time}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {selectedOrder.customer_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Phone className="w-3 h-3" />
                    <span>{selectedOrder.phone || 'No phone'}</span>
                  </div>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Order Items</h4>
                </div>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <p className="font-medium text-gray-900">Total</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(selectedOrder.total_amount)}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Shipping Address</h4>
                </div>
                <p className="text-gray-600">
                  {selectedOrder.shipping_address.street}<br />
                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}<br />
                  {selectedOrder.shipping_address.country}
                </p>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Payment Method</h4>
                </div>
                <p className="text-gray-600">{selectedOrder.payment_method}</p>
              </div>

              {/* Update Status */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Update Status:</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleStatusUpdate(selectedOrder._id, e.target.value)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders