// Firebase Storage Utility Functions
import { storage } from './config.js';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g., 'materials/pdf/filename.pdf')
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadFile(file, path, onProgress = null) {
    try {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    // Error
                    console.error('Upload error:', error);
                    resolve({ success: false, error: error.message });
                },
                async () => {
                    // Complete
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({ success: true, url });
                }
            );
        });
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a file from Firebase Storage by URL
 * @param {string} url - The download URL of the file
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteFileByUrl(url) {
    try {
        // Extract the path from the URL
        const decodedUrl = decodeURIComponent(url);
        const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
        if (!pathMatch) {
            return { success: false, error: 'Invalid storage URL' };
        }
        const path = pathMatch[1];
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate a unique filename
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename with timestamp
 */
export function generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const ext = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    return `${baseName}_${timestamp}.${ext}`;
}
