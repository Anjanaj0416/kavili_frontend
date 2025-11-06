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

    useEffect(() => {
        fetchContactInfo();
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
        <div className="w-full min-h-screen bg-orange-100">
            <div className="w-full h-[300px] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Main spice pile */}
                        <div className="absolute right-50 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-48 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-80"></div>

                        {/* Additional decorative elements */}
                        <div className="absolute left-20 top-1/3 w-60 h-60 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full opacity-70"></div>
                        <div className="absolute left-40 bottom-10 w-52 h-52 bg-gradient-to-br from-red-500 to-orange-700 rounded-full opacity-60"></div>

                        <h1 className="absolute inset-0 flex items-center justify-center text-6xl font-extrabold text-white z-10">
                            Contact Us
                        </h1>
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col items-center justify-center py-10 gap-10">
                {/* Contact Information Box */}
                <div className="w-[600px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                        </div>
                    ) : (
                        <div className="w-[600px] h-[400px] flex flex-col bg-orange-100">
                            <div>
                                <h1 className="text-3xl font-bold text-center my-5 text-orange-600">
                                    {contactInfo.shopName}
                                </h1>
                            </div>
                            
                            <div className="flex flex-col items-start justify-center gap-3 my-10">
                                {/* Address */}
                                <div className="flex flex-row items-center space-x-4 mx-4">
                                    <FaLocationDot size={24} />
                                    <span>{contactInfo.address}</span>
                                </div>
                                
                                {/* Mobile Phones */}
                                {mobilePhones.map((phone, index) => (
                                    <div key={`mobile-${index}`} className="flex flex-row items-center space-x-4 mx-4">
                                        <FaPhoneVolume size={24} />
                                        <span>{phone.number}</span>
                                    </div>
                                ))}
                                
                                {/* Landline Phones */}
                                {landlinePhones.map((phone, index) => (
                                    <div key={`landline-${index}`} className="flex flex-row items-center space-x-4 mx-4">
                                        <GiRotaryPhone size={24} />
                                        <span>{phone.number}</span>
                                    </div>
                                ))}
                                
                                {/* Email */}
                                <div className="flex flex-row items-center space-x-4 mx-4">
                                    <MdEmail size={24} />
                                    <span>{contactInfo.email}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Google Map Section */}
                {contactInfo.mapLink && contactInfo.mapLink.trim() !== "" && (
                    <div className="w-full max-w-[900px] px-4">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-orange-600 px-6 py-4">
                                <h2 className="text-2xl font-bold text-white flex items-center">
                                    <FaLocationDot className="mr-3" size={28} />
                                    Find Us on the Map
                                </h2>
                                <p className="text-orange-100 mt-1">Visit our store or use the map below to get directions</p>
                            </div>
                            
                            <div className="p-4 sm:p-6">
                                <div 
                                    className="w-full overflow-hidden rounded-lg"
                                    dangerouslySetInnerHTML={{ __html: contactInfo.mapLink }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}