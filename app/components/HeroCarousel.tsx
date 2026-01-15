"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Percent, ShoppingCart } from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addToCart } from "@/lib/redux/slices/cartSlice";
import Swal from "sweetalert2";

interface HeroSlide {
  _id: string;
  image: string;
  link: string;
  alt: string;
  type: "main" | "side";
  order: number;
  active: boolean;
}

interface DiscountedProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  stock: number;
}

// Fallback demo data if API fails
const fallbackMainSlides = [
  {
    _id: "1",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=600&fit=crop",
    link: "/allProducts",
    alt: "Winter Sale Banner - Electronics Deals",
    type: "main" as const,
    order: 1,
    active: true,
  },
  {
    _id: "2",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=600&fit=crop",
    link: "/allProducts",
    alt: "New Arrivals - Latest Gadgets",
    type: "main" as const,
    order: 2,
    active: true,
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mainSlides, setMainSlides] = useState<HeroSlide[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<DiscountedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  // Fetch slides and discounted products from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch slides and products in parallel
        const [slidesResponse, productsResponse] = await Promise.all([
          fetch("/api/hero-slides"),
          fetch("/api/products?limit=100")
        ]);
        
        const slidesData = await slidesResponse.json();
        const productsData = await productsResponse.json();
        
        // Handle slides
        if (slidesData.success && slidesData.data.length > 0) {
          const main = slidesData.data.filter((s: HeroSlide) => s.type === "main" && s.active);
          setMainSlides(main.length > 0 ? main : fallbackMainSlides);
        } else {
          setMainSlides(fallbackMainSlides);
        }
        
        // Filter products for special discounts section
        if (Array.isArray(productsData) && productsData.length > 0) {
          // First, get products marked as specialDiscount by admin
          const specialProducts = productsData.filter(
            (p: DiscountedProduct & { specialDiscount?: boolean }) => 
              p.specialDiscount && p.originalPrice && p.price && p.originalPrice > p.price
          );
          
          if (specialProducts.length > 0) {
            // Use admin-selected special discount products
            setDiscountedProducts(specialProducts.slice(0, 4));
          } else {
            // Fallback: show top discounted products if no special products selected
            const discounted = productsData
              .filter((p: DiscountedProduct) => p.originalPrice && p.price && p.originalPrice > p.price)
              .sort((a: DiscountedProduct, b: DiscountedProduct) => {
                const discountA = ((a.originalPrice - a.price) / a.originalPrice) * 100;
                const discountB = ((b.originalPrice - b.price) / b.originalPrice) * 100;
                return discountB - discountA; // Sort by highest discount first
              })
              .slice(0, 4);
            setDiscountedProducts(discounted);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMainSlides(fallbackMainSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product: DiscountedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.stock || product.stock === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Out of Stock',
        text: 'This product is currently out of stock.',
        confirmButtonColor: '#111827',
        timer: 2000,
        timerProgressBar: true
      });
      return;
    }
    
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    }));
    
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart!',
      text: `${product.name} has been added to your cart.`,
      confirmButtonColor: '#111827',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % (mainSlides.length || 1));
  }, [mainSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + (mainSlides.length || 1)) % (mainSlides.length || 1));
  }, [mainSlides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || mainSlides.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, mainSlides.length]);

  // Show loading skeleton
  if (loading) {
    return (
      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-2/3 h-[200px] sm:h-[300px] md:h-[400px] lg:h-[450px] rounded-2xl bg-gray-200 animate-pulse flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
          <div className="w-full lg:w-1/3">
            <div className="bg-gradient-to-br from-sky-50 to-red-50 rounded-2xl p-4 h-full">
              <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-3 animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Carousel */}
        <div
          className="relative w-full lg:w-2/3 h-[200px] sm:h-[300px] md:h-[380px] lg:h-[450px] rounded-2xl overflow-hidden group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Slides */}
          {mainSlides.map((slide, index) => (
            <Link
              key={slide._id}
              href={slide.link}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 translate-x-0"
                  : index < currentSlide
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
              }`}
            >
              {/* Banner Image */}
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            </Link>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {mainSlides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  goToSlide(index);
                }}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? "w-8 h-3 bg-sky-500"
                    : "w-3 h-3 bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Special Discount Products */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gradient-to-br from-sky-50 to-red-50 rounded-2xl p-4 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-gray-900">Special Discounts</h3>
            </div>
            
            {discountedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {discountedProducts.map((product, index) => {
                  const discountPercent = Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  );
                  
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                      className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <Link href={`/productDetails/${product._id}`} className="block">
                        <div className="relative aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 25vw, 15vw"
                          />
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            -{discountPercent}%
                          </div>
                        </div>
                        <h4 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-sky-500">
                            ৳{product.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ৳{product.originalPrice.toLocaleString()}
                          </span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="mt-2 w-full bg-gray-900 hover:bg-sky-400 text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Add
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                <Percent className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">No discounted products available</p>
              </div>
            )}
            
            {discountedProducts.length > 0 && (
              <Link
                href="/allProducts"
                className="mt-4 block text-center text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors"
              >
                View All Deals →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
