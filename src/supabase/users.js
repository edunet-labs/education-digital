
import { supabase } from './config.js';

const TABLE_NAME = 'user_roles';

/**
 * Get user role by UID
 * @param {string} uid - User UID from Auth
 * @returns {Promise<Object|null>}
 */
export async function getUserRole(uid) {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', uid)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            console.error('Error getting user role details:', error);
        }
        return data || null;
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
export async function setUserRole(uid, roleData) {
    try {
        const { role, email, username, name } = roleData;
        const { error } = await supabase
            .from(TABLE_NAME)
            .upsert({
                id: uid,
                role,
                email,
                username: username || email.split('@')[0], // Fallback if missing
                name: name || '',
                updated_at: new Date()
            });

        if (error) throw error;
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
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting admins:', error);
        return [];
    }
}

/**
 * Delete admin user role
 * @param {string} uid - User UID
 * @returns {Promise<Object>}
 */
export async function deleteAdminRole(uid) {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', uid);

        if (error) throw error;
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
        const { count, error } = await supabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true })
            .eq('role', 'superadmin');

        if (error) throw error;
        return count > 0;
    } catch (error) {
        console.error('Error checking super admin:', error);
        return false;
    }
}

