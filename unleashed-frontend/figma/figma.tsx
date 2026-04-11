import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import logo from '../imports/superlogo.png';

// Mock data - Replace with your API call
const mockProducts = [
  {
    id: 1,
    name: 'Denim Jacket Street Edition',
    price: 850000,
    rating: 4,
    reviews: 96,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    category: 'Casual Wear',
    brand: 'Arcadian',
  },
  {
    id: 2,
    name: 'Athletic Tank Top Black',
    price: 650000,
    rating: 3,
    reviews: 26,
    image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400',
    category: 'Activewear',
    brand: 'Lumina Threads',
  },
  {
    id: 3,
    name: 'Pleated Skirt Dark Grey',
    price: 750000,
    rating: 2,
    reviews: 28,
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
    category: 'Formal Wear',
    brand: 'Lune',
  },
  {
    id: 4,
    name: 'Hoodie Oversized Streetwear',
    price: 950000,
    rating: 5,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    category: 'Casual Wear',
    brand: 'Outliners',
  },
  {
    id: 5,
    name: 'Cargo Pants Urban Black',
    price: 880000,
    rating: 4,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
    category: 'Casual Wear',
    brand: 'Refined',
  },
  {
    id: 6,
    name: 'Bomber Jacket Street Elite',
    price: 1200000,
    rating: 5,
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
    category: 'Casual Wear',
    brand: 'Velocity',
  },
];

