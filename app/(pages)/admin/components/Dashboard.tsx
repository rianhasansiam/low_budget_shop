'use client'

import React, { useMemo } from 'react'
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import { useProducts, useCategories, useOrders } from '@/lib/redux/hooks'
import { useGetData } from '@/lib/hooks/useGetData'
import Image from 'next/image'

interface UserData {
  _id: string
  name: string
  email: string
  image: string | null
  role: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

const Dashboard = () => {
  // Fetch data from Redux
  const { products, loading: productsLoading } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { orders, loading: ordersLoading } = useOrders()
  
  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useGetData<ApiResponse<UserData[]>>(
    'users',
    '/api/users'
  )
  
  const users = usersData?.data || []
  const isLoading = productsLoading || categoriesLoading || ordersLoading || usersLoading

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status !== 'cancelled') {
        return sum + (order.total_amount || 0)
      }
      return sum
    }, 0)

    const deliveredOrders = orders.filter(o => o.status === 'delivered')
    const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

    return {
      totalRevenue,
      deliveredRevenue,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      processingOrders: orders.filter(o => o.status === 'processing').length,
      deliveredOrders: deliveredOrders.length,
      totalProducts: products.length,
      lowStockProducts: products.filter(p => p.stock <= 5).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalCustomers: users.length,
      totalCategories: categories.length
    }
  }, [orders, products, users, categories])

  // Format currency
  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD')}`
  }

  // Get recent orders (last 5)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 5)
  }, [orders])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get status style
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  const statCards = [
    { 
      icon: DollarSign, 
      label: 'Total Revenue', 
      value: formatCurrency(stats.totalRevenue), 
      subtext: `${formatCurrency(stats.deliveredRevenue)} delivered`,
      bgColor: 'bg-emerald-50', 
      iconColor: 'text-emerald-600' 
    },
    { 
      icon: ShoppingCart, 
      label: 'Total Orders', 
      value: stats.totalOrders.toString(), 
      subtext: `${stats.pendingOrders} pending, ${stats.deliveredOrders} delivered`,
      bgColor: 'bg-blue-50', 
      iconColor: 'text-blue-600' 
    },
    { 
      icon: Package, 
      label: 'Products', 
      value: stats.totalProducts.toString(), 
      subtext: `${stats.lowStockProducts} low stock, ${stats.outOfStock} out`,
      bgColor: 'bg-violet-50', 
      iconColor: 'text-violet-600' 
    },
    { 
      icon: Users, 
      label: 'Customers', 
      value: stats.totalCustomers.toString(), 
      subtext: `${stats.totalCategories} categories`,
      bgColor: 'bg-amber-50', 
      iconColor: 'text-amber-600' 
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <TrendingUp className="w-3 h-3" />
                Live
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-500 mt-0.5">Latest {recentOrders.length} customer orders</p>
            </div>
            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No orders yet
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {order.items?.[0]?.image ? (
                          <Image
                            src={order.items[0].image}
                            alt=""
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                            {order.customer_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="text-sm text-gray-600">{order.customer_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total_amount || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(order.order_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No orders yet
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className="p-4 bg-gray-50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                      {order.customer_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm text-gray-600">{order.customer_name || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{order.items?.length || 0} item(s)</span>
                  <span>{formatDate(order.order_date)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
          <div className="space-y-3">
            {products.filter(p => p.stock <= 5 && p.stock > 0).slice(0, 3).map(product => (
              <div key={product._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-sm text-gray-700 truncate max-w-30">{product.name}</span>
                </div>
                <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                  {product.stock} left
                </span>
              </div>
            ))}
            {products.filter(p => p.stock <= 5 && p.stock > 0).length === 0 && (
              <p className="text-sm text-gray-500">No low stock items</p>
            )}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-bold text-yellow-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processing</span>
              <span className="text-sm font-bold text-purple-600">{stats.processingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Delivered</span>
              <span className="text-sm font-bold text-green-600">{stats.deliveredOrders}</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="space-y-3">
            {categories.slice(0, 3).map(category => (
              <div key={category._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {products.filter(p => p.category === category.name).length} products
                </span>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-500">No categories yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard