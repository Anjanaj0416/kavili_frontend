import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Admin WhatsApp number and name
  const adminWhatsApp = '0714289356';
  const adminName = 'Anjana Jayasinghe';
  const adminRole = 'Support';

  // Show widget when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle WhatsApp chat redirect
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hello, I need help with...');
    const whatsappUrl = `https://wa.me/${adminWhatsApp.replace(/^0/, '94')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Main WhatsApp Button */}
      <div
        className={`fixed right-6 bottom-6 z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        {/* Popup Card */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 mb-2 bg-white rounded-lg shadow-2xl p-4 w-72 animate-slide-up">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-[#c9a961] font-bold text-lg">HELLO!</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-700 text-sm mb-4">
              Click one of our contacts below to chat on WhatsApp
            </p>

            {/* Admin Contact Card */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-3 flex items-center gap-3 transition-colors border border-gray-200"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-[#c9a961] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {adminName.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-500 text-xs">{adminRole}</p>
                <p className="font-semibold text-gray-800">{adminName}</p>
              </div>
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Social Chat is free, you can also chat with us
              
            </p>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#4a3728] hover:bg-[#3a2818] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 group"
        >
          <MessageCircle size={24} className="animate-pulse" />
          <span className="font-medium">How can I help you?</span>
        </button>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default WhatsAppWidget;