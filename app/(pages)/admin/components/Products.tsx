'use client'

import React, { useState, useMemo, useRef } from 'react'
import { Search, Plus, Edit, Trash2, Eye, X, Loader2, Upload, Package, ImagePlus } from 'lucide-react'
import Image from 'next/image'
import Swal from 'sweetalert2'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useProducts, useCategories } from '@/lib/redux/hooks'
import {
  addProduct as addProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  Product
} from '@/lib/redux/slices/productsSlice'

interface ProductFormData {
  name: string
  description: string
  price: string | number
  originalPrice: string | number
  image: string
  images: string[]
  category: string
  colors: string[]
  badge: string
  stock: string | number
  featured: boolean
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  image: '',
  images: [],
  category: '',
  colors: [],
  badge: '',
  stock: '',
  featured: false
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const additionalFilesRef = useRef<HTMLInputElement>(null)

  const dispatch = useAppDispatch()
  const { products, loading, error } = useProducts()
  const { categories } = useCategories()

  // Upload image to ImgBB
  const uploadToImgBB = async (file: File): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY
    if (!apiKey) {
      Swal.fire({
        icon: 'error',
        title: 'Configuration Error',
        text: 'ImgBB API key is not configured. Please add NEXT_PUBLIC_IMAGEBB_API_KEY to your .env.local file.',
        confirmButtonColor: '#111827'
      })
      throw new Error('ImgBB API key not configured')
    }

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to upload image')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error?.message || 'ImgBB upload failed')
      }
      
      return data.data.url
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Unable to connect to ImgBB. Please check your internet connection.',
          confirmButtonColor: '#111827'
        })
      }
      throw err
    }
  }

  // Handle main image upload
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress('Uploading main image...')

    try {
      const imageUrl = await uploadToImgBB(file)
      setFormData(prev => ({ 
        ...prev, 
        image: imageUrl,
        images: [imageUrl, ...prev.images.filter(img => img !== prev.image)]
      }))
      
      Swal.fire({
        icon: 'success',
        title: 'Image Uploaded!',
        text: 'Main image uploaded successfully.',
        confirmButtonColor: '#111827',
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      })
    } catch (err) {
      console.error('Error uploading image:', err)
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err instanceof Error ? err.message : 'Failed to upload image. Please try again.',
        confirmButtonColor: '#111827'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle additional images upload
  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`)
        const imageUrl = await uploadToImgBB(files[i])
        uploadedUrls.push(imageUrl)
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
      
      Swal.fire({
        icon: 'success',
        title: 'Images Uploaded!',
        text: `${uploadedUrls.length} image(s) uploaded successfully.`,
        confirmButtonColor: '#111827',
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      })
    } catch (err) {
      console.error('Error uploading images:', err)
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err instanceof Error ? err.message : 'Failed to upload some images. Please try again.',
        confirmButtonColor: '#111827'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress('')
      if (additionalFilesRef.current) {
        additionalFilesRef.current.value = ''
      }
    }
  }

  // Remove additional image
  const removeAdditionalImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }))
  }

  // Filter products based on search term and category filter (client-side)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !categoryFilter || product.category === categoryFilter
      
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  // Format currency
  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD')}`
  }

  // Get stock status
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', style: 'bg-red-100 text-red-700' }
    if (stock <= 5) return { label: 'Low Stock', style: 'bg-yellow-100 text-yellow-700' }
    return { label: 'In Stock', style: 'bg-green-100 text-green-700' }
  }

  // Open add modal
  const openAddModal = () => {
    setEditingProduct(null)
    setFormData(initialFormData)
    setIsModalOpen(true)
  }

  // Open edit modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image,
      images: product.images || [product.image],
      category: product.category,
      colors: product.colors || [],
      badge: product.badge || '',
      stock: product.stock,
      featured: product.featured || false
    })
    setIsModalOpen(true)
  }

  // Open view modal
  const openViewModal = (product: Product) => {
    setViewingProduct(product)
    setIsViewModalOpen(true)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required numeric fields
    if (!formData.price || formData.price === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a price for the product.',
        confirmButtonColor: '#111827'
      })
      return
    }
    
    if (formData.stock === '' || formData.stock === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter stock quantity.',
        confirmButtonColor: '#111827'
      })
      return
    }
    
    setIsSubmitting(true)

    try {
      // Convert string values to numbers for submission
      const productData = {
        ...formData,
        price: Number(formData.price) || 0,
        originalPrice: Number(formData.originalPrice) || Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        images: formData.image ? [formData.image, ...formData.images.filter(img => img !== formData.image)] : formData.images
      }

      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update product')
        }
        
        await response.json()
        dispatch(updateProductAction({ 
          ...editingProduct, 
          ...productData, 
          updatedAt: new Date().toISOString() 
        }))
        
        Swal.fire({
          icon: 'success',
          title: 'Product Updated!',
          text: `"${formData.name}" has been updated successfully.`,
          confirmButtonColor: '#111827',
          timer: 2500,
          timerProgressBar: true
        })
      } else {
        // Add new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to add product')
        }
        
        const result = await response.json()
        dispatch(addProductAction({
          _id: result.insertedId,
          ...productData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
        
        Swal.fire({
          icon: 'success',
          title: 'Product Added!',
          text: `"${formData.name}" has been added successfully.`,
          confirmButtonColor: '#111827',
          timer: 2500,
          timerProgressBar: true
        })
      }

      setIsModalOpen(false)
      setFormData(initialFormData)
      setEditingProduct(null)
    } catch (err) {
      console.error('Error saving product:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to save product',
        confirmButtonColor: '#111827'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (productId: string) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Product?',
      text: 'This action cannot be undone. Are you sure you want to delete this product?',
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
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete product')
      }

      dispatch(deleteProductAction(productId))
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Product has been deleted successfully.',
        confirmButtonColor: '#111827',
        timer: 2000,
        timerProgressBar: true
      })
    } catch (err) {
      console.error('Error deleting product:', err)
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err instanceof Error ? err.message : 'Failed to delete product. Please try again.',
        confirmButtonColor: '#111827'
      })
    }
  }

  // Handle form input change
  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load products. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your product inventory ({products.length} total)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                            {product.badge && (
                              <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                          {product.originalPrice > product.price && (
                            <span className="ml-2 text-xs text-gray-400 line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{product.stock}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stockStatus.style}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewModal(product)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
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

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Enter price"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Enter original price"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Enter stock quantity"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => handleInputChange('badge', e.target.value)}
                    placeholder="e.g., New, Sale, Hot"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="w-4 h-4 text-gray-900 rounded focus:ring-gray-900"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Product</span>
                  </label>
                </div>

                {/* Main Image Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Image *</label>
                  <div className="space-y-3">
                    {/* Upload Button */}
                    <div className="flex gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        className="hidden"
                        id="main-image-upload"
                      />
                      <label
                        htmlFor="main-image-upload"
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm text-gray-600">{uploadProgress}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">Click to upload main image</span>
                          </>
                        )}
                      </label>
                    </div>

                    {/* URL Input Alternative */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">or enter URL:</span>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                    </div>

                    {/* Image Preview */}
                    {formData.image && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <Image
                          src={formData.image}
                          alt="Main product image"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Images Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Images</label>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        ref={additionalFilesRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesUpload}
                        className="hidden"
                        id="additional-images-upload"
                      />
                      <label
                        htmlFor="additional-images-upload"
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        <ImagePlus className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Add more images</span>
                      </label>
                    </div>

                    {/* Additional Images Preview */}
                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <Image
                              src={img}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                            {index === 0 && img === formData.image && (
                              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                                Main
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Colors</label>
                  
                  {/* Common Colors */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { name: 'Red', hex: '#EF4444' },
                      { name: 'Orange', hex: '#F97316' },
                      { name: 'Yellow', hex: '#EAB308' },
                      { name: 'Green', hex: '#22C55E' },
                      { name: 'Blue', hex: '#3B82F6' },
                      { name: 'Purple', hex: '#A855F7' },
                      { name: 'Pink', hex: '#EC4899' },
                      { name: 'Black', hex: '#171717' },
                      { name: 'White', hex: '#FFFFFF' },
                      { name: 'Gray', hex: '#6B7280' },
                      { name: 'Brown', hex: '#92400E' },
                      { name: 'Navy', hex: '#1E3A8A' },
                    ].map((color) => {
                      const isSelected = formData.colors.includes(color.name)
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              handleInputChange('colors', formData.colors.filter(c => c !== color.name))
                            } else {
                              handleInputChange('colors', [...formData.colors, color.name])
                            }
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                            isSelected 
                              ? 'border-gray-900 bg-gray-900 text-white' 
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span 
                            className={`w-3.5 h-3.5 rounded-full ${color.hex === '#FFFFFF' ? 'border border-gray-300' : ''}`}
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Add custom color (e.g., Maroon, Teal, Olive)"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.currentTarget
                          const value = input.value.trim()
                          if (value && !formData.colors.includes(value)) {
                            handleInputChange('colors', [...formData.colors, value])
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add custom color (e.g., Maroon, Teal, Olive)"]') as HTMLInputElement
                        if (input && input.value.trim() && !formData.colors.includes(input.value.trim())) {
                          handleInputChange('colors', [...formData.colors, input.value.trim()])
                          input.value = ''
                        }
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>

                  {/* Selected Colors Display */}
                  {formData.colors.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Selected Colors ({formData.colors.length}):</p>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.colors.map((colorName, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700"
                          >
                            {colorName}
                            <button
                              type="button"
                              onClick={() => handleInputChange('colors', formData.colors.filter((_, i) => i !== index))}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading || !formData.image}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {isViewModalOpen && viewingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {viewingProduct.image && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={viewingProduct.image}
                    alt={viewingProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <h4 className="text-xl font-semibold text-gray-900">{viewingProduct.name}</h4>
                {viewingProduct.badge && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                    {viewingProduct.badge}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm">{viewingProduct.description || 'No description available'}</p>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Price</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(viewingProduct.price)}</p>
                  {viewingProduct.originalPrice > viewingProduct.price && (
                    <p className="text-sm text-gray-400 line-through">{formatCurrency(viewingProduct.originalPrice)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Stock</p>
                  <p className="font-semibold text-gray-900">{viewingProduct.stock} units</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Category</p>
                  <p className="font-semibold text-gray-900">{viewingProduct.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Featured</p>
                  <p className="font-semibold text-gray-900">{viewingProduct.featured ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {viewingProduct.colors && viewingProduct.colors.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 uppercase mb-2">Colors</p>
                  <div className="flex gap-2 flex-wrap">
                    {viewingProduct.colors.map((color, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    openEditModal(viewingProduct)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Product
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products