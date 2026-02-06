'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { 
  Settings as SettingsIcon, 
  Truck, 
  Loader2,
  DollarSign,
  Package,
  CheckCircle,
  ImageIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  Link as LinkIcon,
  GripVertical,
  Eye,
  EyeOff,
  Percent,
  Search,
  Megaphone
} from 'lucide-react'
import Swal from 'sweetalert2'

interface ShippingSettings {
  standardFee: number
  freeShippingThreshold: number
  expressShippingFee: number
  enableFreeShipping: boolean
}

interface TopBannerSettings {
  message: string
  enabled: boolean
  backgroundColor: string
  textColor: string
}

interface SiteSettings {
  _id?: string
  shipping: ShippingSettings
  general: {
    siteName: string
    currency: string
    currencySymbol: string
  }
  topBanner?: TopBannerSettings
}

interface HeroSlide {
  _id: string
  image: string
  link: string
  alt: string
  type: 'main' | 'side'
  order: number
  active: boolean
}

interface Product {
  _id: string
  name: string
  price: number
  originalPrice: number
  image: string
  category: string
  stock: number
  specialDiscount?: boolean
}

interface GalleryImage {
  _id: string
  image: string
  caption: string
  order: number
}

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Hero Slides State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [slidesLoading, setSlidesLoading] = useState(true)
  const [showSlideModal, setShowSlideModal] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [slideForm, setSlideForm] = useState({
    image: '',
    link: '/allProducts',
    alt: '',
    type: 'main' as 'main' | 'side'
  })

  // Special Discount Products State
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productSearch, setProductSearch] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Review Gallery State
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false)
  const [newGalleryCaption, setNewGalleryCaption] = useState('')

  // Auto-save debounce ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
    fetchHeroSlides()
    fetchProducts()
    fetchGalleryImages()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      if (Array.isArray(data)) {
        // Only show products that have a discount (originalPrice > price)
        const discountedProducts = data.filter((p: Product) => 
          p.originalPrice && p.price && p.originalPrice > p.price
        )
        setAllProducts(discountedProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setProductsLoading(false)
    }
  }

  const handleToggleSpecialDiscount = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialDiscount: !product.specialDiscount })
      })
      const data = await response.json()
      if (data.success) {
        setAllProducts(prev => prev.map(p => 
          p._id === product._id ? { ...p, specialDiscount: !p.specialDiscount } : p
        ))
        Swal.fire({
          icon: 'success',
          title: product.specialDiscount ? 'Removed from Special Discounts' : 'Added to Special Discounts',
          timer: 1500,
          showConfirmButton: false
        })
      }
    } catch (error) {
      console.error('Error updating product:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update product' })
    }
  }

  // Filter products by search
  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  )

  // Get special discount products
  const specialDiscountProducts = allProducts.filter(p => p.specialDiscount)

  // Fetch gallery images
  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('/api/review-gallery')
      const data = await response.json()
      if (data.success) {
        setGalleryImages(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setGalleryLoading(false)
    }
  }

  // Handle gallery image upload
  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'Invalid File', text: 'Please upload an image file' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'File Too Large', text: 'Image must be less than 5MB' })
      return
    }

    setUploadingGalleryImage(true)
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string

        // Upload to API
        const response = await fetch('/api/review-gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            image: base64, 
            caption: newGalleryCaption 
          })
        })

        const data = await response.json()
        if (data.success) {
          setGalleryImages(prev => [...prev, data.data])
          setNewGalleryCaption('')
          Swal.fire({
            icon: 'success',
            title: 'Image Added',
            timer: 1500,
            showConfirmButton: false
          })
        } else {
          throw new Error(data.error)
        }
        setUploadingGalleryImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading gallery image:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to upload image' })
      setUploadingGalleryImage(false)
    }

    // Reset input
    e.target.value = ''
  }

  // Delete gallery image
  const handleDeleteGalleryImage = async (imageId: string) => {
    const result = await Swal.fire({
      title: 'Delete Image?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete'
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`/api/review-gallery?id=${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        setGalleryImages(prev => prev.filter(img => img._id !== imageId))
        Swal.fire({
          icon: 'success',
          title: 'Image Deleted',
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error deleting gallery image:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete image' })
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load settings'
      })
    } finally {
      setLoading(false)
    }
  }

  // Auto-save function
  const autoSaveSettings = useCallback(async (settingsToSave: SiteSettings) => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settingsToSave)
      })
      
      const data = await response.json()
     // console.log('Settings save response:', { status: response.status, data })
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to update settings (${response.status})`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to save settings'
      })
    } finally {
      setSaving(false)
    }
  }, [])

  const updateShipping = (field: keyof ShippingSettings, value: number | boolean) => {
    if (!settings) return
    
    const newSettings = {
      ...settings,
      shipping: {
        ...settings.shipping,
        [field]: value
      }
    }
    setSettings(newSettings)
    
    // Debounced auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSaveSettings(newSettings)
    }, 500) // Save after 500ms of no changes
  }

  const updateTopBanner = (field: keyof TopBannerSettings, value: string | boolean, shouldSave: boolean = true) => {
    if (!settings) return
    
    const currentBanner = settings.topBanner || {
      message: '',
      enabled: false,
      backgroundColor: '#1f2937',
      textColor: '#ffffff'
    }
    
    const newSettings = {
      ...settings,
      topBanner: {
        ...currentBanner,
        [field]: value
      }
    }
    setSettings(newSettings)
    
    // Only save if shouldSave is true (skip during continuous color picking)
    if (shouldSave) {
      // Debounced auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        autoSaveSettings(newSettings)
      }, 500)
    }
  }
  
  // Save current settings immediately (used when color picker closes)
  const saveCurrentSettings = () => {
    if (settings) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      autoSaveSettings(settings)
    }
  }

  // Hero Slides Functions
  const fetchHeroSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides')
      const data = await response.json()
      if (data.success) {
        setHeroSlides(data.data)
      }
    } catch (error) {
      console.error('Error fetching hero slides:', error)
    } finally {
      setSlidesLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        { method: 'POST', body: formData }
      )
      
      const data = await response.json()
      if (data.success) {
        setSlideForm(prev => ({ ...prev, image: data.data.url }))
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload image. Please try again.'
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const openAddSlideModal = (type: 'main' | 'side') => {
    setEditingSlide(null)
    setSlideForm({ image: '', link: '/allProducts', alt: '', type })
    setShowSlideModal(true)
  }

  const openEditSlideModal = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setSlideForm({
      image: slide.image,
      link: slide.link,
      alt: slide.alt,
      type: slide.type
    })
    setShowSlideModal(true)
  }

  const handleSaveSlide = async () => {
    if (!slideForm.image) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please upload an image' })
      return
    }

    try {
      if (editingSlide) {
        // Update existing slide
        const response = await fetch(`/api/hero-slides/${editingSlide._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slideForm)
        })
        const data = await response.json()
        if (data.success) {
          setHeroSlides(prev => prev.map(s => s._id === editingSlide._id ? data.data : s))
          Swal.fire({ icon: 'success', title: 'Updated!', timer: 1500, showConfirmButton: false })
        }
      } else {
        // Add new slide
        const response = await fetch('/api/hero-slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slideForm)
        })
        const data = await response.json()
        if (data.success) {
          setHeroSlides(prev => [...prev, data.data])
          Swal.fire({ icon: 'success', title: 'Added!', timer: 1500, showConfirmButton: false })
        }
      }
      setShowSlideModal(false)
    } catch (error) {
      console.error('Error saving slide:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save slide' })
    }
  }

  const handleDeleteSlide = async (slideId: string) => {
    const result = await Swal.fire({
      title: 'Delete Slide?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Delete'
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/hero-slides/${slideId}`, { method: 'DELETE' })
        const data = await response.json()
        if (data.success) {
          setHeroSlides(prev => prev.filter(s => s._id !== slideId))
          Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false })
        }
      } catch (error) {
        console.error('Error deleting slide:', error)
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete slide' })
      }
    }
  }

  const handleToggleSlideActive = async (slide: HeroSlide) => {
    try {
      const response = await fetch(`/api/hero-slides/${slide._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !slide.active })
      })
      const data = await response.json()
      if (data.success) {
        setHeroSlides(prev => prev.map(s => s._id === slide._id ? data.data : s))
      }
    } catch (error) {
      console.error('Error toggling slide:', error)
    }
  }

  const mainSlides = heroSlides.filter(s => s.type === 'main')
  const sideSlides = heroSlides.filter(s => s.type === 'side')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">Manage your store settings</p>
          </div>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        )}
      </div>

      {/* Shipping Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Shipping Settings</h3>
              <p className="text-sm text-gray-500">Configure shipping fees and thresholds</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Standard Shipping Fee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Shipping Fee (৳)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={settings.shipping.standardFee}
                  onChange={(e) => updateShipping('standardFee', Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                  placeholder="100"
                  min="0"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Default shipping fee for all orders
              </p>
            </div>

            {/* Express Shipping Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Express Shipping Fee (৳)
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={settings.shipping.expressShippingFee}
                  onChange={(e) => updateShipping('expressShippingFee', Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                  placeholder="200"
                  min="0"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Fee for express/priority delivery
              </p>
            </div>
          </div>

          {/* Free Shipping Toggle */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Enable Free Shipping</p>
                  <p className="text-sm text-gray-500">
                    Offer free shipping for orders above threshold
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shipping.enableFreeShipping}
                  onChange={(e) => updateShipping('enableFreeShipping', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-900/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          {/* Free Shipping Threshold */}
          {settings.shipping.enableFreeShipping && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Shipping Threshold (৳)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={settings.shipping.freeShippingThreshold}
                  onChange={(e) => updateShipping('freeShippingThreshold', Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                  placeholder="5000"
                  min="0"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Orders above this amount will get free shipping
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-2">Shipping Preview</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• Standard shipping: <strong>৳{settings.shipping.standardFee.toLocaleString('en-BD')}</strong></p>
              <p>• Express shipping: <strong>৳{settings.shipping.expressShippingFee.toLocaleString('en-BD')}</strong></p>
              {settings.shipping.enableFreeShipping && (
                <p>• Free shipping on orders over: <strong>৳{settings.shipping.freeShippingThreshold.toLocaleString('en-BD')}</strong></p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Banner</h3>
              <p className="text-sm text-gray-500">Display announcement banner at the top of your site</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable Banner Toggle */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Enable Top Banner</p>
                  <p className="text-sm text-gray-500">
                    Show announcement banner on all pages
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.topBanner?.enabled || false}
                  onChange={(e) => updateTopBanner('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-900/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>

          {/* Banner Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Message
            </label>
            <textarea
              value={settings.topBanner?.message || ''}
              onChange={(e) => updateTopBanner('message', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 resize-none"
              placeholder="🎉 Special offer! Get 20% off on all products. Use code: SAVE20"
              rows={2}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Long messages will automatically scroll horizontally
            </p>
          </div>

          {/* Color Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.topBanner?.backgroundColor || '#1f2937'}
                  onChange={(e) => updateTopBanner('backgroundColor', e.target.value, false)}
                  onBlur={saveCurrentSettings}
                  onMouseUp={saveCurrentSettings}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.topBanner?.backgroundColor || '#1f2937'}
                  onChange={(e) => updateTopBanner('backgroundColor', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 font-mono text-sm"
                  placeholder="#1f2937"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.topBanner?.textColor || '#ffffff'}
                  onChange={(e) => updateTopBanner('textColor', e.target.value, false)}
                  onBlur={saveCurrentSettings}
                  onMouseUp={saveCurrentSettings}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.topBanner?.textColor || '#ffffff'}
                  onChange={(e) => updateTopBanner('textColor', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 font-mono text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {settings.topBanner?.message && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
              <div
                className="py-2 px-4 text-center text-sm font-medium rounded-xl"
                style={{
                  backgroundColor: settings.topBanner?.backgroundColor || '#1f2937',
                  color: settings.topBanner?.textColor || '#ffffff',
                }}
              >
                {settings.topBanner.message}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero Slides Management */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hero Slides</h3>
              <p className="text-sm text-gray-500">Manage homepage carousel and banner images</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {slidesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Main Carousel Slides */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Main Carousel Slides</h4>
                  <button
                    onClick={() => openAddSlideModal('main')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Slide
                  </button>
                </div>
                
                {mainSlides.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No main slides yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mainSlides.map((slide) => (
                      <div key={slide._id} className="relative group rounded-xl overflow-hidden border border-gray-200">
                        <div className="relative h-32">
                          <Image
                            src={slide.image}
                            alt={slide.alt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                          {!slide.active && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Inactive</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs text-gray-500 truncate">{slide.alt || 'No description'}</p>
                          <p className="text-xs text-blue-600 truncate">{slide.link}</p>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleSlideActive(slide)}
                            className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-100"
                            title={slide.active ? 'Hide' : 'Show'}
                          >
                            {slide.active ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                          </button>
                          <button
                            onClick={() => openEditSlideModal(slide)}
                            className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-100"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlide(slide._id)}
                            className="p-1.5 bg-white rounded-lg shadow hover:bg-gray-100"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Side Banner Slides */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-sky-500" />
                    <h4 className="font-medium text-gray-900">Special Discount Products</h4>
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                      {specialDiscountProducts.length} selected
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  Select discounted products to feature in the Special Discounts section on the homepage.
                </p>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                {/* Selected Products */}
                {specialDiscountProducts.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Currently Featured</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {specialDiscountProducts.map((product) => {
                        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        return (
                          <div key={product._id} className="relative bg-sky-50 border-2 border-sky-200 rounded-xl p-2">
                            <div className="relative h-16 rounded-lg overflow-hidden mb-2">
                              <Image src={product.image} alt={product.name} fill sizes="100px" className="object-cover" />
                              <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded">
                                -{discount}%
                              </div>
                            </div>
                            <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-sky-600 font-bold">৳{product.price.toLocaleString()}</p>
                            <button
                              onClick={() => handleToggleSpecialDiscount(product)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600"
                              title="Remove from special discounts"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Available Products */}
                {productsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Percent className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No discounted products found</p>
                    <p className="text-gray-400 text-xs mt-1">Products need to have original price higher than sale price</p>
                  </div>
                ) : (
                  <>
                    <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Available Discounted Products</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
                      {filteredProducts.filter(p => !p.specialDiscount).map((product) => {
                        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        return (
                          <div 
                            key={product._id} 
                            className="flex items-center gap-3 p-2 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors cursor-pointer"
                            onClick={() => handleToggleSpecialDiscount(product)}
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                              <div className="absolute top-0 left-0 bg-red-500 text-white text-[8px] font-bold px-1 rounded-br">
                                -{discount}%
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.name}</p>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-sky-600">৳{product.price.toLocaleString()}</span>
                                <span className="text-[10px] text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
                              </div>
                            </div>
                            <Plus className="w-5 h-5 text-sky-500 flex-shrink-0" />
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Review Gallery Management */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Review Gallery</h3>
              <p className="text-sm text-gray-500">Add screenshots of customer reviews for the satisfaction section</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload New Image */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex-1 w-full">
                <div className="flex items-center justify-center gap-3 py-4 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
                  {uploadingGalleryImage ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                      <span className="text-gray-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-sky-500" />
                      <span className="text-gray-600">Click to upload review screenshot</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryImageUpload}
                  className="hidden"
                  disabled={uploadingGalleryImage}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Max 5MB per image • PNG, JPG, JPEG</p>
          </div>

          {/* Gallery Grid */}
          {galleryLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No review screenshots yet</p>
              <p className="text-xs text-gray-400">Upload customer review screenshots to display in the gallery</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {galleryImages.map((img, index) => (
                <div key={img._id} className="relative group">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                    <Image
                      src={img.image}
                      alt={img.caption || `Review ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover"
                    />
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteGalleryImage(img._id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {/* Order Badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-xs font-bold text-gray-700">
                    {index + 1}
                  </div>
                  {img.caption && (
                    <p className="mt-2 text-xs text-gray-600 line-clamp-1">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
            💡 <strong>Tip:</strong> Add screenshots of positive customer reviews from Facebook, Instagram, or other platforms to build trust with new customers.
          </p>
        </div>
      </div>

      {/* Slide Modal */}
      {showSlideModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSlide ? 'Edit Slide' : `Add ${slideForm.type === 'main' ? 'Carousel Slide' : 'Side Banner'}`}
              </h3>
              <button onClick={() => setShowSlideModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                {slideForm.image ? (
                  <div className="relative h-40 rounded-xl overflow-hidden border border-gray-200">
                    <Image src={slideForm.image} alt="Preview" fill sizes="400px" className="object-cover" />
                    <button
                      onClick={() => setSlideForm(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
                    {uploadingImage ? (
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={slideForm.link}
                    onChange={(e) => setSlideForm(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    placeholder="/allProducts or https://..."
                  />
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Alt Text)</label>
                <input
                  type="text"
                  value={slideForm.alt}
                  onChange={(e) => setSlideForm(prev => ({ ...prev, alt: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  placeholder="Describe this banner..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowSlideModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSlide}
                disabled={!slideForm.image}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300"
              >
                {editingSlide ? 'Update' : 'Add'} Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
