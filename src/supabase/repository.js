
import { supabase } from './config.js';

const TABLE_NAME = 'materi';

/**
 * Get all materials
 * @returns {Promise<Array>}
 */
export async function getAllMaterials() {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
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
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('kelas', kelas);

        if (spesialisasi) {
            query = query.eq('spesialisasi', spesialisasi);
        }

        const { data, error } = await query.order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting materials by class:', error);
        return [];
    }
}

/**
 * Get materials by Author ID
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<Array>}
 */
export async function getMaterialsByAuthor(userId) {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('created_by', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting materials by author:', error);
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
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting material:', error);
        return null;
    }
}

/**
 * Add new material
 * @param {Object} data - Material data
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function addMaterial(materialData) {
    try {
        // Clean data: remove undefined fields if any
        const { id, ...cleanData } = materialData;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([cleanData])
            .select()
            .single();

        if (error) throw error;
        return { success: true, id: data.id };
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
export async function updateMaterial(id, materialData) {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update({ ...materialData, updated_at: new Date() })
            .eq('id', id);

        if (error) throw error;
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
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting material:', error);
        return { success: false, error: error.message };
    }
}
