'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Check, 
  ChevronLeft,
  ChevronRight,
  Share2,
  Package,
  Loader2,
  AlertCircle,
  Star,
  User
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useProductById } from '@/lib/redux/hooks'
import { addToCart } from '@/lib/redux/slices/cartSlice'
import { toggleWishlist } from '@/lib/redux/slices/wishlistSlice'
import Swal from 'sweetalert2'

interface ProductDetailsClientProps {
  productId: string
}

const ProductDetailsClient = ({ productId }: ProductDetailsClientProps) => {
  const { product, loading, error } = useProductById(productId)
  
  const dispatch = useAppDispatch()
  const wishlistItems = useAppSelector((state) => state.wishlist.items)
  const cartItems = useAppSelector((state) => state.cart.items)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Review interfaces
  interface Review {
    _id: string
    productId: string
    userId: string
    userName: string
    userImage?: string
    rating: number
    title: string
    comment: string
    images?: string[]
    createdAt: string
  }

  interface ReviewStats {
    total: number
    averageRating: number
    ratingBreakdown: { 1: number; 2: number; 3: number; 4: number; 5: number }
  }

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return
      try {
        setLoadingReviews(true)
        const response = await fetch(`/api/reviews/${productId}`)
        const data = await response.json()
        if (data.success) {
          setReviews(data.data)
          setReviewStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [productId])

  // Check if product is in wishlist/cart
  const isInWishlist = useMemo(() => 
    wishlistItems.some(item => item.id === productId), 
    [wishlistItems, productId]
  )
  
  const isInCart = useMemo(() => 
    cartItems.some(item => item.id === productId), 
    [cartItems, productId]
  )

  // Calculate discount
  const discount = useMemo(() => {
    if (!product?.originalPrice || !product?.price) return 0
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }, [product])

  // Get all images
  const allImages = useMemo(() => {
    if (!product) return []
    const images = product.images?.length > 0 ? product.images : [product.image]
    return images.filter(Boolean)
  }, [product])

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity)
    }
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return
    
    if (product.stock === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Out of Stock',
        text: 'This product is currently out of stock.',
        confirmButtonColor: '#111827'
      })
      return
    }
    
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    }))
    
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart!',
      text: `${quantity} × ${product.name} added to your cart.`,
      confirmButtonColor: '#111827',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    })
  }

  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart()
    // Redirect to cart after a short delay
    setTimeout(() => {
      window.location.href = '/addToCart'
    }, 500)
  }

  // Handle toggle wishlist
  const handleToggleWishlist = () => {
    if (!product) return
    
    dispatch(toggleWishlist({
      id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      inStock: product.stock > 0
    }))
    
    Swal.fire({
      icon: isInWishlist ? 'info' : 'success',
      title: isInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist!',
      confirmButtonColor: '#111827',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    })
  }

  // Handle image zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  // Handle share
  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: url
        })
      } catch (err) {
       // console.log('Share cancelled', err)
      }
    } else {
      await navigator.clipboard.writeText(url)
      Swal.fire({
        icon: 'success',
        title: 'Link Copied!',
        text: 'Product link copied to clipboard.',
        confirmButtonColor: '#111827',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      })
    }
  }

  // Navigate images
  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImage(prev => (prev === 0 ? allImages.length - 1 : prev - 1))
    } else {
      setSelectedImage(prev => (prev === allImages.length - 1 ? 0 : prev + 1))
    }
  }

  // Get stock status
  const getStockStatus = () => {
    if (!product) return { text: '', color: '' }
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' }
    if (product.stock <= 5) return { text: `Only ${product.stock} left!`, color: 'text-sky-600 bg-sky-50' }
    return { text: 'In Stock', color: 'text-green-600 bg-green-50' }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading product details...</p>
        </div>
      </div>
    )
  }

  // Error or not found state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-500 mb-6">
            {!productId 
              ? 'No product ID provided. Please select a product from our catalog.'
              : 'The product you\'re looking for doesn\'t exist or has been removed.'
            }
          </p>
          <Link
            href="/allProducts"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Package className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const stockStatus = getStockStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link href="/allProducts" className="text-gray-500 hover:text-gray-900 transition-colors">
              Products
            </Link>
            <span className="text-gray-300">/</span>
            <Link 
              href={`/category/${product.category.toLowerCase()}`} 
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              {product.category}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate max-w-50">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {allImages[selectedImage] && (
                <Image
                  src={allImages[selectedImage]}
                  alt={product.name}
                  fill
                  className={`object-contain transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  style={isZoomed ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  } : undefined}
                  priority
                />
              )}
              
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
              
              {/* Badge */}
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-sky-500 text-white text-sm font-semibold rounded-full">
                  {product.badge}
                </span>
              )}
              
              {/* Discount Badge */}
              {discount > 0 && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-sky-500 ring-2 ring-sky-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Category & Share */}
            <div className="flex items-center justify-between">
              <Link 
                href={`/category/${product.category.toLowerCase()}`}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                {product.category}
              </Link>
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ৳{product.price.toLocaleString('en-BD')}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ৳{product.originalPrice.toLocaleString('en-BD')}
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                    Save ৳{(product.originalPrice - product.price).toLocaleString('en-BD')}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${stockStatus.color}`}>
              {product.stock > 0 ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {stockStatus.text}
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">
                  Color: <span className="font-normal text-gray-600">{selectedColor || 'Select a color'}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedColor === color
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock} items available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {isInCart ? 'Add More to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Buy Now
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all ${
                  isInWishlist 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Trust Badges */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Free Delivery</p>
                  <p className="text-xs text-gray-500">Orders over ৳5,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Warranty</p>
                  <p className="text-xs text-gray-500">1 Year warranty</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-500">7 days return</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100">
              <div className="flex gap-8 px-6">
                <button 
                  onClick={() => setActiveTab('description')}
                  className={`py-4 text-sm font-semibold transition-colors ${
                    activeTab === 'description' 
                      ? 'text-sky-600 border-b-2 border-sky-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Description
                </button>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 text-sm font-semibold transition-colors flex items-center gap-2 ${
                    activeTab === 'reviews' 
                      ? 'text-sky-600 border-b-2 border-sky-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews
                  {reviewStats && reviewStats.total > 0 && (
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs rounded-full">
                      {reviewStats.total}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="p-6">
              {activeTab === 'description' ? (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Product Details</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li><strong>Category:</strong> {product.category}</li>
                    <li><strong>Available Colors:</strong> {product.colors?.join(', ') || 'N/A'}</li>
                    <li><strong>Stock:</strong> {product.stock} units</li>
                    <li><strong>SKU:</strong> {product._id.slice(-8).toUpperCase()}</li>
                  </ul>
                </div>
              ) : (
                <div>
                  {/* Reviews Summary */}
                  {reviewStats && reviewStats.total > 0 && (
                    <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-100">
                      {/* Average Rating */}
                      <div className="text-center md:text-left">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {reviewStats.averageRating}
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(reviewStats.averageRating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">
                          Based on {reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Rating Breakdown */}
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviewStats.ratingBreakdown[rating as keyof typeof reviewStats.ratingBreakdown] || 0
                          const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 w-8">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  {loadingReviews ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex items-start gap-4">
                            {/* User Avatar */}
                            <div className="flex-shrink-0">
                              {review.userImage ? (
                                <Image
                                  src={review.userImage}
                                  alt={review.userName}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-sky-600" />
                                </div>
                              )}
                            </div>

                            {/* Review Content */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                                <span className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>

                              {/* Rating */}
                              <div className="flex items-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>

                              {/* Title & Comment */}
                              {review.title && (
                                <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
                              )}
                              {review.comment && (
                                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                              )}

                              {/* Review Images */}
                              {review.images && review.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {review.images.map((img, imgIndex) => (
                                    <div 
                                      key={imgIndex} 
                                      className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => window.open(img, '_blank')}
                                    >
                                      <Image
                                        src={img}
                                        alt={`Review image ${imgIndex + 1}`}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-500">Be the first to review this product after your purchase!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsClient
