import { createClient } from "@supabase/supabase-js";

const key = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0YXR0aWF4ZmNpZ2l2bmdwZXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTgzNDgsImV4cCI6MjA2NjA3NDM0OH0.yEgZXe5mGr1z4KND3wPB0PHz0wBRCohkupSjnmNMutk`

const url = "https://ptattiaxfcigivngpewp.supabase.co"



export default function uploadMediaToSupabase(file) {
    return new Promise((resolve, reject) => {
        // Check if file exists
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        // Get file extension properly
        const fileName = file.name;
        const lastDotIndex = fileName.lastIndexOf('.');
        
        if (lastDotIndex === -1) {
            reject(new Error("File has no extension"));
            return;
        }

        const extension = fileName.substring(lastDotIndex + 1).toLowerCase();
        const nameWithoutExtension = fileName.substring(0, lastDotIndex);

        // Validate file type
        if (!['jpg', 'jpeg', 'png'].includes(extension)) {
            reject(new Error("Please select a JPG, JPEG, or PNG image file"));
            return;
        }

        const supabase = createClient(url, key);
        const timestamp = new Date().getTime();
        
        // Create filename without double extensions
        const uniqueFileName = `${timestamp}_${nameWithoutExtension}.${extension}`;

        console.log('Uploading file:', uniqueFileName); // Debug log

        supabase.storage
            .from("images")
            .upload(uniqueFileName, file, {
                cacheControl: "3600",
                upsert: false,
            })
            .then((response) => {
                if (response.error) {
                    console.error('Supabase upload error:', response.error);
                    reject(new Error(`Upload failed: ${response.error.message}`));
                    return;
                }

                const publicUrl = supabase.storage
                    .from("images")
                    .getPublicUrl(uniqueFileName).data.publicUrl;
                
                console.log('Upload successful:', publicUrl); // Debug log
                resolve(publicUrl);
            })
            .catch((err) => {
                console.error('Upload promise error:', err);
                reject(new Error(`Upload error: ${err.message}`));
            });
    });
}


    