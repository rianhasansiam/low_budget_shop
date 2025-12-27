'use client'

import React, { useState, useRef } from 'react'
import { Tag, Plus, Edit2, Trash2, X, Loader2, Upload, ImageIcon } from 'lucide-react'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useCategories } from '@/lib/redux/hooks'
import Swal from 'sweetalert2'
import Image from 'next/image'
import {
  addCategory as addCategoryAction,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction,
  Category
} from '@/lib/redux/slices/categoriesSlice'

interface CategoryFormData {
  name: string
  image: string
  productCount: number
}

const initialFormData: CategoryFormData = {
  name: '',
  image: '',
  productCount: 0
}

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dispatch = useAppDispatch()
  // Use the useCategories hook - data is already fetched by DataProvider
  const { categories, loading, error } = useCategories()

  // Handle image upload to ImgBB
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select an image file',
        confirmButtonColor: '#111827'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image must be less than 5MB',
        confirmButtonColor: '#111827'
      })
      return
    }

    setIsUploading(true)
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMAGEBB_API_KEY
      if (!apiKey) {
        throw new Error('ImgBB API key not configured')
      }

      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formDataUpload
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.data.url }))
        Swal.fire({
          icon: 'success',
          title: 'Image Uploaded!',
          text: 'Category image uploaded successfully',
          confirmButtonColor: '#111827',
          timer: 2000,
          timerProgressBar: true,
          toast: true,
          position: 'top-end',
          showConfirmButton: false
        })
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err instanceof Error ? err.message : 'Failed to upload image',
        confirmButtonColor: '#111827'
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Open modal for adding new category
  const handleAddNew = () => {
    setEditingCategory(null)
    setFormData(initialFormData)
    setIsModalOpen(true)
  }

  // Open modal for editing category
  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      image: category.image,
      productCount: category.productCount
    })
    setIsModalOpen(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData(initialFormData)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Category name is required',
        confirmButtonColor: '#111827'
      })
      return
    }

    if (!formData.image) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Category image is required',
        confirmButtonColor: '#111827'
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/categories/${editingCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update category')
        }

        dispatch(updateCategoryAction({
          ...editingCategory,
          ...formData
        }))

        Swal.fire({
          icon: 'success',
          title: 'Category Updated!',
          text: `"${formData.name}" has been updated successfully.`,
          confirmButtonColor: '#111827',
          timer: 2000,
          timerProgressBar: true
        })
      } else {
        // Create new category
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to add category')
        }

        const data = await response.json()
        
        dispatch(addCategoryAction({
          _id: data.insertedId,
          ...formData
        }))

        Swal.fire({
          icon: 'success',
          title: 'Category Added!',
          text: `"${formData.name}" has been added successfully.`,
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
        title: editingCategory ? 'Update Failed' : 'Add Failed',
        text: err instanceof Error ? err.message : 'Something went wrong',
        confirmButtonColor: '#111827'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (category: Category) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Category?',
      text: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    try {
      const response = await fetch(`/api/categories/${category._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      dispatch(deleteCategoryAction(category._id))

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `"${category.name}" has been deleted successfully.`,
        confirmButtonColor: '#111827',
        timer: 2000,
        timerProgressBar: true
      })
    } catch (err) {
      console.error('Delete error:', err)
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err instanceof Error ? err.message : 'Failed to delete category',
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load categories. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500">Organize your products into categories ({categories.length} total)</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Tag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No categories yet. Add your first category!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => (
            <div key={category._id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{category.productCount || 0} products</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(category)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(category)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter category name"
                />
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {formData.image ? (
                  <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden group">
                    <Image
                      src={formData.image}
                      alt="Category preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-300 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload image</span>
                        <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </button>
                )}
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
                  disabled={isSubmitting || isUploading}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories