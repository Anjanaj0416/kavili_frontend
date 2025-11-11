/**
 * Upload images directly to MongoDB as Base64 strings
 * No external storage service needed!
 */

export default function uploadMediaToMongoDB(file) {
    return new Promise((resolve, reject) => {
        // Validate file
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            reject(new Error("Please select a valid image file (JPG, PNG, GIF, or WebP)"));
            return;
        }

        // Validate file size (max 5MB for better performance)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            reject(new Error("Image size must be less than 5MB. Please compress or resize your image."));
            return;
        }

        console.log('📤 Converting image to Base64:', file.name);
        console.log('📦 File size:', (file.size / 1024).toFixed(2), 'KB');

        const reader = new FileReader();
        
        reader.onload = (e) => {
            const base64String = e.target.result;
            console.log('✅ Image converted successfully');
            console.log('📊 Base64 length:', base64String.length);
            resolve(base64String);
        };
        
        reader.onerror = (error) => {
            console.error('❌ Error reading file:', error);
            reject(new Error('Failed to read image file'));
        };
        
        // Convert file to Base64 string
        reader.readAsDataURL(file);
    });
}

// Export as default for backward compatibility
export { uploadMediaToMongoDB };