const categories = ['All Categories', 'Casual Wear', 'Formal Wear', 'Activewear', 'Ethnic Wear'];
const brands = ['All Brands', 'Arcadian', 'Lumina Threads', 'Lune', 'Outliners', 'Refined', 'Velocity'];
const priceOptions = ['Default', 'Low to High', 'High to Low'];

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  // Filter states - Connect these to your API
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedPrice, setSelectedPrice] = useState('Default');
  const [selectedRating, setSelectedRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(mockProducts);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // TODO: Replace this with your actual API call
  useEffect(() => {
    // Simulate API call
    // fetchProducts({ category: selectedCategory, brand: selectedBrand, price: selectedPrice, rating: selectedRating, search: searchQuery })
    //   .then(data => setProducts(data));

    // For now, just use mock data with basic filtering
    let filtered = [...mockProducts];

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedBrand !== 'All Brands') {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    if (selectedRating > 0) {
      filtered = filtered.filter(p => p.rating >= selectedRating);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price sorting
    if (selectedPrice === 'Low to High') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (selectedPrice === 'High to Low') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setProducts(filtered);
  }, [selectedCategory, selectedBrand, selectedPrice, selectedRating, searchQuery]);

  const collections = [
    {
      title: 'STREET ELITE',
      image: 'https://images.unsplash.com/photo-1762666167416-72b1540a76b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      price: '$129',
    },
    {
      title: 'URBAN REBEL',
      image: 'https://images.unsplash.com/photo-1756276900419-868625adff43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      price: '$159',
    },
    {
      title: 'DARK RIDER',
      image: 'https://images.unsplash.com/photo-1768084356884-22bb77e76931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      price: '$189',
    },
    {
      title: 'GRUNGE ICON',
      image: 'https://images.unsplash.com/photo-1761073490980-ecd40e9bec57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      price: '$179',
    },
  ];

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}₫`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600 fill-gray-600'}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>

      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-black/95 backdrop-blur-sm border-b border-red-600/20' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img src={logo} alt="ROCKWEAR" className="h-16 w-auto" />
          </motion.div>

          <div className="hidden md:flex items-center gap-10" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <a href="#" className="relative group">
              <span className="tracking-wider">NEW DROP</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#collections" className="relative group">
              <span className="tracking-wider">COLLECTIONS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#shop" className="relative group">
              <span className="tracking-wider">SHOP</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              className="p-2 hover:text-red-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>
            <motion.button
              className="p-2 hover:text-red-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ scale: heroScale, opacity: heroOpacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1657549813236-9772dc7feaa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="Hero"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <div
              className="text-[10vw] md:text-[8rem] leading-[0.85] mb-4 tracking-tight"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              <span className="block">UNLEASH</span>
              <span className="block text-red-600">YOUR REBEL</span>
            </div>
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto tracking-wide"
            style={{ fontFamily: 'Oswald, sans-serif' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            MORE THAN CLOTHES. IT'S AN ATTITUDE. IT'S STREET CULTURE.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              className="px-10 py-4 bg-red-600 text-white tracking-widest relative overflow-hidden group"
              style={{ fontFamily: 'Oswald, sans-serif' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">SHOP NOW</span>
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <span className="absolute inset-0 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity z-20" style={{ fontFamily: 'Oswald, sans-serif' }}>
                SHOP NOW
              </span>
            </motion.button>

            <motion.button
              className="px-10 py-4 border-2 border-white text-white tracking-widest hover:bg-white hover:text-black transition-all duration-300"
              style={{ fontFamily: 'Oswald, sans-serif' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              LOOKBOOK
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <span className="text-xs tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>SCROLL</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Collections Grid */}
      <section id="collections" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2
            className="text-6xl md:text-8xl mb-4 tracking-tight"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            NEW DROP
          </h2>
          <div className="h-1 w-24 bg-red-600"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {collections.map((item, index) => (
            <motion.div
              key={index}
              className={`relative group overflow-hidden cursor-pointer ${
                index === 0 ? 'lg:col-span-7' :
                index === 1 ? 'lg:col-span-5' :
                index === 2 ? 'lg:col-span-5' :
                'lg:col-span-7'
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <motion.img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Red accent line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-red-600 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                ></motion.div>

                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                  <h3
                    className="text-3xl md:text-4xl mb-2 tracking-tight"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-red-600 text-xl" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {item.price}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Shop Section with Filters */}
      <section id="shop" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2
            className="text-6xl md:text-8xl mb-4 tracking-tight"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            SHOP ALL
          </h2>
          <div className="h-1 w-24 bg-red-600"></div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            className="lg:w-64 flex-shrink-0"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="sticky top-24 space-y-8">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search by Product Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-red-600/30 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  style={{ fontFamily: 'Oswald, sans-serif' }}
                />
              </div>

              {/* New Count */}
              <div>
                <p className="text-sm text-gray-400" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  New ({products.length})
                </p>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-xl mb-4 tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  Category
                </h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="appearance-none w-5 h-5 border-2 border-gray-600 rounded-full checked:border-red-600 transition-colors"
                        />
                        {selectedCategory === category && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="text-xl mb-4 tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  Brand
                </h3>
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="brand"
                          checked={selectedBrand === brand}
                          onChange={() => setSelectedBrand(brand)}
                          className="appearance-none w-5 h-5 border-2 border-gray-600 rounded-full checked:border-red-600 transition-colors"
                        />
                        {selectedBrand === brand && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-xl mb-4 tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  Price
                </h3>
                <div className="space-y-3">
                  {priceOptions.map((price) => (
                    <label key={price} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="price"
                          checked={selectedPrice === price}
                          onChange={() => setSelectedPrice(price)}
                          className="appearance-none w-5 h-5 border-2 border-gray-600 rounded-full checked:border-red-600 transition-colors"
                        />
                        {selectedPrice === price && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        {price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-xl mb-4 tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  Rating
                </h3>
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="rating"
                          checked={selectedRating === rating}
                          onChange={() => setSelectedRating(rating)}
                          className="appearance-none w-5 h-5 border-2 border-gray-600 rounded-full checked:border-red-600 transition-colors"
                        />
                        {selectedRating === rating && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {rating === 0 ? (
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors" style={{ fontFamily: 'Oswald, sans-serif' }}>
                            All Ratings
                          </span>
                        ) : (
                          <>
                            {[...Array(rating)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-white/5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="px-6 py-3 border-2 border-white text-white tracking-widest" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        VIEW
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm mb-2 text-gray-300 group-hover:text-white transition-colors truncate" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(product.rating)}
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                  <p className="text-lg text-red-600" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {formatPrice(product.price)}
                  </p>
                </motion.div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-2xl text-gray-400" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  NO PRODUCTS FOUND
                </p>
                <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Statement Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600/5"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-red-600/30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-red-600/30"></div>

        <motion.div
          className="max-w-5xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="text-5xl md:text-7xl lg:text-8xl leading-tight mb-8 tracking-tight"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            BORN ON THE <span className="text-red-600">STREETS</span><br />
            MADE FOR <span className="text-red-600">REBELS</span>
          </h2>
          <p
            className="text-xl md:text-2xl text-gray-400 tracking-wide"
            style={{ fontFamily: 'Oswald, sans-serif' }}
          >
            Don't follow trends. Create your own style.
          </p>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          className="max-w-6xl mx-auto bg-gradient-to-br from-red-600 to-red-800 p-12 md:p-20 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 text-center">
            <h2
              className="text-5xl md:text-7xl mb-6 tracking-tight"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              JOIN THE REBELLION
            </h2>
            <p
              className="text-xl md:text-2xl mb-10 text-white/90"
              style={{ fontFamily: 'Oswald, sans-serif' }}
            >
              Get 15% off your first order
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-6 py-4 bg-white text-black outline-none"
                style={{ fontFamily: 'Oswald, sans-serif' }}
              />
              <motion.button
                className="px-10 py-4 bg-black text-white tracking-widest hover:bg-white hover:text-black transition-colors duration-300"
                style={{ fontFamily: 'Oswald, sans-serif' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                SIGN UP
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-red-600/20 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <img src={logo} alt="ROCKWEAR" className="h-14 w-auto mb-4" />
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>
                Streetwear for rebellious souls
              </p>
            </div>

            <div>
              <h4 className="mb-4 tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>SHOP</h4>
              <ul className="space-y-2 text-gray-400 text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>
                <li><a href="#" className="hover:text-red-600 transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Tops</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Bottoms</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Accessories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>COMPANY</h4>
              <ul className="space-y-2 text-gray-400 text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>
                <li><a href="#" className="hover:text-red-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-red-600 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>FOLLOW</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-red-600/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <p>© 2026 ROCKWEAR. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-red-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
