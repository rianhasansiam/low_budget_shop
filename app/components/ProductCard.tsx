'use client'

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addToCart } from "@/lib/redux/slices/cartSlice";
import { toggleWishlist } from "@/lib/redux/slices/wishlistSlice";
import Swal from "sweetalert2";

// Product type matching database schema
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  category: string;
  colors: string[];
  badge: string;
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isInWishlist = wishlistItems.some(item => item.id === product._id);
  
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch(toggleWishlist({
      id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      inStock: product.stock > 0
    }));
    
    Swal.fire({
      icon: isInWishlist ? 'info' : 'success',
      title: isInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist!',
      text: isInWishlist 
        ? `${product.name} has been removed from your wishlist.`
        : `${product.name} has been added to your wishlist.`,
      confirmButtonColor: '#111827',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/productDetails?id=${product._id}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white rounded-full ${"bg-black"
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-bold bg-red-400 text-black rounded-full">
            -{discount}%
          </span>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
              product.stock === 0 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          <button
            onClick={handleToggleWishlist}
            className={`p-2.5 rounded-xl shadow-md transition-colors ${
              isInWishlist 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white hover:bg-red-50 hover:text-red-500'
            }`}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? <Check className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/productDetails?id=${product._id}`}>
          <p className="text-xs text-gray-500 mb-1">{product.category}</p>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">
            {product.name}
          </h3>
        </Link>

        

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ৳{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
