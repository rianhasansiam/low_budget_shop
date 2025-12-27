'use client'

import { useEffect } from 'react'
import { useAppDispatch } from './hooks'
import { initializeCart } from './slices/cartSlice'
import { initializeWishlist } from './slices/wishlistSlice'

export default function StorageInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Initialize cart and wishlist from localStorage on app mount
    dispatch(initializeCart())
    dispatch(initializeWishlist())
  }, [dispatch])

  return null
}
