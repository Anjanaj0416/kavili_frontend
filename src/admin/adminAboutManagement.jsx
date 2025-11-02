import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Building2, BookOpen, Users, Plus, Trash2, Save, Upload, Image as ImageIcon } from "lucide-react";
import convertImageToBase64 from "../utils/imageToBase64";

export default function AdminAboutManagement() {
    const [aboutInfo, setAboutInfo] = useState({
        companyOverview: {
            title: "",
            description: "",
            images: []
        },
        story: {
            title: "",
            description: ""
        },
        teamMembers: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        fetchAboutInfo();
    }, []);

    const fetchAboutInfo = async () => {
        try {
            const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/about");
            if (response.data.success) {
                setAboutInfo(response.data.about);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching about info:", error);
            toast.error("Failed to load about information");
            setLoading(false);
        }
    };

    const handleCompanyImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImages(true);
        try {
            const uploadPromises = files.map(async (file) => {
                try {
                    const base64String = await convertImageToBase64(file);
                    return base64String;
                } catch (err) {
                    console.error("Error converting file:", file.name, err);
                    throw err;
                }
            });
            
            const imageBase64Strings = await Promise.all(uploadPromises);
            console.log("Images converted successfully:", imageBase64Strings.length, "images");
            
            setAboutInfo(prev => ({
                ...prev,
                companyOverview: {
                    ...prev.companyOverview,
                    images: [...prev.companyOverview.images, ...imageBase64Strings]
                }
            }));
            toast.success(`${imageBase64Strings.length} image(s) uploaded successfully`);
        } catch (error) {
            console.error("Error uploading images:", error);
            toast.error(error.message || "Failed to upload images");
        } finally {
            setUploadingImages(false);
            // Clear the input so the same file can be selected again
            e.target.value = '';
        }
    };

    const handleTeamImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImages(true);
        try {
            console.log("Converting team member image:", file.name);
            const base64String = await convertImageToBase64(file);
            console.log("Team member image converted successfully");
            
            const updatedTeam = [...aboutInfo.teamMembers];
            updatedTeam[index] = {
                ...updatedTeam[index],
                image: base64String
            };
            
            setAboutInfo(prev => ({
                ...prev,
                teamMembers: updatedTeam
            }));
            toast.success("Team member image uploaded successfully");
        } catch (error) {
            console.error("Error uploading team image:", error);
            toast.error(error.message || "Failed to upload team member image");
        } finally {
            setUploadingImages(false);
            // Clear the input so the same file can be selected again
            e.target.value = '';
        }
    };

    const removeCompanyImage = (indexToRemove) => {
        setAboutInfo(prev => ({
            ...prev,
            companyOverview: {
                ...prev.companyOverview,
                images: prev.companyOverview.images.filter((_, index) => index !== indexToRemove)
            }
        }));
    };

    const handleCompanyOverviewChange = (field, value) => {
        setAboutInfo(prev => ({
            ...prev,
            companyOverview: {
                ...prev.companyOverview,
                [field]: value
            }
        }));
    };

    const handleStoryChange = (field, value) => {
        setAboutInfo(prev => ({
            ...prev,
            story: {
                ...prev.story,
                [field]: value
            }
        }));
    };

    const handleTeamMemberChange = (index, field, value) => {
        const updatedTeam = [...aboutInfo.teamMembers];
        updatedTeam[index] = {
            ...updatedTeam[index],
            [field]: value
        };
        setAboutInfo(prev => ({
            ...prev,
            teamMembers: updatedTeam
        }));
    };

    const addTeamMember = () => {
        setAboutInfo(prev => ({
            ...prev,
            teamMembers: [...prev.teamMembers, { 
                name: "", 
                position: "", 
                bio: "", 
                image: "",
                order: prev.teamMembers.length 
            }]
        }));
    };

    const removeTeamMember = (index) => {
        if (aboutInfo.teamMembers.length <= 0) return;
        const updatedTeam = aboutInfo.teamMembers.filter((_, i) => i !== index);
        setAboutInfo(prev => ({
            ...prev,
            teamMembers: updatedTeam
        }));
    };

    const handleSave = async () => {
        // Validation
        if (!aboutInfo.companyOverview.title.trim()) {
            toast.error("Company overview title is required");
            return;
        }
        if (!aboutInfo.companyOverview.description.trim()) {
            toast.error("Company overview description is required");
            return;
        }
        if (!aboutInfo.story.title.trim()) {
            toast.error("Story title is required");
            return;
        }
        if (!aboutInfo.story.description.trim()) {
            toast.error("Story description is required");
            return;
        }

        // Validate team members
        for (let i = 0; i < aboutInfo.teamMembers.length; i++) {
            const member = aboutInfo.teamMembers[i];
            if (!member.name.trim() || !member.position.trim() || !member.bio.trim()) {
                toast.error(`Please fill in all fields for team member ${i + 1} or remove them`);
                return;
            }
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.put(
                import.meta.env.VITE_BACKEND_URL + "/api/about",
                aboutInfo,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data.success) {
                toast.success("About information updated successfully");
                fetchAboutInfo();
            }
        } catch (error) {
            console.error("Error updating about info:", error);
            toast.error(error.response?.data?.message || "Failed to update about information");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading about information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-full overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">About Us Management</h1>
                            <p className="text-gray-600 mt-2">Manage your shop's about page content</p>
                        </div>
                        <BookOpen size={48} className="text-blue-600" />
                    </div>
                </div>

                {/* Company Overview Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <Building2 size={24} className="mr-2 text-blue-600" />
                        Company Overview
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                            <input
                                type="text"
                                value={aboutInfo.companyOverview.title}
                                onChange={(e) => handleCompanyOverviewChange("title", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter company overview title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                            <textarea
                                value={aboutInfo.companyOverview.description}
                                onChange={(e) => handleCompanyOverviewChange("description", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter company overview description"
                                rows="5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <ImageIcon size={18} className="inline mr-2" />
                                Company Images
                            </label>
                            
                            {/* Display existing images */}
                            {aboutInfo.companyOverview.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {aboutInfo.companyOverview.images.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img 
                                                src={img} 
                                                alt={`Company ${index + 1}`} 
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => removeCompanyImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload button */}
                            <div className="flex items-center">
                                <label className="cursor-pointer flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Upload size={20} className="mr-2" />
                                    {uploadingImages ? "Uploading..." : "Upload Images"}
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleCompanyImageUpload}
                                        className="hidden"
                                        disabled={uploadingImages}
                                    />
                                </label>
                                <span className="ml-3 text-sm text-gray-500">You can upload multiple images</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Story Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <BookOpen size={24} className="mr-2 text-blue-600" />
                        Our Story / Background
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                            <input
                                type="text"
                                value={aboutInfo.story.title}
                                onChange={(e) => handleStoryChange("title", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter story title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                            <textarea
                                value={aboutInfo.story.description}
                                onChange={(e) => handleStoryChange("description", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your company's story or background"
                                rows="6"
                            />
                        </div>
                    </div>
                </div>

                {/* Team Members Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Users size={24} className="mr-2 text-blue-600" />
                            Our Team
                        </h2>
                        <button
                            onClick={addTeamMember}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} className="mr-2" />
                            Add Team Member
                        </button>
                    </div>

                    {aboutInfo.teamMembers.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No team members added yet. Click "Add Team Member" to get started.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {aboutInfo.teamMembers.map((member, index) => (
                                <div key={index} className="border border-gray-300 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Team Member #{index + 1}
                                        </h3>
                                        <button
                                            onClick={() => removeTeamMember(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                            <input
                                                type="text"
                                                value={member.name}
                                                onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                                            <input
                                                type="text"
                                                value={member.position}
                                                onChange={(e) => handleTeamMemberChange(index, "position", e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter position"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
                                            <textarea
                                                value={member.bio}
                                                onChange={(e) => handleTeamMemberChange(index, "bio", e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter bio"
                                                rows="3"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                                            
                                            {member.image && (
                                                <div className="mb-3 relative inline-block">
                                                    <img 
                                                        src={member.image} 
                                                        alt={member.name} 
                                                        className="w-32 h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        onClick={() => handleTeamMemberChange(index, "image", "")}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                                                        title="Remove photo"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}

                                            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                                <Upload size={18} className="mr-2" />
                                                {member.image ? "Change Photo" : "Upload Photo"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleTeamImageUpload(e, index)}
                                                    className="hidden"
                                                    disabled={uploadingImages}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pb-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 text-lg font-semibold"
                    >
                        <Save size={24} className="mr-2" />
                        {saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>

                {/* Info Note */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> All information will be displayed on the public About Us page.
                        Make sure all content is accurate and professional.
                    </p>
                </div>
            </div>
        </div>
    );
}