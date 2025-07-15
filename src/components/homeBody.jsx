import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryDisplay = ({ onCategoryClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    // Try to fetch categories from API, fallback to default
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/products/categories');
      const data = await response.json();
      
      // Map API response to component format
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
      // Navigate to ProductPage with selected category
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
    <div className="w-full min-h-screen bg-gradient-to-br from-orange-500 via-orange-300 to-orange-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white rounded-lg shadow-lg px-8 py-4">
            <h1 className="text-4xl font-bold text-orange-600">Our Categories</h1>
          </div>
        </div>

        {/* Category Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-orange-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
          >
            <ChevronRight className="w-6 h-6 text-orange-600" />
          </button>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-12">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : (
              getCurrentItems().map((category, index) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <button 
            onClick={() => handleCategoryClick('ALL')}
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors duration-200 shadow-lg"
          >
            View All Products
          </button>
        </div>
      </div>
    </div>
  );
};

// HomeBody component using the CategoryDisplay
export default function HomeBody() {
  return <CategoryDisplay />;
}