'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingCart,
  Tag,
  Truck,
  Shield,
  ChevronRight,
  X,
  Gift,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { removeFromCart, updateQuantity, clearCart, CartItem } from '@/lib/redux/slices/cartSlice'
import Swal from 'sweetalert2'

export default function CartPage() {
  const dispatch = useAppDispatch()
  const { items, totalItems, totalPrice } = useAppSelector((state) => state.cart)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Calculate values
  const subtotal = totalPrice
  const shipping = subtotal > 100 ? 0 : 9.99
  const discount = couponApplied ? (subtotal * couponDiscount) / 100 : 0
  const total = subtotal + shipping - discount

  // Handle quantity change
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(id)
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }))
    }
  }

  // Handle remove item
  const handleRemoveItem = (id: string) => {
    Swal.fire({
      title: 'Remove Item?',
      text: 'Are you sure you want to remove this item from your cart?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeFromCart(id))
        Swal.fire({
          icon: 'success',
          title: 'Item Removed',
          showConfirmButton: false,
          timer: 1000
        })
      }
    })
  }

  // Handle clear cart
  const handleClearCart = () => {
    Swal.fire({
      title: 'Clear Cart?',
      text: 'This will remove all items from your cart.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, clear all'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearCart())
        Swal.fire({
          icon: 'success',
          title: 'Cart Cleared',
          showConfirmButton: false,
          timer: 1000
        })
      }
    })
  }

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setIsApplyingCoupon(true)
    setCouponError('')

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock coupon validation
      if (couponCode.toUpperCase() === 'SAVE10') {
        setCouponApplied(true)
        setCouponDiscount(10)
        Swal.fire({
          icon: 'success',
          title: 'Coupon Applied!',
          text: 'You saved 10% on your order',
          showConfirmButton: false,
          timer: 1500
        })
      } else if (couponCode.toUpperCase() === 'SAVE20') {
        setCouponApplied(true)
        setCouponDiscount(20)
        Swal.fire({
          icon: 'success',
          title: 'Coupon Applied!',
          text: 'You saved 20% on your order',
          showConfirmButton: false,
          timer: 1500
        })
      } else {
        setCouponError('Invalid coupon code')
      }
    } catch {
      setCouponError('Failed to apply coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCouponApplied(false)
    setCouponDiscount(0)
    setCouponCode('')
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Empty Cart Illustration */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full opacity-20 animate-pulse" />
              <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                <ShoppingCart className="w-20 h-20 text-gray-300" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added anything to your cart yet. Start shopping to fill it up!
            </p>

            <Link
              href="/allProducts"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
                { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
                { icon: Gift, title: 'Special Offers', desc: 'Exclusive discounts' },
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            <AnimatePresence>
              {items.map((item: CartItem, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg truncate">{item.name}</h3>
                          <p className="text-gray-500 text-sm mt-1">SKU: {item.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">Qty:</span>
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                          <p className="text-xl font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link
              href="/allProducts"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors py-4"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Continue Shopping
            </Link>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Promo Code</label>
                {couponApplied ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">{couponCode.toUpperCase()}</span>
                      <span className="text-green-600 text-sm">(-{couponDiscount}%)</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value)
                          setCouponError('')
                        }}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Tag className="w-4 h-4" />
                        )}
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {couponError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    Shipping
                    {shipping === 0 && (
                      <span className="text-xs text-green-600 font-medium">(Free)</span>
                    )}
                  </span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({couponDiscount}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-lg"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4 text-gray-400">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Secure Checkout</span>
                </div>
                <div className="flex items-center justify-center gap-3 mt-4">
                  {['Visa', 'MC', 'Amex', 'PayPal'].map((card) => (
                    <div key={card} className="px-3 py-1 bg-gray-50 rounded text-xs font-medium text-gray-500">
                      {card}
                    </div>
                  ))}
                </div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 100 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Add ${(100 - subtotal).toFixed(2)} more for FREE shipping!
                    </span>
                  </div>
                  <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
