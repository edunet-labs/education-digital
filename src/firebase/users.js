// User Management Repository
import { db } from './config.js';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const COLLECTION_NAME = 'users';

/**
 * Get user role by UID
 * @param {string} uid - User UID from Firebase Auth
 * @returns {Promise<Object|null>}
 */
export async function getUserRole(uid) {
    try {
        const docRef = doc(db, COLLECTION_NAME, uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

/**
 * Set user role
 * @param {string} uid - User UID
 * @param {Object} data - User data including email and role
 * @returns {Promise<Object>}
 */
export async function setUserRole(uid, data) {
    try {
        await setDoc(doc(db, COLLECTION_NAME, uid), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error setting user role:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all admin users
 * @returns {Promise<Array>}
 */
export async function getAllAdmins() {
    try {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting admins:', error);
        return [];
    }
}

/**
 * Delete admin user from Firestore (does not delete from Auth)
 * @param {string} uid - User UID
 * @returns {Promise<Object>}
 */
export async function deleteAdminRole(uid) {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, uid));
        return { success: true };
    } catch (error) {
        console.error('Error deleting admin:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user is super admin
 * @param {string} uid - User UID
 * @returns {Promise<boolean>}
 */
export async function isSuperAdmin(uid) {
    const userData = await getUserRole(uid);
    return userData?.role === 'superadmin';
}

/**
 * Check if any super admin exists
 * @returns {Promise<boolean>}
 */
export async function hasSuperAdmin() {
    try {
        const q = query(collection(db, COLLECTION_NAME), where('role', '==', 'superadmin'));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking super admin:', error);
        return false;
    }
}
