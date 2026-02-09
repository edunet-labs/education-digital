// Firebase Authentication Module
import { auth, firebaseConfig } from './config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword as createUser } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

/**
 * Sign in with email and password
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<UserCredential>}
 */
export async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Sign out current user
 */
export async function signOut() {
    try {
        await firebaseSignOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current authenticated user
 * @returns {User|null}
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Listen to auth state changes
 * @param {function} callback - Called with user object or null
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
    return auth.currentUser !== null;
}

/**
 * Create a new user account (for Super Admin to create admins)
 * Uses a secondary Firebase app to avoid logging out the current user
 * @param {string} email - New user's email
 * @param {string} password - New user's password
 * @returns {Promise<Object>}
 */
export async function createNewUser(email, password) {
    try {
        // Create a secondary app instance to create user without affecting current session
        const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
        const secondaryAuth = getAuth(secondaryApp);

        const userCredential = await createUser(secondaryAuth, email, password);
        const newUser = userCredential.user;

        // Sign out from secondary app immediately
        await secondaryAuth.signOut();

        return { success: true, user: newUser };
    } catch (error) {
        console.error('Create user error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

/**
 * Get user-friendly error message
 * @param {string} errorCode - Firebase error code
 * @returns {string}
 */
function getErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
        'auth/user-not-found': 'Email tidak terdaftar.',
        'auth/wrong-password': 'Password salah.',
        'auth/invalid-credential': 'Email atau password salah.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
        'auth/email-already-in-use': 'Email sudah terdaftar.',
        'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter).',
    };
    return messages[errorCode] || 'Terjadi kesalahan. Silakan coba lagi.';
}
