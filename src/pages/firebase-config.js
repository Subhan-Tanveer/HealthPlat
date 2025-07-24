// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import getFirestore
import { getAnalytics } from "firebase/analytics"; // Keep if you use analytics
import { getAuth } from "firebase/auth"; // NEW: Import getAuth for Firebase Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKIxDM9NmjuKJluxE-AnRj5VejoP0aauE",
  authDomain: "doctor-website-cfae4.firebaseapp.com",
  projectId: "doctor-website-cfae4",
  storageBucket: "doctor-website-cfae4.firebasestorage.app",
  messagingSenderId: "617077940660",
  appId: "1:617077940660:web:37ea4f18178c34780552e1",
  measurementId: "G-Y6L383B9SW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Initialize analytics if needed

// Initialize Firestore
const db = getFirestore(app);
// NEW: Initialize Firebase Authentication and export it
const auth = getAuth(app);

export { db, app, analytics, auth }; // NEW: Export auth for use in other components
