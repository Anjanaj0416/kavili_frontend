import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Mail, MapPin, Phone, Building2, Plus, Trash2, Save, Map } from "lucide-react";

export default function AdminContactManagement() {
    const [contactInfo, setContactInfo] = useState({
        shopName: "",
        address: "",
        phoneNumbers: [],
        email: "",
        mapLink: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/contact");
            if (response.data.success) {
                setContactInfo(response.data.contact);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching contact info:", error);
            toast.error("Failed to load contact information");
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setContactInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePhoneNumberChange = (index, field, value) => {
        const updatedPhones = [...contactInfo.phoneNumbers];
        updatedPhones[index] = {
            ...updatedPhones[index],
            [field]: value
        };
        setContactInfo(prev => ({
            ...prev,
            phoneNumbers: updatedPhones
        }));
    };

    const addPhoneNumber = () => {
        setContactInfo(prev => ({
            ...prev,
            phoneNumbers: [...prev.phoneNumbers, { type: "mobile", number: "" }]
        }));
    };

    const removePhoneNumber = (index) => {
        if (contactInfo.phoneNumbers.length <= 1) {
            toast.error("At least one phone number is required");
            return;
        }
        const updatedPhones = contactInfo.phoneNumbers.filter((_, i) => i !== index);
        setContactInfo(prev => ({
            ...prev,
            phoneNumbers: updatedPhones
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Validation
            if (!contactInfo.shopName || !contactInfo.address || !contactInfo.email) {
                toast.error("Please fill in all required fields");
                setSaving(false);
                return;
            }

            if (contactInfo.phoneNumbers.length === 0) {
                toast.error("At least one phone number is required");
                setSaving(false);
                return;
            }

            // Check if any phone number is empty
            const hasEmptyPhone = contactInfo.phoneNumbers.some(phone => !phone.number);
            if (hasEmptyPhone) {
                toast.error("Please fill in all phone numbers");
                setSaving(false);
                return;
            }

            // Get auth token from localStorage
            const token = localStorage.getItem("authToken");
            
            if (!token) {
                toast.error("Authentication required. Please login again.");
                setSaving(false);
                return;
            }

            const response = await axios.put(
                import.meta.env.VITE_BACKEND_URL + "/api/contact",
                contactInfo,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data.success) {
                toast.success("Contact information updated successfully");
            } else {
                toast.error("Failed to update contact information");
            }
        } catch (error) {
            console.error("Error saving contact info:", error);
            
            // Handle specific error cases
            if (error.response?.status === 403) {
                toast.error("Access denied. Admin privileges required.");
            } else if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            } else {
                toast.error(error.response?.data?.message || "Failed to update contact information");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 w-full">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Contact Information</h1>
                            <p className="text-gray-600 mt-2">Manage your shop's contact details</p>
                        </div>
                        <Building2 size={48} className="text-blue-600" />
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="space-y-6">
                        {/* Shop Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Building2 size={18} className="inline mr-2" />
                                Shop Name *
                            </label>
                            <input
                                type="text"
                                value={contactInfo.shopName}
                                onChange={(e) => handleInputChange("shopName", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter shop name"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={18} className="inline mr-2" />
                                Address *
                            </label>
                            <textarea
                                value={contactInfo.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter shop address"
                                rows="3"
                            />
                        </div>

                        {/* Phone Numbers */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone size={18} className="inline mr-2" />
                                Phone Numbers *
                            </label>
                            <div className="space-y-3">
                                {contactInfo.phoneNumbers.map((phone, index) => (
                                    <div key={index} className="flex gap-3">
                                        <select
                                            value={phone.type}
                                            onChange={(e) => handlePhoneNumberChange(index, "type", e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="mobile">Mobile</option>
                                            <option value="landline">Landline</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={phone.number}
                                            onChange={(e) => handlePhoneNumberChange(index, "number", e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter phone number"
                                        />
                                        <button
                                            onClick={() => removePhoneNumber(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            disabled={contactInfo.phoneNumbers.length === 1}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                                
                                <button
                                    onClick={addPhoneNumber}
                                    className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Plus size={20} className="mr-2" />
                                    Add Phone Number
                                </button>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail size={18} className="inline mr-2" />
                                Email *
                            </label>
                            <input
                                type="email"
                                value={contactInfo.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter email address"
                            />
                        </div>

                        {/* Map Embed Code - Updated with better instructions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Map size={18} className="inline mr-2" />
                                Google Maps Embed Code (iframe)
                            </label>
                            <textarea
                                value={contactInfo.mapLink || ""}
                                onChange={(e) => handleInputChange("mapLink", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
                                rows="6"
                            />
                            <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-sm text-gray-800 font-bold mb-3 flex items-center">
                                    <Map size={16} className="mr-2 text-orange-600" />
                                    📍 How to get Google Maps embed code with RED PIN marker:
                                </p>
                                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside ml-2">
                                    <li>Go to <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Google Maps</a></li>
                                    <li><strong>Search for your exact location/address</strong> in the search bar</li>
                                    <li>Once the red pin appears on your location, click the <strong>"Share"</strong> button on the left panel</li>
                                    <li>In the popup, click the <strong>"Embed a map"</strong> tab</li>
                                    <li>Select map size (Medium or Large recommended)</li>
                                    <li>Copy the entire <code className="bg-gray-200 px-2 py-1 rounded text-xs">&lt;iframe src="..."&gt;&lt;/iframe&gt;</code> code</li>
                                    <li>Paste it in the text box above</li>
                                </ol>
                                <div className="mt-3 p-3 bg-white border border-orange-300 rounded">
                                    <p className="text-xs text-gray-600">
                                        <strong className="text-orange-600">💡 Tip:</strong> Make sure the red pin marker is visible on your exact location before copying the embed code. 
                                        This will ensure customers see your location with the red marker on the contact page!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                            >
                                <Save size={20} className="mr-2" />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> These contact details will be displayed on the public Contact Us page.
                        Make sure all information is accurate and up-to-date. The map will display with a red pin marker
                        showing your location, and customers can click "Get Directions" to open in Google Maps.
                    </p>
                </div>
            </div>
        </div>
    );
}