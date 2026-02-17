
import { supabase } from './config.js';

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error };
    }
}

/**
 * Sign out current user
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current authenticated user
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Listen to auth state changes
 * @param {function} callback
 */
export function onAuthChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user || null);
    });
}

/**
 * Check if user is logged in
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

/**
 * Create a new user account (For Super Admin to create Admins)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export async function createNewUser(email, password) {
    try {
        // By default, signUp signs in the user. 
        // If we are creating another admin while logged in, we should use the Admin API (requires service_role key)
        // OR simply rely on email confirmation.
        // HOWEVER, since we are client-side and don't want to expose service_role,
        // and standard signUp might switch the session, we need to be careful.
        //
        // NOTE: Standard `signUp` usually logs the new user in if email confirmation is disabled.
        // If email confirmation is enabled, it doesn't log them in immediately.
        // A common pattern for "Invite User" without backend is tricky.
        //
        // For this specific 'Edunet' usecase where we had `secondaryApp` in Firebase:
        // Supabase doesn't support multiple instances easily on client side without separate clients.
        // 
        // WORKAROUND: We will just use signUp. If it logs us out, the UI might flicker.
        // Better approach for production: Cloud Function.
        // For now: We'll attempt signUp.

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Create user error:', error);
        return { success: false, error: error.message };
    }
}
