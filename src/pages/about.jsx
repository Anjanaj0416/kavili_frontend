import { useEffect, useState } from "react";
import axios from "axios";

export default function About() {
    const [aboutInfo, setAboutInfo] = useState({
        companyOverview: {
            title: "Welcome to Udari Online Shop",
            description: "We are a leading spice retailer providing high-quality authentic spices.",
            images: []
        },
        story: {
            title: "Our Story",
            description: "Founded with a passion for authentic flavors..."
        },
        teamMembers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAboutInfo();
    }, []);

    const fetchAboutInfo = async () => {
        try {
            const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/about");
            if (response.data.success && response.data.about) {
                setAboutInfo(response.data.about);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching about info:", error);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#f5f0e8] overflow-y-scroll">
            {/* Header Section - Mobile Responsive */}
            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-gradient-to-br from-[#c9a961] via-[#d4b876] to-[#e0c589] overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Main spice pile - hidden on mobile */}
                        <div className="hidden sm:block absolute right-50 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-90"></div>
                        <div className="hidden sm:block absolute right-48 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-90"></div>
                        <div className="hidden sm:block absolute right-16 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-[#d4b876] to-[#c9a961] rounded-full opacity-80"></div>

                        {/* Additional spice piles - hidden on mobile */}
                        <div className=" md:block absolute left-50 top-1/3 w-48 h-48 bg-gradient-to-br from-[#e0c589] to-[#d4b876] rounded-full opacity-60"></div>
                        <div className="hidden md:block absolute left-70 top-2/3 w-40 h-40 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-50"></div>
                        <div className=" md:block absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-[#c9a961] to-[#b89551] rounded-full opacity-40"></div>
                    </div>
                </div>
                <div className="w-full h-full flex items-center justify-center px-4">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center">About Us</span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 sm:py-20">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#c9a961]"></div>
                </div>
            ) : (
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
                    {/* Company Overview Section - Mobile Responsive */}
                    <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#c9a961] mb-4 sm:mb-6">
                            {aboutInfo.companyOverview.title}
                        </h2>
                        <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8">
                            {aboutInfo.companyOverview.description}
                        </p>
                        
                        {/* Company Images - Mobile Responsive Grid */}
                        {aboutInfo.companyOverview.images.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                                {aboutInfo.companyOverview.images.map((image, index) => (
                                    <div key={index} className="overflow-hidden rounded-lg shadow-md">
                                        <img 
                                            src={image} 
                                            alt={`${aboutInfo.companyOverview.title} ${index + 1}`}
                                            className="w-full h-48 sm:h-56 md:h-64 object-cover hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Story Section - Mobile Responsive */}
                    <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#c9a961] mb-4 sm:mb-6">
                            {aboutInfo.story.title}
                        </h2>
                        <div className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                            {aboutInfo.story.description}
                        </div>
                    </section>

                    {/* Team Section - Mobile Responsive */}
                    {aboutInfo.teamMembers.length > 0 && (
                        <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#c9a961] mb-6 sm:mb-8 text-center">
                                Meet Our Team
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {aboutInfo.teamMembers.map((member, index) => (
                                    <div key={index} className="bg-orange-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                                        {/* Team Member Image */}
                                        {member.image ? (
                                            <div className="w-full h-56 sm:h-64 overflow-hidden">
                                                <img 
                                                    src={member.image} 
                                                    alt={member.name}
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-56 sm:h-64 bg-gradient-to-br from-[#c9a961] bg-opacity-20 to-[#c9a961] flex items-center justify-center">
                                                <span className="text-5xl sm:text-6xl font-bold text-white">
                                                    {member.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Team Member Details */}
                                        <div className="p-4 sm:p-6">
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                                                {member.name}
                                            </h3>
                                            <p className="text-[#c9a961] font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                                                {member.position}
                                            </p>
                                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                                {member.bio}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}