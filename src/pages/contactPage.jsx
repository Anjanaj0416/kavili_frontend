import { FaLocationDot, FaPhoneVolume } from "react-icons/fa6";
import { GiRotaryPhone } from "react-icons/gi";
import { MdEmail } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ContactPage() {
    const [contactInfo, setContactInfo] = useState({
        shopName: "Udari Online Shop",
        address: "369/1/1, Kendaliyadda paluwa , Ganemulla.",
        phoneNumbers: [
            { type: "mobile", number: "+94 77 123 456" },
            { type: "mobile", number: "+94 77 123 456" },
            { type: "landline", number: "+94 77 123 456" },
            { type: "landline", number: "+94 77 123 456" }
        ],
        email: "anjan@.com",
        mapLink: ""
    });
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        fetchContactInfo();
        // Trigger animation after component mounts
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const fetchContactInfo = async () => {
        try {
            const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/contact");
            if (response.data.success && response.data.contact) {
                setContactInfo(response.data.contact);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching contact info:", error);
            // Keep default values on error
            setLoading(false);
        }
    };

    // Separate phone numbers by type
    const mobilePhones = contactInfo.phoneNumbers.filter(phone => phone.type === "mobile");
    const landlinePhones = contactInfo.phoneNumbers.filter(phone => phone.type === "landline");

    return (
        <div className="w-full min-h-screen bg-[#f5f0e8]">
            {/* Hero Section with Animation */}
            <div className="w-full h-[300px] bg-gradient-to-br from-[#c9a961] via-[#d4b876] to-[#e0c589] overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Animated Background Circles */}
                        
                            {/* Decorative circles */}
                           <div className="absolute right-50 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-90"></div>
                            <div className="absolute right-48 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-90"></div>
                            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-[#d4b876] to-[#c9a961] rounded-full opacity-80"></div>


                            {/* Additional spice piles */}
                            <div className="absolute left-50 top-1/3 w-48 h-48 bg-gradient-to-br from-[#e0c589] to-[#d4b876] rounded-full opacity-60"></div>
                            <div className="absolute left-70 top-2/3 w-40 h-40 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-50"></div>
                            <div className="absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-40"></div>
                       

                        {/* Animated Title */}
                        <h1 className={`absolute inset-0 flex items-center justify-center text-6xl font-extrabold text-white z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                            Get In Touch
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="w-full flex flex-col items-center justify-center py-16 gap-10 px-4">
                {/* Contact Information Card */}
                <div className={`w-full max-w-4xl transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {loading ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#c9a961]"></div>
                                <div className="absolute top-0 left-0 animate-ping rounded-full h-20 w-20 border-4 border-[#4a3728] opacity-30"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-500">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-[#c9a961]  to-[#c9a961] p-8 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#c9a961] to-[#c9a961] opacity-50 animate-pulse"></div>
                                <h1 className="text-4xl font-bold text-white mb-2 relative z-10 animate-fade-in">
                                    {contactInfo.shopName}
                                </h1>
                                <p className="text-orange-100 text-lg relative z-10">We'd love to hear from you</p>
                            </div>

                            {/* Contact Details Grid */}
                            <div className="p-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Address Section */}
                                    <div className={`group transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                                        <div className="flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-br from-[#f5f0e8] to-[#ede4d4] hover:from-[#ede4d4] hover:to-[#e5dac5] transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                            <div className="p-4 bg-[#c9a961] rounded-full group-hover:rotate-12 transition-transform duration-300">
                                                <FaLocationDot size={28} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">Our Location</h3>
                                                <p className="text-gray-600 leading-relaxed">{contactInfo.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Section */}
                                    <div className={`group transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                                        <div className="flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-br from-[#f5f0e8] to-[#ede4d4] hover:from-[#ede4d4] hover:to-[#e5dac5] transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                            <div className="p-4 bg-[#4a3728] rounded-full group-hover:rotate-12 transition-transform duration-300">
                                                <MdEmail size={28} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">Email Us</h3>
                                                <a href={`mailto:${contactInfo.email}`} className="text-[#c9a961] hover:text-[#b89551] hover:underline transition-all duration-200">
                                                    {contactInfo.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Phones Section */}
                                    <div className={`md:col-span-2 transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                        <div className="bg-gradient-to-br from-[#c9a961]/10 to-[#4a3728]/10 rounded-2xl p-6 border-2 border-[#c9a961]/20">
                                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                                <FaPhoneVolume size={24} className="mr-3 text-[#c9a961]" />
                                                Mobile Phones
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {mobilePhones.map((phone, index) => (
                                                    <div
                                                        key={`mobile-${index}`}
                                                        className="flex items-center space-x-3 p-4 bg-white rounded-xl hover:bg-[#f5f0e8] transition-all duration-300 hover:shadow-md group"
                                                        style={{ animationDelay: `${600 + index * 100}ms` }}
                                                    >
                                                        <div className="bg-[#c9a961] p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                                                            <FaPhoneVolume size={20} className="text-white" />
                                                        </div>
                                                        <a href={`tel:${phone.number}`} className="text-gray-700 font-medium group-hover:text-[#c9a961] transition-colors">
                                                            {phone.number}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Landline Phones Section */}
                                    {landlinePhones.length > 0 && (
                                        <div className={`md:col-span-2 transition-all duration-500 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                            <div className="bg-gradient-to-br from-[#4a3728]/10 to-[#645430]/10 rounded-2xl p-6 border-2 border-[#4a3728]/20">
                                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                                    <GiRotaryPhone size={24} className="mr-3 text-[#4a3728]" />
                                                    Landline Phones
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {landlinePhones.map((phone, index) => (
                                                        <div
                                                            key={`landline-${index}`}
                                                            className="flex items-center space-x-3 p-4 bg-white rounded-xl hover:bg-[#f5f0e8] transition-all duration-300 hover:shadow-md group"
                                                        >
                                                            <div className="bg-[#4a3728] p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                                                                <GiRotaryPhone size={20} className="text-white" />
                                                            </div>
                                                            <a href={`tel:${phone.number}`} className="text-gray-700 font-medium group-hover:text-[#4a3728] transition-colors">
                                                                {phone.number}
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Map Section (if available) */}
                {contactInfo.mapLink && (
                    <div className={`w-full max-w-4xl transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-500">
                            <div className="p-6">
                                <h2 className="text-3xl font-bold text-[#4a3728] mb-6 text-center">Find Us Here</h2>
                                <div
                                    className="rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform duration-500"
                                    dangerouslySetInnerHTML={{ __html: contactInfo.mapLink }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Call to Action */}
                <div className={`text-center transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <p className="text-[#b8915a] text-lg mb-4">Have questions? We're here to help!</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href={`mailto:${contactInfo.email}`}
                            className="px-8 py-4 bg-gradient-to-r from-[#c9a961] to-[#b89551] text-white font-semibold rounded-full hover:from-[#b89551] hover:to-[#a88442] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Send us an Email
                        </a>
                        {mobilePhones.length > 0 && (
                            <a
                                href={`tel:${mobilePhones[0].number}`}
                                className="px-8 py-4 bg-gradient-to-r from-[#4a3728] to-[#645430] text-white font-semibold rounded-full hover:from-[#3a2818] hover:to-[#543620] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Call Us Now
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }

                .delay-75 {
                    animation-delay: 75ms;
                }

                .delay-100 {
                    animation-delay: 100ms;
                }

                .delay-150 {
                    animation-delay: 150ms;
                }

                .delay-200 {
                    animation-delay: 200ms;
                }
            `}</style>
        </div>
    );
}