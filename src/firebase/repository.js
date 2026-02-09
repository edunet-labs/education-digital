// Firebase Firestore Repository for Materials
import { db } from './config.js';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const COLLECTION_NAME = 'materials';

/**
 * Get all materials
 * @returns {Promise<Array>}
 */
export async function getAllMaterials() {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting materials:', error);
        return [];
    }
}

/**
 * Get materials by class level
 * @param {number} kelas - Class level (10, 11, 12)
 * @param {string|null} spesialisasi - Specialization (AIJ, ASJ, KJ) or null
 * @returns {Promise<Array>}
 */
export async function getMaterialsByClass(kelas, spesialisasi = null) {
    try {
        let q;
        if (spesialisasi) {
            q = query(
                collection(db, COLLECTION_NAME),
                where('kelas', '==', kelas),
                where('spesialisasi', '==', spesialisasi),
                orderBy('createdAt', 'asc')
            );
        } else {
            q = query(
                collection(db, COLLECTION_NAME),
                where('kelas', '==', kelas),
                orderBy('createdAt', 'asc')
            );
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting materials by class:', error);
        return [];
    }
}

/**
 * Get single material by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>}
 */
export async function getMaterialById(id) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting material:', error);
        return null;
    }
}

/**
 * Add new material
 * @param {Object} data - Material data
 * @returns {Promise<Object>}
 */
export async function addMaterial(data) {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding material:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update existing material
 * @param {string} id - Document ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>}
 */
export async function updateMaterial(id, data) {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating material:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete material
 * @param {string} id - Document ID
 * @returns {Promise<Object>}
 */
export async function deleteMaterial(id) {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        return { success: true };
    } catch (error) {
        console.error('Error deleting material:', error);
        return { success: false, error: error.message };
    }
}
