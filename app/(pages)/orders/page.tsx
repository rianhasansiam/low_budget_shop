'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChevronRight,
  ShoppingBag,
  Loader2,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAppDispatch } from '@/lib/redux/hooks'
import { 
  setOrders as setOrdersAction, 
  setOrdersLoading, 
  setOrdersError 
} from '@/lib/redux/slices/ordersSlice'
import { useOrders } from '@/lib/redux/hooks'

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    name: string
    address: string
    city: string
    phone: string
  }
  paymentMethod: string
  createdAt: string
}

const statusConfig = {
  pending: { 
    label: 'Pending', 
    icon: Clock, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200'
  },
  processing: { 
    label: 'Processing', 
    icon: Package, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200'
  },
  shipped: { 
    label: 'Shipped', 
    icon: Truck, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200'
  },
  delivered: { 
    label: 'Delivered', 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200'
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: XCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200'
  }
}

export default function OrdersPage() {
  const { status: authStatus } = useSession()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { orders: reduxOrders, loading, hasFetched } = useOrders()
  const [activeFilter, setActiveFilter] = useState<string>('all')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
      return
    }

    // Fetch user's orders only once if not already fetched
    if (authStatus === 'authenticated' && !hasFetched) {
      const fetchOrders = async () => {
        dispatch(setOrdersLoading(true))
        try {
          const response = await fetch('/api/orders?my=true')
          if (response.ok) {
            const data = await response.json()
            dispatch(setOrdersAction(data.data || []))
          } else {
            dispatch(setOrdersError('Failed to fetch orders'))
          }
        } catch (error) {
          console.error('Error fetching orders:', error)
          dispatch(setOrdersError('Failed to fetch orders'))
        }
      }
      fetchOrders()
    }
  }, [authStatus, router, dispatch, hasFetched])

  // Cast Redux orders to local Order type and filter
  const orders = reduxOrders as unknown as Order[]
  
  // Filter orders client-side based on status
  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders
    return orders.filter(order => order.status === activeFilter)
  }, [orders, activeFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading your orders...</p>
        </motion.div>
      </div>
    )
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t placed any orders yet. Start shopping and your orders will appear here!
            </p>
            <Link
              href="/allProducts"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-500">Track and manage your orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter !== 'all' && (
                <span className="ml-2 text-xs opacity-70">
                  ({orders.filter(o => o.status === filter).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <p className="text-gray-500">No {activeFilter} orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon

                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-2xl shadow-sm border ${status.borderColor} overflow-hidden hover:shadow-md transition-shadow`}
                  >
                    {/* Order Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${status.bgColor} rounded-xl flex items-center justify-center`}>
                            <StatusIcon className={`w-6 h-6 ${status.color}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(order.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-4 h-4" />
                                {order.paymentMethod || 'Cash on Delivery'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            ৳{order.totalAmount?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <div className="flex flex-wrap gap-4 mb-4">
                        {order.items?.slice(0, 4).map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} × ৳{item.price}</p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 4 && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-500">+{order.items.length - 4}</span>
                          </div>
                        )}
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="flex items-start gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>
                            {order.shippingAddress.name}, {order.shippingAddress.address}, {order.shippingAddress.city}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </span>
                      <button className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
