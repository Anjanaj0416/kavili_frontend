import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#f5f0e8]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* CONTACT Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">CONTACT</h3>
            <div className="space-y-1.5 sm:space-y-2 text-sm">
              <p>B/521/2C, Karangawa, Ampara,</p>
              <p>32000</p>
              <p className="mt-2 sm:mt-3">071 098 4316</p>
              <p className="break-all">hello@kavili.lk</p>
            </div>
          </div>

          {/* WORKING Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">WORKING</h3>
            <div className="space-y-1.5 sm:space-y-2 text-sm">
              <p>Weekdays 8:00 - 18:00</p>
              <p>Weekend 8:00 - 14:00</p>
            </div>
          </div>

          {/* HELP Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">HELP</h3>
            <div className="space-y-1.5 sm:space-y-2 text-sm">
              <Link to="/contact" className="block hover:text-[#c9a961] transition-colors">
                Contact Us
              </Link>
              <Link to="/faq" className="block hover:text-[#c9a961] transition-colors">
                FAQ
              </Link>
              <Link to="/returns" className="block hover:text-[#c9a961] transition-colors">
                Returns & Refunds
              </Link>
            </div>
          </div>

          {/* GET IN TOUCH Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">GET IN TOUCH</h3>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#c9a961] hover:bg-[#b89551] rounded flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF className="text-white text-base sm:text-lg" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#c9a961] hover:bg-[#b89551] rounded flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="text-white text-base sm:text-lg" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#c9a961] hover:bg-[#b89551] rounded flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok className="text-white text-base sm:text-lg" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#c9a961] hover:bg-[#b89551] rounded flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="text-white text-base sm:text-lg" />
              </a>
              <a
                href="https://wa.me/94710984316"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#c9a961] hover:bg-[#b89551] rounded flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-white text-base sm:text-lg" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar 
      <div className="border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              © 2024 Kavili. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 text-xs sm:text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-[#c9a961] transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-400">•</span>
              <Link to="/terms" className="text-gray-600 hover:text-[#c9a961] transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-400">•</span>
              <Link to="/cookies" className="text-gray-600 hover:text-[#c9a961] transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>*/}
    </footer>
  );
}