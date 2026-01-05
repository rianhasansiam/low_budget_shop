'use client'

import React, { useState } from 'react'
import { Search, Mail, Eye, Calendar, ShoppingBag, Loader2, UserX, Shield, User, Trash2, X } from 'lucide-react'
import { useGetData } from '@/lib/hooks/useGetData'
import { useUpdateData } from '@/lib/hooks/useUpdateData'
import { useDeleteData } from '@/lib/hooks/useDeleteData'
import { useOrders } from '@/lib/redux/hooks'
import Image from 'next/image'
import Swal from 'sweetalert2'

interface UserData {
  _id: string
  name: string
  email: string
  image: string | null
  role: 'user' | 'admin'
  provider: 'credentials' | 'google'
  createdAt: string
  updatedAt: string
}

interface Order {
  _id: string
  email: string
  total_amount: number
  status: string
  order_date: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

const Customer = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)

  // Fetch users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetData<ApiResponse<UserData[]>>(
    'users',
    '/api/users'
  )

  // Get orders from Redux store (already fetched in admin page)
  const { orders: reduxOrders } = useOrders()

  // Update user mutation
  const updateUser = useUpdateData<UserData>('users', '/api/users')

  // Delete user mutation
  const deleteUser = useDeleteData<UserData>('users', '/api/users')

  const users = usersData?.data || []
  const orders = reduxOrders || []

  // Calculate customer stats from orders
  const getCustomerStats = (email: string) => {
    const customerOrders = orders.filter(order => order.email === email)
    const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const orderCount = customerOrders.length
    const lastOrder = customerOrders[0]?.order_date || null

    return { orderCount, totalSpent, lastOrder }
  }

  // Filter customers
  const filteredCustomers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Toggle user role
  const handleToggleRole = async (user: UserData) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    try {
      await updateUser.mutateAsync({
        id: user._id,
        data: { role: newRole }
      })
      
      // Update selected user if it's the one being updated
      if (selectedUser?._id === user._id) {
        setSelectedUser({ ...selectedUser, role: newRole })
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Role Updated!',
        text: `${user.name} is now ${newRole === 'admin' ? 'an Admin' : 'a User'}`,
        confirmButtonColor: '#111827',
        timer: 2500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Error updating role:', error)
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update user role. Please try again.',
        confirmButtonColor: '#111827'
      })
    }
  }

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      await deleteUser.mutateAsync(userToDelete._id)
      
      setShowDeleteModal(false)
      if (selectedUser?._id === userToDelete._id) {
        setSelectedUser(null)
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${userToDelete.name} has been deleted successfully.`,
        confirmButtonColor: '#111827',
        timer: 2500,
        timerProgressBar: true
      })
      
      setUserToDelete(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete user. Please try again.',
        confirmButtonColor: '#111827'
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD')}`
  }

  // Get initials
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
  }

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (usersError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <UserX className="w-12 h-12 mb-2" />
        <p>Failed to load customers</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-600 mt-1">
            {users.length} total customers • {users.filter(u => u.role === 'admin').length} admins
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        />
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <UserX className="w-12 h-12 mb-2" />
          <p>No customers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => {
            const stats = getCustomerStats(customer.email)
            
            return (
              <div 
                key={customer._id} 
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {customer.image ? (
                      <Image
                        src={customer.image}
                        alt={customer.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                        {getInitials(customer.name)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          customer.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {customer.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {customer.role}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          customer.provider === 'google' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {customer.provider}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setSelectedUser(customer)}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setUserToDelete(customer)
                        setShowDeleteModal(true)
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(customer.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Orders</p>
                    <p className="text-lg font-bold text-gray-900">{stats.orderCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Order</p>
                    <p className="text-xs font-medium text-gray-900">
                      {stats.lastOrder ? formatDate(stats.lastOrder) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              {selectedUser.image ? (
                <Image
                  src={selectedUser.image}
                  alt={selectedUser.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {getInitials(selectedUser.name)}
                </div>
              )}
              <h4 className="text-xl font-bold text-gray-900">{selectedUser.name}</h4>
              <p className="text-gray-600">{selectedUser.email}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Role</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedUser.role === 'admin' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {selectedUser.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Provider</span>
                <span className="font-medium capitalize">{selectedUser.provider}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Joined</span>
                <span className="font-medium">{formatDate(selectedUser.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">{formatDate(selectedUser.updatedAt)}</span>
              </div>
              
              {/* Order Stats */}
              {(() => {
                const stats = getCustomerStats(selectedUser.email)
                return (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Total Orders
                      </span>
                      <span className="font-bold text-orange-600">{stats.orderCount}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="font-bold text-green-600">{formatCurrency(stats.totalSpent)}</span>
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleToggleRole(selectedUser)}
                disabled={updateUser.isPending}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  selectedUser.role === 'admin'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                }`}
              >
                {updateUser.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    {selectedUser.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setUserToDelete(selectedUser)
                  setShowDeleteModal(true)
                }}
                className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Customer?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleteUser.isPending}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {deleteUser.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customer