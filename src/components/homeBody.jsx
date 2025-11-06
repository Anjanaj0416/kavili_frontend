import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const CategoryDisplay = ({ onCategoryClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Default categories with images (fallback if API fails)
  const defaultCategories = [
    {
      id: 'electronics',
      name: 'Electronics',
      description: 'Latest gadgets and devices',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop'
    },
    {
      id: 'clothing',
      name: 'Clothing',
      description: 'Fashion and apparel',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
    },
    {
      id: 'home',
      name: 'Home & Garden',
      description: 'Home essentials and decor',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    },
    {
      id: 'food',
      name: 'Food & Beverages',
      description: 'Fresh and packaged foods',
      image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=300&fit=crop'
    },
    {
      id: 'furniture',
      name: 'Furniture',
      description: 'Quality furniture pieces',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    }
  ];

  useEffect(() => {
    fetchCategories();
    // Trigger animations after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      const data = await response.json();
      
      const mappedCategories = data.categories?.map(cat => ({
        id: cat._id,
        name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
        description: `${cat.count} products available`,
        image: getImageForCategory(cat._id)
      })) || defaultCategories;
      
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const getImageForCategory = (categoryId) => {
    const imageMap = {
      'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      'clothing': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      'food': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=300&fit=crop',
      'furniture': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    };
    return imageMap[categoryId] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
  };

  const handleCategoryClick = (categoryId) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    } else {
      window.location.href = `/products/${categoryId}`;
    }
  };

  const itemsPerSlide = 4;
  const totalSlides = Math.ceil(categories.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const getCurrentItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return categories.slice(startIndex, startIndex + itemsPerSlide);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-orange-500 via-orange-300 to-orange-100 py-16 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-red-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Animated Header */}
        <div className={`flex items-center justify-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-70"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl px-12 py-6 transform group-hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-orange-600 animate-pulse" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Discover Our Categories
                </h1>
                <Sparkles className="w-8 h-8 text-orange-600 animate-pulse animation-delay-500" />
              </div>
              <p className="text-center text-gray-600 mt-2 text-lg">Explore our wide range of products</p>
            </div>
          </div>
        </div>

        {/* Category Carousel */}
        <div className={`relative transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-20 bg-white hover:bg-orange-50 rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8 text-orange-600 group-hover:text-orange-700" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-20 bg-white hover:bg-orange-50 rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8 text-orange-600 group-hover:text-orange-700" />
          </button>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-16 py-8">
            {loading ? (
              // Enhanced Loading Skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : (
              getCurrentItems().map((category, index) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  onMouseEnter={() => setHoveredCard(category.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:shadow-3xl hover:-translate-y-3 group ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    animationDelay: `${300 + index * 100}ms`,
                    transitionDelay: `${index * 50}ms`
                  }}
                >
                  {/* Image Container with Overlay */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        hoveredCard === category.id ? 'scale-125' : 'scale-100'
                      }`}
                    />
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 ${
                      hoveredCard === category.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                          View Products →
                        </span>
                      </div>
                    </div>
                    
                    {/* Shine Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 transition-all duration-1000 ${
                      hoveredCard === category.id ? 'translate-x-full' : '-translate-x-full'
                    }`}></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 bg-gradient-to-br from-white to-orange-50 group-hover:from-orange-50 group-hover:to-orange-100 transition-all duration-500">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {category.description}
                    </p>
                    
                    {/* Decorative Line */}
                    <div className="mt-4 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Animated Dots Indicator */}
          <div className="flex justify-center mt-12 space-x-3">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-500 rounded-full ${
                  index === currentSlide 
                    ? 'w-12 h-4 bg-white shadow-lg' 
                    : 'w-4 h-4 bg-white/50 hover:bg-white/70 hover:scale-110'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-70 animate-pulse"></div>
            <button 
              onClick={() => handleCategoryClick('ALL')}
              className="relative bg-white text-orange-600 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white transition-all duration-500 shadow-2xl transform hover:scale-110 hover:-translate-y-1"
            >
              <span className="flex items-center space-x-3">
                <span>Explore All Products</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </button>
          </div>
          
          {/* Floating Elements */}
          <div className="mt-8 flex justify-center space-x-8">
            <div className="text-center animate-float">
              <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-2 group-hover:shadow-xl transition-shadow duration-300">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-white font-medium">Quality Products</p>
            </div>
            <div className="text-center animate-float animation-delay-1000">
              <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-white font-medium">Fast Delivery</p>
            </div>
            <div className="text-center animate-float animation-delay-2000">
              <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-white font-medium">Best Prices</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 50px) scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

// HomeBody component using the CategoryDisplay
export default function HomeBody() {
  return <CategoryDisplay />;
}