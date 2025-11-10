import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#f5f0e8]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* CONTACT Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">CONTACT</h3>
            <div className="space-y-2 text-sm">
              <p>B/521/2C, Karangawa, Ampara,</p>
              <p>32000</p>
              <p className="mt-3">071 098 4316</p>
              <p>hello@kavili.lk</p>
            </div>
          </div>

          {/* WORKING Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">WORKING</h3>
            <div className="space-y-2 text-sm">
              <p>Weekdays 8:00 - 18:00</p>
              <p>Weekend 8:00 - 14:00</p>
            </div>
          </div>

          {/* HELP Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">HELP</h3>
            <div className="space-y-2 text-sm">
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">GET IN TOUCH</h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#c9a961] hover:bg-[#b89551] rounded flex items-center justify-center transition-colors"
              >
                <FaFacebookF className="text-white text-lg" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#c9a961] hover:bg-[#b89551] rounded flex items-center justify-center transition-colors"
              >
                <FaInstagram className="text-white text-lg" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#c9a961] hover:bg-[#b89551] rounded flex items-center justify-center transition-colors"
              >
                <FaTiktok className="text-white text-lg" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#c9a961] hover:bg-[#b89551] rounded flex items-center justify-center transition-colors"
              >
                <FaYoutube className="text-white text-lg" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      {/*
      <div className="border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-600">
            Copyright © 2025 Kavili.lk™. All rights reserved.
          </p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <Link to="/privacy-policy" className="text-gray-700 hover:text-[#c9a961] transition-colors font-medium">
              PRIVACY POLICY
            </Link>
            <Link to="/terms-of-use" className="text-gray-700 hover:text-[#c9a961] transition-colors font-medium">
              TERMS OF USE
            </Link>
          </div>
        </div>
      </div>*/}
    </footer>
  );
}