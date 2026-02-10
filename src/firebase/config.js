// Firebase Configuration for Edunet
// Project: edunet-db-1af46

const firebaseConfig = {
    apiKey: "AIzaSyAl2OxByDP25gB17LBaf5zdTbGootbfZ6c",
    authDomain: "edunet-db-1af46.firebaseapp.com",
    projectId: "edunet-db-1af46",
    storageBucket: "edunet-db-1af46.firebasestorage.app",
    messagingSenderId: "1094723768442",
    appId: "1:1094723768442:web:7aacef5ba9f3150881abc3",
    measurementId: "G-MK53QRZ3DS"
};

// Initialize Firebase using CDN imports (compatible with vanilla HTML/JS)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage, firebaseConfig };
