import React, {
  useState,
  useMemo,
  useCallback,
  Fragment,
  useEffect
} from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  Fuel,
  Star,
  ChevronRight,
  Search,
  Filter
} from "lucide-react";
import CarDetailModal from "../components/default/CarDetailModal";
import { fetchVehicles } from "../lib/vehicles";

/* =====================================================
   App Constants
===================================================== */
const PRICE_CONFIG = Object.freeze({
  MIN: 800,
  MAX: 5000,
  STEP: 100,
});

const FILTER_DEFAULTS = Object.freeze({
  CATEGORY: "All",
  FUEL: "All",
  PRICE: PRICE_CONFIG.MAX,
});

const CATEGORY_OPTIONS = Object.freeze([
  "\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14",
  "\u0e40\u0e01\u0e4b\u0e07",
  "\u0e2d\u0e35\u0e42\u0e04",
  "SUV",
  "\u0e01\u0e23\u0e30\u0e1a\u0e30",
]);

const FUEL_OPTIONS = Object.freeze([
  "\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14",
  "\u0e40\u0e1a\u0e19\u0e0b\u0e34\u0e19",
  "\u0e14\u0e35\u0e40\u0e0b\u0e25",
  "\u0e44\u0e2e\u0e1a\u0e23\u0e34\u0e14",
  "\u0e44\u0e1f\u0e1f\u0e49\u0e32",
]);

const SORT_OPTIONS = Object.freeze({
  NONE: "none",
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
});


/* =====================================================
   Dataset — loaded from Supabase
===================================================== */

/* =====================================================
   Utility Helpers
===================================================== */
const normalize = (value = "") => value.toLowerCase().trim();

const safeIncludes = (source, target) =>
  normalize(source).includes(normalize(target));

const isAll = (value) => value === "\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14";

const byCategory = (car, category) =>
  isAll(category) || car.category === category;

const byFuel = (car, fuel) =>
  isAll(fuel) || car.features.fuel === fuel;

const byPrice = (car, max) => car.price <= max;

const bySearch = (car, term) => {
  if (!term) return true;
  const normalizedTerm = normalize(term);
  
  return (
    safeIncludes(car.name, term) ||
    safeIncludes(car.category, term) ||
    safeIncludes(car.features.fuel, term) ||
    safeIncludes(car.features.seats, term) ||
    safeIncludes(car.features.luggage, term) ||
    (normalizedTerm.includes('seater') && car.features.seats === normalizedTerm.replace(/\D/g, '')) ||
    (normalizedTerm.includes('seat') && car.features.seats === normalizedTerm.replace(/\D/g, ''))
  );
};

/* =====================================================
   Skeleton Loader Component
===================================================== */
const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        {/* Image skeleton */}
        <div className="relative h-56 bg-gray-200 dark:bg-zinc-800"></div>

        <div className="p-6">
          {/* Top section skeleton */}
          <div className="flex justify-between mb-4">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="text-right space-y-1">
              <div className="h-7 w-20 bg-gray-200 dark:bg-zinc-800 rounded ml-auto"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800 rounded ml-auto"></div>
            </div>
          </div>

          {/* Features skeleton */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 rounded-lg mb-1"></div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-zinc-800 rounded"></div>
              </div>
            ))}
          </div>

          {/* Rating skeleton */}
          <div className="absolute top-4 right-4 w-16 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>

          {/* Button skeleton */}
          <div className="h-12 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   Skeleton Filter Bar
===================================================== */
const SkeletonFilterBar = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 animate-pulse">
      {/* Search skeleton */}
      <div className="relative md:col-span-2">
        <div className="w-full h-12 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
      </div>
      
      {/* Price filter skeleton */}
      <div>
        <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-800 rounded mb-2"></div>
        <div className="h-2 bg-gray-200 dark:bg-zinc-800 rounded"></div>
      </div>
      
      {/* Fuel filter skeleton */}
      <div className="h-12 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
    </div>
  );
};

/* =====================================================
   Skeleton Categories
===================================================== */
const SkeletonCategories = () => {
  return (
    <div className="flex flex-wrap gap-2 mb-10 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="w-20 h-9 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
      ))}
    </div>
  );
};

