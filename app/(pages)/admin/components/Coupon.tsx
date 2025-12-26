'use client'

import React, { useState, useEffect } from 'react'
import { Percent, Copy, Plus, Edit2, Trash2, X, Loader2, Tag } from 'lucide-react'
import Swal from 'sweetalert2'

interface CouponData {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchase: number
  maxDiscount: number | null
  usageLimit: number
  usedCount: number
  expiryDate: string
  isActive: boolean
  createdAt: string
}

interface CouponFormData {
  code: string
  discountType: 'percentage' | 'fixed'
  discount: string
  minPurchase: string
  maxDiscount: string
  usageLimit: string
  expiryDate: string
  isActive: boolean
}

const initialFormData: CouponFormData = {
  code: '',
  discountType: 'percentage',
  discount: '',
  minPurchase: '',
  maxDiscount: '',
  usageLimit: '100',
  expiryDate: '',
  isActive: true
}

const Coupon = () => {
  const [coupons, setCoupons] = useState<CouponData[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null)
  const [formData, setFormData] = useState<CouponFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch coupons from API
  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons')
      if (!response.ok) throw new Error('Failed to fetch coupons')
      
      const data = await response.json()
      setCoupons(data.data || [])
    } catch (err) {
      console.error('Error fetching coupons:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load coupons',
        confirmButtonColor: '#111827'
      })
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format date for input
  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0]
  }

  // Check if coupon is expired
  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  // Get status
  const getStatus = (coupon: CouponData) => {
    if (!coupon.isActive) return 'Inactive'
    if (isExpired(coupon.expiryDate)) return 'Expired'
    if (coupon.usedCount >= coupon.usageLimit) return 'Exhausted'
    return 'Active'
  }

  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700'
      case 'Expired':
        return 'bg-red-100 text-red-700'
      case 'Exhausted':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Format discount display
  const formatDiscount = (coupon: CouponData) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`
    }
    return `৳${coupon.discountValue.toLocaleString()}`
  }

  // Copy coupon code
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: `Coupon code "${code}" copied to clipboard`,
      confirmButtonColor: '#111827',
      timer: 1500,
      timerProgressBar: true,
      toast: true,
      position: 'top-end',
      showConfirmButton: false
    })
  }

  // Open modal for adding new coupon
  const handleAddNew = () => {
    setEditingCoupon(null)
    setFormData(initialFormData)
    setIsModalOpen(true)
  }

  // Open modal for editing coupon
  const handleEdit = (coupon: CouponData) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discount: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit.toString(),
      expiryDate: formatDateForInput(coupon.expiryDate),
      isActive: coupon.isActive
    })
    setIsModalOpen(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCoupon(null)
    setFormData(initialFormData)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.code.trim()) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Coupon code is required', confirmButtonColor: '#111827' })
      return
    }
    if (!formData.discount || parseFloat(formData.discount) <= 0) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Valid discount value is required', confirmButtonColor: '#111827' })
      return
    }
    if (!formData.expiryDate) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Expiry date is required', confirmButtonColor: '#111827' })
      return
    }

    setIsSubmitting(true)

    try {
      if (editingCoupon) {
        // Update existing coupon
        const response = await fetch(`/api/coupons/${editingCoupon._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update coupon')
        }

        const data = await response.json()
        setCoupons(prev => prev.map(c => c._id === editingCoupon._id ? data.data : c))

        Swal.fire({
          icon: 'success',
          title: 'Coupon Updated!',
          text: `"${formData.code}" has been updated successfully.`,
          confirmButtonColor: '#111827',
          timer: 2000,
          timerProgressBar: true
        })
      } else {
        // Create new coupon
        const response = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create coupon')
        }

        const data = await response.json()
        setCoupons(prev => [data.data, ...prev])

        Swal.fire({
          icon: 'success',
          title: 'Coupon Created!',
          text: `"${formData.code}" has been created successfully.`,
          confirmButtonColor: '#111827',
          timer: 2000,
          timerProgressBar: true
        })
      }

      handleCloseModal()
    } catch (err) {
      console.error('Submit error:', err)
      Swal.fire({
        icon: 'error',
        title: editingCoupon ? 'Update Failed' : 'Create Failed',
        text: err instanceof Error ? err.message : 'Something went wrong',
        confirmButtonColor: '#111827'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (coupon: CouponData) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Coupon?',
      text: `Are you sure you want to delete "${coupon.code}"? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`/api/coupons/${coupon._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete coupon')
      }

      setCoupons(prev => prev.filter(c => c._id !== coupon._id))

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `"${coupon.code}" has been deleted successfully.`,
        confirmButtonColor: '#111827',
        timer: 2000,
        timerProgressBar: true
      })
    } catch (err) {
      console.error('Delete error:', err)
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err instanceof Error ? err.message : 'Failed to delete coupon',
        confirmButtonColor: '#111827'
      })
    }
  }

  // Toggle coupon status
  const handleToggleStatus = async (coupon: CouponData) => {
    try {
      const response = await fetch(`/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive })
      })

      if (!response.ok) throw new Error('Failed to update status')

      const data = await response.json()
      setCoupons(prev => prev.map(c => c._id === coupon._id ? data.data : c))

      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        text: `Coupon is now ${!coupon.isActive ? 'active' : 'inactive'}`,
        confirmButtonColor: '#111827',
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      })
    } catch (err) {
      console.error('Toggle error:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update coupon status',
        confirmButtonColor: '#111827'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
          <p className="text-sm text-gray-500">Manage promotional discount codes ({coupons.length} total)</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Tag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No coupons yet. Create your first coupon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {coupons.map((coupon) => {
            const status = getStatus(coupon)
            return (
              <div key={coupon._id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Percent className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-gray-900">{coupon.code}</span>
                        <button 
                          onClick={() => handleCopy(coupon.code)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{formatDiscount(coupon)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(coupon)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${getStatusStyle(status)}`}
                      title="Click to toggle status"
                    >
                      {status}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(coupon)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Min Purchase</span>
                    <span className="font-medium text-gray-900">৳{coupon.minPurchase.toLocaleString()}</span>
                  </div>
                  {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Max Discount</span>
                      <span className="font-medium text-gray-900">৳{coupon.maxDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Usage</span>
                    <span className="font-medium text-gray-900">{coupon.usedCount} / {coupon.usageLimit}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-gray-900 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Expiry Date</span>
                    <span className={`font-medium ${isExpired(coupon.expiryDate) ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(coupon.expiryDate)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono uppercase"
                  placeholder="e.g., SUMMER20"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
                  <input
                    type="number"
                    min="0"
                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                  />
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Purchase (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData(prev => ({ ...prev, minPurchase: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="e.g., 1000"
                  />
                </div>
                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="e.g., 500"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limit & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Coupon is active
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Coupon