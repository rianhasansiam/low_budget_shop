'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ArrowLeft,
  ZoomIn,
  Grid3X3,
  LayoutGrid,
  Users,
  ThumbsUp
} from 'lucide-react'

interface GalleryImage {
  _id: string
  image: string
  caption: string
  order: number
}

export default function ReviewsPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid')

  // Fetch gallery images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/review-gallery')
        const data = await response.json()
        if (data.success) {
          setGalleryImages(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching gallery:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') setSelectedIndex(null)
      if (e.key === 'ArrowLeft') setSelectedIndex(prev => prev !== null ? Math.max(0, prev - 1) : null)
      if (e.key === 'ArrowRight') setSelectedIndex(prev => prev !== null ? Math.min(galleryImages.length - 1, prev + 1) : null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, galleryImages.length])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedIndex])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Structured Data for Reviews Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Customer Review Gallery - EngineersGadget",
            description: "Real screenshots and reviews from our valued customers at Engineers Gadget.",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd"}/reviews`,
            mainEntity: {
              "@type": "ItemList",
              name: "Customer Reviews",
              numberOfItems: galleryImages.length,
              itemListOrder: "https://schema.org/ItemListOrderDescending",
            },
            publisher: {
              "@type": "Organization",
              name: "Engineers Gadget",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd",
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Reviews",
                  item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd"}/reviews`,
                },
              ],
            },
          }),
        }}
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 relative z-10">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              Customer Review Gallery
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-white/90 mb-8"
            >
              Real screenshots and reviews from our valued customers. See what they&apos;re saying about Engineers Gadget!
            </motion.p>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-6 md:gap-10"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">25,000+</p>
                  <p className="text-sm text-white/70">Happy Customers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white fill-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">4.9/5</p>
                  <p className="text-sm text-white/70">Average Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ThumbsUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">99%</p>
                  <p className="text-sm text-white/70">Would Recommend</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="container mx-auto px-4 py-10 md:py-16">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              All Reviews ({galleryImages.length})
            </h2>
            <p className="text-gray-500 text-sm mt-1">Click on any image to view in full size</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-sky-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'masonry' ? 'bg-white shadow-sm text-sky-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Star className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-xl font-medium mb-2">No reviews yet</p>
            <p className="text-gray-400">Check back soon for customer reviews!</p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
              >
                {galleryImages.map((img, index) => (
                  <motion.div
                    key={img._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedIndex(index)}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <Image
                      src={img.image}
                      alt={img.caption || `Review ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <ZoomIn className="w-6 h-6 text-gray-800" />
                      </div>
                    </div>
                    {/* Caption */}
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm font-medium line-clamp-2">{img.caption}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Masonry View */}
            {viewMode === 'masonry' && (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 md:gap-4">
                {galleryImages.map((img, index) => (
                  <motion.div
                    key={img._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedIndex(index)}
                    className="group relative mb-3 md:mb-4 rounded-xl overflow-hidden cursor-pointer bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 break-inside-avoid"
                  >
                    <Image
                      src={img.image}
                      alt={img.caption || `Review ${index + 1}`}
                      width={400}
                      height={300 + (index % 3) * 100}
                      className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <ZoomIn className="w-6 h-6 text-gray-800" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && galleryImages[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium">
              {selectedIndex + 1} / {galleryImages.length}
            </div>

            {/* Main Image */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-5xl max-h-[85vh] mx-4"
            >
              <Image
                src={galleryImages[selectedIndex].image}
                alt={galleryImages[selectedIndex].caption || 'Customer review'}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />

              {/* Caption */}
              {galleryImages[selectedIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                  <p className="text-white text-center">{galleryImages[selectedIndex].caption}</p>
                </div>
              )}
            </motion.div>

            {/* Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedIndex(prev => prev !== null ? Math.max(0, prev - 1) : null)}
                  disabled={selectedIndex === 0}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <button
                  onClick={() => setSelectedIndex(prev => prev !== null ? Math.min(galleryImages.length - 1, prev + 1) : null)}
                  disabled={selectedIndex === galleryImages.length - 1}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-7 h-7 text-white" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/50 rounded-xl max-w-[90vw] overflow-x-auto">
              {galleryImages.slice(0, 10).map((img, index) => (
                <button
                  key={img._id}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden transition-all ${
                    index === selectedIndex
                      ? 'ring-2 ring-white scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
              {galleryImages.length > 10 && (
                <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                  +{galleryImages.length - 10}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
