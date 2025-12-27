'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  X,
  Share2,
  ShoppingBag,
  Sparkles,
  Clock,
  Tag,
  Check,
  Filter,
  Grid3X3,
  List
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { removeFromWishlist, clearWishlist, WishlistItem } from '@/lib/redux/slices/wishlistSlice'
import { addToCart } from '@/lib/redux/slices/cartSlice'
import Swal from 'sweetalert2'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name'

export default function WishlistClient() {
  const dispatch = useAppDispatch()
  const { items, totalItems } = useAppSelector((state) => state.wishlist)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      case 'oldest':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  // Handle remove item
  const handleRemoveItem = (id: string, name: string) => {
    Swal.fire({
      title: 'Remove from Wishlist?',
      text: `Remove "${name}" from your wishlist?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeFromWishlist(id))
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          showConfirmButton: false,
          timer: 1000
        })
      }
    })
  }

  // Handle add to cart
  const handleAddToCart = (item: WishlistItem) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    }))
    
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart!',
      text: `${item.name} has been added to your cart`,
      showConfirmButton: false,
      timer: 1500
    })
  }

  // Handle move all to cart
  const handleMoveAllToCart = () => {
    Swal.fire({
      title: 'Move All to Cart?',
      text: 'Add all wishlist items to your cart?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, add all'
    }).then((result) => {
      if (result.isConfirmed) {
        items.forEach(item => {
          dispatch(addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
          }))
        })
        Swal.fire({
          icon: 'success',
          title: 'All Items Added!',
          text: `${items.length} items added to your cart`,
          showConfirmButton: false,
          timer: 1500
        })
      }
    })
  }

  // Handle clear wishlist
  const handleClearWishlist = () => {
    Swal.fire({
      title: 'Clear Wishlist?',
      text: 'This will remove all items from your wishlist.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, clear all'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearWishlist())
        Swal.fire({
          icon: 'success',
          title: 'Wishlist Cleared',
          showConfirmButton: false,
          timer: 1000
        })
      }
    })
  }

  // Handle share wishlist
  const handleShareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: `Check out my wishlist with ${totalItems} items!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      Swal.fire({
        icon: 'success',
        title: 'Link Copied!',
        text: 'Wishlist link copied to clipboard',
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Empty wishlist state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Empty Wishlist Illustration */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-rose-300 rounded-full opacity-20 animate-pulse" />
              <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Heart className="w-20 h-20 text-pink-200" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Wishlist is Empty</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start adding items you love to your wishlist. They&apos;ll be saved here for later!
            </p>

            <Link
              href="/allProducts"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              <Sparkles className="w-5 h-5" />
              Discover Products
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
              {[
                { icon: Heart, title: 'Save Favorites', desc: 'Keep track of items you love' },
                { icon: Tag, title: 'Price Alerts', desc: 'Get notified on price drops' },
                { icon: ShoppingCart, title: 'Quick Checkout', desc: 'Move to cart anytime' },
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
                    <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-pink-500" />
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
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                  <p className="text-gray-500">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} saved
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShareWishlist}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleMoveAllToCart}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Add All to Cart
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-4">
              {/* View Mode */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleClearWishlist}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </motion.div>

        {/* Wishlist Items */}
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {sortedItems.map((item: WishlistItem, index: number) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <X className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>

                    {/* Stock Badge */}
                    {item.inStock === false && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {item.category && (
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{item.category}</p>
                    )}
                    <h3 className="font-semibold text-gray-900 truncate mb-2">{item.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <>
                          <span className="text-sm text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                      <Clock className="w-3 h-3" />
                      Added {formatDate(item.addedAt)}
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.inStock === false}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="space-y-4">
              {sortedItems.map((item: WishlistItem, index: number) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Image */}
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
                      {item.inStock === false && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {item.category && (
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{item.category}</p>
                          )}
                          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                            <Clock className="w-3 h-3" />
                            Added {formatDate(item.addedAt)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <>
                              <span className="text-sm text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={item.inStock === false}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="hidden sm:inline">Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-sm">Total Wishlist Value</p>
              <p className="text-3xl font-bold text-white">
                ${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span className="text-sm">{items.filter(i => i.inStock !== false).length} items in stock</span>
              </div>
              <button
                onClick={handleMoveAllToCart}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                <ShoppingCart className="w-5 h-5" />
                Add All to Cart
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
