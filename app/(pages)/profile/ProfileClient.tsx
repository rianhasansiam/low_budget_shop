'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  LogOut,
  Package,
  Heart,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Bell,
  Lock,
  Globe,
  ShoppingCart
} from 'lucide-react'
import Swal from 'sweetalert2'
import { useAppSelector } from '@/lib/redux/hooks'

interface SessionUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

interface UserData {
  _id: string
  name: string
  email: string
  picture: string | null
  role: string
  provider: string
  createdAt: string
  updatedAt: string
}

export default function ProfileClient() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Get real data from Redux
  const { totalItems: cartCount } = useAppSelector((state) => state.cart)
  const { totalItems: wishlistCount } = useAppSelector((state) => state.wishlist)
  const ordersState = useAppSelector((state) => state.orders)
  const orderCount = ordersState?.items?.length || 0
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  
  const [editForm, setEditForm] = useState({
    name: '',
  })

  const user = session?.user as SessionUser | undefined

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return
      
      try {
        const response = await fetch(`/api/users/${user.id}`)
        if (response.ok) {
          const result = await response.json()
          const data = result.data || result // Handle both { data: user } and direct user object
          setUserData(data)
          setEditForm({ name: data.name })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchUserData()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [user?.id, status, router])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please select an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'Image size should be less than 5MB', 'error')
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const imgbbResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        { method: 'POST', body: formData }
      )
      
      const imgbbData = await imgbbResponse.json()
      
      if (!imgbbData.success) {
        throw new Error('Failed to upload image')
      }

      const imageUrl = imgbbData.data.url

      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picture: imageUrl })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUserData(updatedUser)
        await update({ image: imageUrl })
        
        Swal.fire({
          icon: 'success',
          title: 'Profile Picture Updated!',
          showConfirmButton: false,
          timer: 1500
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      Swal.fire('Error', 'Failed to upload image. Please try again.', 'error')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      Swal.fire('Error', 'Name cannot be empty', 'error')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name })
      })

      if (response.ok) {
        const result = await response.json()
        const updatedUser = result.data || result // Handle both formats
        setUserData(updatedUser)
        setIsEditing(false)
        await update({ name: editForm.name })
        
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated!',
          showConfirmButton: false,
          timer: 1500
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      Swal.fire('Error', 'Failed to update profile. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle sign out
  const handleSignOut = () => {
    Swal.fire({
      title: 'Sign Out',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, sign out'
    }).then((result) => {
      if (result.isConfirmed) {
        signOut({ callbackUrl: '/' })
      }
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  // Real stats from Redux
  const userStats = [
    { label: 'Orders', value: orderCount.toString(), icon: Package, color: 'bg-blue-500' },
    { label: 'Wishlist', value: wishlistCount.toString(), icon: Heart, color: 'bg-pink-500' },
    { label: 'Cart Items', value: cartCount.toString(), icon: ShoppingCart, color: 'bg-green-500' },
  ]

  const quickActions = [
    { label: 'My Orders', icon: Package, href: '/orders', color: 'from-blue-500 to-blue-600', count: orderCount.toString() },
    { label: 'Wishlist', icon: Heart, href: '/wilishlist', color: 'from-pink-500 to-rose-600', count: wishlistCount.toString() },
    { label: 'My Cart', icon: ShoppingCart, href: '/addToCart', color: 'from-emerald-500 to-green-600', count: cartCount.toString() },
    { label: 'Notifications', icon: Bell, href: '#', color: 'from-amber-500 to-orange-600', count: '0' },
  ]

  const settingsTabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'preferences' as const, label: 'Preferences', icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section with Profile */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
          {/* Greeting & Logout */}
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {getGreeting()}
              </p>
              <h1 className="text-3xl font-bold text-white mt-1">
                Welcome back, {userData?.name?.split(' ')[0]}!
              </h1>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          </div>

          {/* Profile Card Floating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            {/* Avatar */}
            <div className="relative group">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse opacity-75 blur-md" />
                {userData?.picture || user?.image ? (
                  <Image
                    src={userData?.picture || user?.image || ''}
                    alt={userData?.name || 'Profile'}
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-2xl relative z-10"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-4 border-white shadow-2xl flex items-center justify-center relative z-10">
                    <span className="text-4xl font-bold text-white">
                      {userData?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                
                {/* Upload Overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 cursor-pointer"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {/* Online Indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-3 border-white rounded-full z-20" />
            </div>

            {/* Info */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{userData?.name}</h2>
                {userData?.role === 'admin' && (
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-gray-400 mt-1">{userData?.email}</p>
              <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Verified
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {userStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg shadow-gray-200/50 border border-gray-100"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => router.push(action.href)}
                  className="group relative bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">{action.label}</p>
                  {action.count && (
                    <span className="absolute top-4 right-4 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      {action.count}
                    </span>
                  )}
                  <ChevronRight className="absolute bottom-5 right-4 w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-6 sm:p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                    <p className="text-gray-500 text-sm">Update your personal details</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditForm({ name: userData?.name || '' })
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid gap-6">
                  {/* Name Field */}
                  <div className="grid sm:grid-cols-3 gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700 pt-3">Full Name</label>
                    <div className="sm:col-span-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                          placeholder="Enter your name"
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900 font-medium">{userData?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="grid sm:grid-cols-3 gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700 pt-3">Email Address</label>
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">{userData?.email}</span>
                        <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Email address cannot be changed</p>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="grid sm:grid-cols-3 gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700 pt-3">Member Since</label>
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sign-in Method */}
                  <div className="grid sm:grid-cols-3 gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700 pt-3">Sign-in Method</label>
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        {userData?.provider === 'google' ? (
                          <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-gray-900 font-medium">Google Account</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-900 font-medium">Email & Password</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="grid sm:grid-cols-3 gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700 pt-3">Account Role</label>
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 font-medium capitalize">{userData?.role}</span>
                        {userData?.role === 'admin' && (
                          <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            Full Access
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-6 sm:p-8"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Security Settings</h3>
                  <p className="text-gray-500 text-sm">Manage your account security</p>
                </div>

                <div className="space-y-4">
                  {/* Password */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Lock className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition-colors">
                      Change
                    </button>
                  </div>

                  {/* Two-Factor */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Shield className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                      Enable
                    </button>
                  </div>

                  {/* Sessions */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Globe className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Active Sessions</p>
                        <p className="text-sm text-gray-500">Manage your active sessions</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition-colors">
                      View All
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 p-4 border-2 border-red-200 rounded-xl bg-red-50">
                  <h4 className="font-semibold text-red-700 mb-2">Danger Zone</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Delete Account?',
                        text: 'This action cannot be undone. All your data will be permanently deleted.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc2626',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'Yes, delete my account'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          Swal.fire('Info', 'Account deletion is not implemented yet.', 'info')
                        }
                      })
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-6 sm:p-8"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Preferences</h3>
                  <p className="text-gray-500 text-sm">Customize your experience</p>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive emails about your account activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>

                  {/* Order Updates */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Order Updates</p>
                      <p className="text-sm text-gray-500">Get notified about your order status</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>

                  {/* Promotional Emails */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Promotional Emails</p>
                      <p className="text-sm text-gray-500">Receive emails about deals and offers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>

                  {/* Newsletter */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Newsletter</p>
                      <p className="text-sm text-gray-500">Weekly digest of new products and trends</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
