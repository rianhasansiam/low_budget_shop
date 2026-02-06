"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Loader2 } from "lucide-react";

import ProductsGrid from "./components/ProductsGrid";

import { useProducts, useCategories, useFilters } from "@/lib/redux/hooks";
import SortDropdown, { SortOption } from "./components/SortDropdown";
import ActiveFilters from "./components/ActiveFilters";
import FilterSidebar from "./components/FilterSidebar";
import type { Product } from "@/app/components/ProductCard";

const MAX_PRICE = 500000;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd";

// Category icons mapping (fallback icons)
const categoryIcons: Record<string, string> = {
  "Arduino": "🛠️",
  "Raspberry Pi": "🥧",
  "Sensors": "📡",
  "Microcontrollers": "💻",
  "IoT Devices": "🌐",
  "Robotics": "🤖",
  "3D Printing": "🖨️",
  "Tools": "🔧",
  "Components": "⚡",
  "Displays": "📺",
  "Motors": "⚙️",
  "Accessories": "🎯",
};

// Loading fallback component
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    </div>
  );
}

// Structured data component for products page
function ProductsPageStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "All Products - EngineersGadget",
          description: "Browse all tech gadgets, electronics, and engineering tools at EngineersGadget",
          url: `${siteUrl}/allProducts`,
          isPartOf: {
            "@type": "WebSite",
            name: "EngineersGadget",
            url: siteUrl,
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "All Products",
                item: `${siteUrl}/allProducts`,
              },
            ],
          },
        }),
      }}
    />
  );
}

// Main content component that uses useSearchParams
function AllProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  // Get products and categories from Redux store
  const { products: allProducts, loading: isLoading } = useProducts();
  const { categories: categoriesData } = useCategories();

  // Get colors and badges from Redux store (instead of API calls)
  const { colors: colorsData, badges: badgesData } = useFilters();

  // Map categories with icons
  const categories = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.map((cat) => ({
      name: cat.name,
      count: cat.productCount,
      icon: categoryIcons[cat.name] || "📦",
    }));
  }, [categoriesData]);

  // Colors list
  const colors = useMemo(() => {
    return colorsData || [];
  }, [colorsData]);

  // Badges list
  const badges = useMemo(() => {
    return badgesData || [];
  }, [badgesData]);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [decodeURIComponent(categoryParam)] : []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<"all" | "inStock">("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Update categories from URL param - only on mount or param change
  const categoryFromUrl = useMemo(() => {
    if (!categoryParam) return null;
    const decodedCategory = decodeURIComponent(categoryParam);
    const categoryMap: Record<string, string> = {
      smartphones: "Smartphones",
      laptops: "Laptops",
      smartwatches: "Smartwatches",
      earbuds: "Earbuds",
      powerbanks: "Power Banks",
      accessories: "Accessories",
    };
    return categoryMap[decodedCategory.toLowerCase()] || decodedCategory;
  }, [categoryParam]);

  useEffect(() => {
    if (categoryFromUrl && !selectedCategories.includes(categoryFromUrl)) {
      setSelectedCategories([categoryFromUrl]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFromUrl]);

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  }, []);

  // Handle badge change
  const handleBadgeChange = useCallback((badge: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badge)
        ? prev.filter((b) => b !== badge)
        : [...prev, badge]
    );
  }, []);

  // Handle stock filter change
  const handleStockFilterChange = useCallback((filter: "all" | "inStock") => {
    setStockFilter(filter);
  }, []);

  // Handle price range change
  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
  }, []);



  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedBadges([]);
    setStockFilter("all");
    setPriceRange([0, MAX_PRICE]);
  }, []);

  // Reset price filter
  const resetPriceFilter = useCallback(() => {
    setPriceRange([0, MAX_PRICE]);
  }, []);

  // Filter and sort products (client-side filtering on fetched data)
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by colors
    if (selectedColors.length > 0) {
      result = result.filter((product) =>
        product.colors.some((color) => selectedColors.includes(color))
      );
    }

    // Filter by badges
    if (selectedBadges.length > 0) {
      result = result.filter((product) =>
        product.badge && selectedBadges.includes(product.badge)
      );
    }

    // Filter by stock availability
    if (stockFilter === "inStock") {
      result = result.filter((product) => product.stock > 0);
    }

    // Filter by price range
    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    switch (sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Sort by createdAt date (newest first)
        result = [...result].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, searchQuery, selectedCategories, selectedColors, selectedBadges, stockFilter, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Left: Filter button (mobile) + Results count */}
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {(selectedCategories.length > 0 ||
                priceRange[0] > 0 ||
                priceRange[1] < MAX_PRICE) && (
                <span className="w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  {selectedCategories.length +
                    (priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? 1 : 0)}
                </span>
              )}
            </motion.button>

            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">
                {filteredProducts.length}
              </span>{" "}
              products found
            </p>
          </div>

          {/* Right: Sort */}
          <div className="flex items-center gap-3">
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters
          selectedCategories={selectedCategories}
          selectedColors={selectedColors}
          selectedBadges={selectedBadges}
          stockFilter={stockFilter}
          priceRange={priceRange}
          maxPrice={MAX_PRICE}
          searchQuery={searchQuery}
          onRemoveCategory={handleCategoryChange}
          onRemoveColor={handleColorChange}
          onRemoveBadge={handleBadgeChange}
          onResetStock={() => setStockFilter("all")}
          onResetPrice={resetPriceFilter}
          onClearSearch={() => setSearchQuery("")}
          onClearAll={resetFilters}
        />

        {/* Content Area */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            colors={colors}
            selectedColors={selectedColors}
            onColorChange={handleColorChange}
            badges={badges}
            selectedBadges={selectedBadges}
            onBadgeChange={handleBadgeChange}
            stockFilter={stockFilter}
            onStockFilterChange={handleStockFilterChange}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
            maxPrice={MAX_PRICE}
            onReset={resetFilters}
            isMobileOpen={isMobileFilterOpen}
            onMobileClose={() => setIsMobileFilterOpen(false)}
          />

          {/* Products */}
          <div className="flex-1">
            <ProductsGrid key={sortBy} products={filteredProducts} isLoading={isLoading} />

            {/* Results Count */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="py-8">
                <p className="text-center text-sm text-gray-500">
                  Showing all {filteredProducts.length} products
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Page wrapper with Suspense boundary for useSearchParams
export default function AllProductsPage() {
  return (
    <>
      <ProductsPageStructuredData />
      <Suspense fallback={<ProductsLoading />}>
        <AllProductsContent />
      </Suspense>
    </>
  );
}
