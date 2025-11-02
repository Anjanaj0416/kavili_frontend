import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Mail, MapPin, Phone, Building2, Plus, Trash2, Save } from "lucide-react";

export default function AdminContactManagement() {
    const [contactInfo, setContactInfo] = useState({
        shopName: "",
        address: "",
        phoneNumbers: [],
        email: ""
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
        // Validation
        if (!contactInfo.shopName.trim()) {
            toast.error("Shop name is required");
            return;
        }
        if (!contactInfo.address.trim()) {
            toast.error("Address is required");
            return;
        }
        if (!contactInfo.email.trim()) {
            toast.error("Email is required");
            return;
        }
        if (contactInfo.phoneNumbers.length === 0) {
            toast.error("At least one phone number is required");
            return;
        }
        
        // Check if all phone numbers are filled
        const hasEmptyPhone = contactInfo.phoneNumbers.some(phone => !phone.number.trim());
        if (hasEmptyPhone) {
            toast.error("Please fill in all phone numbers or remove empty ones");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("authToken");
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
                fetchContactInfo(); // Refresh data
            }
        } catch (error) {
            console.error("Error updating contact info:", error);
            toast.error(error.response?.data?.message || "Failed to update contact information");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading contact information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-full">
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
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    <Phone size={18} className="inline mr-2" />
                                    Phone Numbers *
                                </label>
                                <button
                                    onClick={addPhoneNumber}
                                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <Plus size={16} className="mr-1" />
                                    Add Phone
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {contactInfo.phoneNumbers.map((phone, index) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <select
                                            value={phone.type}
                                            onChange={(e) => handlePhoneNumberChange(index, "type", e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        Make sure all information is accurate and up-to-date.
                    </p>
                </div>
            </div>
        </div>
    );
}