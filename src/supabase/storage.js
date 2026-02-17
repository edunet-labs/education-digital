
import { supabase } from './config.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'materials/pdf/filename.pdf') - Note: we might need to adjust path strategy for Supabase
 * @param {Function} onProgress - Callback for upload progress (Not natively supported in same way as Firebase, but mocked)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadFile(file, path, onProgress = null) {
    try {
        // 1. Check File Size (10MB Limit)
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
            };
        }

        // 2. Upload to 'materials' bucket
        // We need to ensure 'path' doesn't start with the bucket name if passed from old logic
        // Old logic: might pass 'materials/...' or just 'pdf/...'
        // specific bucket usage: supabase.storage.from('materials').upload(path, file)

        const bucketName = 'materi';
        // Remove bucket name from path if present to avoid nesting
        const cleanPath = path.startsWith(bucketName + '/') ? path.replace(bucketName + '/', '') : path;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(cleanPath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(cleanPath);

        return { success: true, url: publicUrl };

    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a file from Supabase Storage by URL
 * @param {string} url - The download URL of the file
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteFileByUrl(url) {
    try {
        const bucketName = 'materi';
        // Extract path from URL: .../storage/v1/object/public/materials/folder/file.pdf
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split(`/public/${bucketName}/`);

        if (pathParts.length < 2) {
            return { success: false, error: 'Invalid storage URL' };
        }

        const path = pathParts[1]; // "folder/file.pdf"

        const { error } = await supabase.storage
            .from(bucketName)
            .remove([path]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate a unique filename
 * @param {string} originalName
 * @returns {string}
 */
export function generateUniqueFilename(originalName) {
    const timestamp = new Date().getTime();
    const extension = originalName.split('.').pop();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${randomString}.${extension}`;
}
