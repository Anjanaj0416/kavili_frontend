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
        <div className="flex flex-col w-full min-h-screen bg-orange-100 overflow-y-scroll">
            {/* Header Section */}
            <div className="w-full h-[300px] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-300 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Decorative circles */}
                        <div className="absolute right-50 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-48 top-1/2 transform -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-90"></div>
                        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-80"></div>
                        <div className="absolute left-50 top-1/3 w-48 h-48 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-60"></div>
                        <div className="absolute left-70 top-2/3 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-50"></div>
                        <div className="absolute left-[300px] top-1/2 w-56 h-56 bg-gradient-to-br from-orange-600 to-red-600 rounded-full opacity-40"></div>
                    </div>
                </div>
                <div className="w-full h-full flex items-center justify-center my-9">
                    <span className="text-6xl font-bold text-white flex text-center">About Us</span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            ) : (
                <div className="w-full max-w-7xl mx-auto px-4 py-12 space-y-16">
                    {/* Company Overview Section */}
                    <section className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-4xl font-bold text-orange-600 mb-6">
                            {aboutInfo.companyOverview.title}
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed mb-8">
                            {aboutInfo.companyOverview.description}
                        </p>
                        
                        {/* Company Images */}
                        {aboutInfo.companyOverview.images.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                {aboutInfo.companyOverview.images.map((image, index) => (
                                    <div key={index} className="overflow-hidden rounded-lg shadow-md">
                                        <img 
                                            src={image} 
                                            alt={`${aboutInfo.companyOverview.title} ${index + 1}`}
                                            className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Story Section */}
                    <section className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-4xl font-bold text-orange-600 mb-6">
                            {aboutInfo.story.title}
                        </h2>
                        <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                            {aboutInfo.story.description}
                        </div>
                    </section>

                    {/* Team Section */}
                    {aboutInfo.teamMembers.length > 0 && (
                        <section className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-4xl font-bold text-orange-600 mb-8 text-center">
                                Meet Our Team
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {aboutInfo.teamMembers.map((member, index) => (
                                    <div key={index} className="bg-orange-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                                        {/* Team Member Image */}
                                        {member.image ? (
                                            <div className="w-full h-64 overflow-hidden">
                                                <img 
                                                    src={member.image} 
                                                    alt={member.name}
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-64 bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center">
                                                <span className="text-6xl font-bold text-white">
                                                    {member.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Team Member Details */}
                                        <div className="p-6">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                                {member.name}
                                            </h3>
                                            <p className="text-orange-600 font-semibold mb-3">
                                                {member.position}
                                            </p>
                                            <p className="text-gray-700 leading-relaxed">
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