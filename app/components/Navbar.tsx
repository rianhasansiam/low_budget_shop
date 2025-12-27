"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Home,
  Package,
  Phone,
  Info,
  Shield,
  LogOut,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { useCategories, useAppSelector } from "@/lib/redux/hooks";
import type { Category } from "@/lib/redux/slices/categoriesSlice";
import { useSession, signOut } from "next-auth/react";

// ============ TYPES ============
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  hasDropdown?: boolean;
  adminOnly?: boolean;
}

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

// ============ COMPONENT ============
export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Get categories from Redux store
  const { categories } = useCategories();

  // Get user info with role
  const user = session?.user as SessionUser | undefined;
  const isAuthenticated = status === "authenticated";
  const isAdmin = user?.role === "admin";
  // Navigation items - filtered based on user role
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { label: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
      {
        label: "Shop",
        href: "/allProducts",
        icon: <Package className="w-4 h-4" />,
        hasDropdown: true,
      },
      { label: "Products", href: "/allProducts", icon: <ShoppingBag className="w-4 h-4" /> },
      { label: "About", href: "/about", icon: <Info className="w-4 h-4" /> },
      { label: "Contact", href: "/contact", icon: <Phone className="w-4 h-4" /> },
    ];

    // Add admin link only for admin users
    if (isAdmin) {
      items.push({ 
        label: "Admin", 
        href: "/admin", 
        icon: <Shield className="w-4 h-4" />,
        adminOnly: true 
      });
    }

    return items;
  }, [isAdmin]);

  // Get cart and wishlist counts from Redux
  const cartTotalQuantity = useAppSelector((state) => state.cart.totalItems);
  const wishlistTotalItems = useAppSelector((state) => state.wishlist.totalItems);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Dropdown handlers
  const handleShopDropdownEnter = useCallback(() => setIsShopDropdownOpen(true), []);
  const handleShopDropdownLeave = useCallback(() => setIsShopDropdownOpen(false), []);
  const handleUserDropdownEnter = useCallback(() => setIsUserDropdownOpen(true), []);
  const handleUserDropdownLeave = useCallback(() => setIsUserDropdownOpen(false), []);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Check if nav item is active
  const isNavItemActive = (item: NavItem) => {
    if (item.href === "/") return pathname === "/";
    if (item.hasDropdown) return pathname.startsWith("/allProducts") || pathname.startsWith("/category");
    return pathname === item.href || pathname.startsWith(item.href);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3"
            >
              <Image
                src="/logo.png"
                alt="Store Logo"
                width={50}
                height={50}
                className="rounded-xl"
                priority
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">E-Commerce</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Electronics Store</p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.hasDropdown ? (
                  // Shop dropdown trigger
                  <div
                    onMouseEnter={handleShopDropdownEnter}
                    onMouseLeave={handleShopDropdownLeave}
                  >
                    <motion.button
                      whileHover={{ y: -1 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isNavItemActive(item)
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isShopDropdownOpen ? "rotate-180" : ""}`} />
                    </motion.button>

                    {/* Shop Dropdown */}
                    <AnimatePresence>
                      {isShopDropdownOpen && categories && categories.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">Categories</h3>
                              <Link 
                                href="/allProducts" 
                                className="text-xs text-gray-500 hover:text-gray-900"
                              >
                                View All →
                              </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {categories.slice(0, 8).map((category: Category) => (
                                <Link
                                  key={category._id}
                                  href={`/category/${encodeURIComponent(category.name)}`}
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                  <Image
                                    src={category.image}
                                    alt={category.name}
                                    width={32}
                                    height={32}
                                    className="rounded-lg object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-gray-900">
                                      {category.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {category.productCount} items
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Regular nav link
                  <Link href={item.href}>
                    <motion.div
                      whileHover={{ y: -1 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isNavItemActive(item)
                          ? "bg-gray-900 text-white"
                          : item.adminOnly
                          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Wishlist */}
            <Link href="/wilishlist">
              <motion.button
                whileHover={{ y: -2 }}
                className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-gray-600" />
                {wishlistTotalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {wishlistTotalItems > 9 ? "9+" : wishlistTotalItems}
                  </span>
                )}
              </motion.button>
            </Link>

            {/* Cart */}
            <Link href="/addToCart">
              <motion.button
                whileHover={{ y: -2 }}
                className="relative p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartTotalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartTotalQuantity > 9 ? "9+" : cartTotalQuantity}
                  </span>
                )}
              </motion.button>
            </Link>

            {/* User Menu */}
            <div
              className="relative"
              onMouseEnter={handleUserDropdownEnter}
              onMouseLeave={handleUserDropdownLeave}
            >
              <motion.button
                whileHover={{ y: -2 }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-gray-100"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
                {isAuthenticated && (
                  <ChevronDown className={`w-3 h-3 text-gray-400 hidden md:block transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`} />
                )}
              </motion.button>

              {/* User Dropdown */}
              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    {isAuthenticated ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            {user?.image ? (
                              <Image
                                src={user.image}
                                alt={user.name || "User"}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.name || "User"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                              </p>
                              {isAdmin && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 mt-1">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            My Account
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            My Orders
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-2">
                        <Link
                          href="/login"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          <span className="w-4 h-4 bg-gray-900 text-white rounded text-xs flex items-center justify-center">+</span>
                          Create Account
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-100 bg-white"
            >
              <nav className="py-4 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={item.href}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-colors ${
                          isNavItemActive(item)
                            ? "bg-gray-900 text-white"
                            : item.adminOnly
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Categories */}
                {categories && categories.length > 0 && (
                  <div className="px-4 pt-4 border-t border-gray-100 mt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Categories
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.slice(0, 6).map((category: Category) => (
                        <Link
                          key={category._id}
                          href={`/category/${encodeURIComponent(category.name)}`}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Image
                            src={category.image}
                            alt={category.name}
                            width={24}
                            height={24}
                            className="rounded object-cover"
                          />
                          <span className="text-sm text-gray-700 truncate">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Auth */}
                <div className="px-4 pt-4 border-t border-gray-100 mt-4">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                        {user?.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || "User"}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <Settings className="w-4 h-4" />
                        My Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 py-2.5 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
