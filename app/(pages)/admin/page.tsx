'use client'

import React, { useState } from 'react'
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Percent, LogOut, Loader2, ShieldX, Settings as SettingsIcon, Menu, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Dashboard from './components/Dashboard'
import Products from './components/Products'
import Orders from './components/Orders'
import Customer from './components/Customer'
import Categories from './components/Categories'
import Coupon from './components/Coupon'
import Settings from './components/Settings'

type TabType = 'dashboard' | 'products' | 'orders' | 'customers' | 'categories' | 'coupons' | 'settings'

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const menuItems = [
  { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products' as TabType, label: 'Products', icon: Package },
  { id: 'orders' as TabType, label: 'Orders', icon: ShoppingCart },
  { id: 'customers' as TabType, label: 'Customers', icon: Users },
  { id: 'categories' as TabType, label: 'Categories', icon: Tag },
  { id: 'coupons' as TabType, label: 'Coupons', icon: Percent },
  { id: 'settings' as TabType, label: 'Settings', icon: SettingsIcon }
]

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const user = session?.user as SessionUser | undefined
  const isAdmin = user?.role === 'admin'

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">You need to sign in to access the admin panel.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-500 mb-6">
            You don&apos;t have permission to access the admin panel. 
            This area is restricted to administrators only.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Admin user - show admin panel
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        w-64 bg-gray-900 flex flex-col fixed h-screen z-50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-lg">EG</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-white">EngineersGadget</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Menu</p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false) // Close sidebar on mobile after selecting
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-white text-gray-900'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Admin Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || 'Admin'}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-1.5 hover:bg-gray-800 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-gray-500 hover:text-red-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button & Page Title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">Manage your {activeTab}</p>
                </div>
              </div>
              
              {/* Admin Badge */}
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'products' && <Products />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'customers' && <Customer />}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'coupons' && <Coupon />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  )
}