/* =====================================================
   UI Helpers
===================================================== */
const FeatureItem = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center gap-1">
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </div>
);

const EmptyState = () => (
  <div className="text-center mt-20 py-12">
    <div className="text-5xl mb-4">🚗</div>
    <p className="text-gray-600 dark:text-zinc-400 text-lg">
      \u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e23\u0e16\u0e17\u0e35\u0e48\u0e15\u0e23\u0e07\u0e01\u0e31\u0e1a\u0e15\u0e31\u0e27\u0e01\u0e23\u0e2d\u0e07\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13
    </p>
    <p className="text-gray-500 dark:text-zinc-500 text-sm mt-2">
      \u0e25\u0e2d\u0e07\u0e1b\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e37\u0e48\u0e2d\u0e19\u0e44\u0e02\u0e01\u0e32\u0e23\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e14\u0e39
    </p>
  </div>
);

/* =====================================================
   Main Component
===================================================== */
const Models = () => {
  /* ---------------- State ---------------- */
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NONE);

  const [activeCategory, setActiveCategory] = useState(
    FILTER_DEFAULTS.CATEGORY
  );
  const [fuelType, setFuelType] = useState(
    FILTER_DEFAULTS.FUEL
  );
  const [maxPrice, setMaxPrice] = useState(
    FILTER_DEFAULTS.PRICE
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ---------------- Fetch from Supabase (or fallback) ---------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const { data } = await fetchVehicles();
      if (!cancelled) {
        setCars(data);
        setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ---------------- Callbacks ---------------- */
const handleSort = useCallback((e) => {
  setSortBy(e.target.value);
}, []);


  const handleSearch = useCallback(
    (e) => setSearchTerm(e.target.value),
    []
  );

  const handleCategory = useCallback(
    (value) => setActiveCategory(value),
    []
  );

  const handleFuel = useCallback(
    (e) => setFuelType(e.target.value),
    []
  );

  const handlePrice = useCallback(
    (e) => setMaxPrice(Number(e.target.value)),
    []
  );

  /* ---------------- Derived Data ---------------- */
  const filteredCars = useMemo(() => {
  const result = cars.filter((car) =>
    bySearch(car, searchTerm) &&
    byCategory(car, activeCategory) &&
    byFuel(car, fuelType) &&
    byPrice(car, maxPrice)
  );

  if (sortBy === SORT_OPTIONS.PRICE_ASC) {
    return [...result].sort((a, b) => a.price - b.price);
  }

  if (sortBy === SORT_OPTIONS.PRICE_DESC) {
    return [...result].sort((a, b) => b.price - a.price);
  }

  return result;
}, [searchTerm, activeCategory, fuelType, maxPrice, sortBy]);



  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-20">
      <div className="container mx-auto px-4">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            \u0e23\u0e16\u0e40\u0e0a\u0e48\u0e32\u0e02\u0e2d\u0e07<span className="text-pink-500">\u0e40\u0e23\u0e32</span>
          </motion.h1>
          <p className="text-gray-600 dark:text-zinc-400">
            \u0e40\u0e25\u0e37\u0e2d\u0e01\u0e23\u0e16\u0e17\u0e35\u0e48\u0e40\u0e2b\u0e21\u0e32\u0e30\u0e01\u0e31\u0e1a\u0e04\u0e38\u0e13 \u0e23\u0e16\u0e43\u0e2b\u0e21\u0e48 \u0e2a\u0e30\u0e2d\u0e32\u0e14 \u0e1b\u0e25\u0e2d\u0e14\u0e20\u0e31\u0e22 \u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e1b\u0e23\u0e30\u0e01\u0e31\u0e19\u0e0a\u0e31\u0e49\u0e19 1
          </p>
        </div>

        {/* FILTER BAR - Show skeleton while loading */}
        {isLoading ? (
          <SkeletonFilterBar />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e15\u0e32\u0e21\u0e0a\u0e37\u0e48\u0e2d, \u0e1b\u0e23\u0e30\u0e40\u0e20\u0e17, \u0e40\u0e0a\u0e37\u0e49\u0e2d\u0e40\u0e1e\u0e25\u0e34\u0e07, \u0e17\u0e35\u0e48\u0e19\u0e31\u0e48\u0e07..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-sm flex items-center gap-2 mb-1 text-gray-600 dark:text-zinc-400">
                  <Filter className="w-4 h-4" />
                  \u0e23\u0e32\u0e04\u0e32\u0e2a\u0e39\u0e07\u0e2a\u0e38\u0e14 (\u0e3f{maxPrice})
                </label>
                <input
                  type="range"
                  min={PRICE_CONFIG.MIN}
                  max={PRICE_CONFIG.MAX}
                  step={PRICE_CONFIG.STEP}
                  value={maxPrice}
                  onChange={handlePrice}
                  className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-pink-500"
                />
              </div>

              {/* Fuel */}
              <select
                value={fuelType}
                onChange={handleFuel}
                className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
              >
                {FUEL_OPTIONS.map((fuel) => (
                  <option key={fuel}>{fuel}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={handleSort}
                className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition"
              >
                <option value={SORT_OPTIONS.NONE}>\u0e40\u0e23\u0e35\u0e22\u0e07\u0e15\u0e32\u0e21</option>
                <option value={SORT_OPTIONS.PRICE_ASC}>\u0e23\u0e32\u0e04\u0e32: \u0e15\u0e48\u0e33 → \u0e2a\u0e39\u0e07</option>
                <option value={SORT_OPTIONS.PRICE_DESC}>\u0e23\u0e32\u0e04\u0e32: \u0e2a\u0e39\u0e07 → \u0e15\u0e48\u0e33</option>
              </select>
            </div>

        )}

        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setSearchTerm("");
              setActiveCategory(FILTER_DEFAULTS.CATEGORY);
              setFuelType(FILTER_DEFAULTS.FUEL);
              setMaxPrice(FILTER_DEFAULTS.PRICE);
              setSortBy(SORT_OPTIONS.NONE);
            }}
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          >
            \u0e25\u0e49\u0e32\u0e07\u0e15\u0e31\u0e27\u0e01\u0e23\u0e2d\u0e07
          </button>
        </div>


        {/* CATEGORY FILTERS - Show skeleton while loading */}
        {isLoading ? (
          <SkeletonCategories />
        ) : (
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                onClick={() => handleCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${activeCategory === category
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                    : "bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* CAR GRID - Show skeleton while loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Show skeleton loaders
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))
          ) : filteredCars.length > 0 ? (
            // Show actual car cards
            filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => {
                  setSelectedCar(car);
                  setIsModalOpen(true);
                }}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold">{car.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <span className="text-xs text-pink-500 font-bold uppercase tracking-wide">
                        {car.category}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-1">
                        {car.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-500">
                        \u0e3f{car.price}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">\u0e15\u0e48\u0e2d\u0e27\u0e31\u0e19</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6 text-xs text-gray-500 dark:text-zinc-400">
                    <FeatureItem
                      icon={Users}
                      label={`${car.features.seats} \u0e17\u0e35\u0e48\u0e19\u0e31\u0e48\u0e07`}
                    />
                    <FeatureItem
                      icon={Briefcase}
                      label={`${car.features.luggage} \u0e01\u0e23\u0e30\u0e40\u0e1b\u0e4b\u0e32`}
                    />
                    <FeatureItem
                      icon={Fuel}
                      label={car.features.fuel}
                    />
                  </div>

                  <Link
                    to={`/booking/${car.id}`}
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-pink-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    \u0e08\u0e2d\u0e07\u0e40\u0e25\u0e22 <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            // Show empty state
            <div className="col-span-3">
              <EmptyState />
            </div>
          )}
        </div>

        {/* Loading indicator during transition */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12 text-sm text-gray-500 dark:text-zinc-400"
          >
            \u0e41\u0e2a\u0e14\u0e07 {filteredCars.length} \u0e04\u0e31\u0e19
          </motion.div>
        )}
      </div>

      {/* Car Detail Modal */}
      {isModalOpen && selectedCar && (
        <CarDetailModal 
          car={selectedCar} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Models;
