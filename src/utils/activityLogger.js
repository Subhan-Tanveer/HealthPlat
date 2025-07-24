// src/utils/activityLogger.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../pages/firebase-config'; // Adjust path as necessary
import { signInWithCustomToken, signInAnonymously } from 'firebase/auth';

// Define global variables for app_id and auth_token
// These are provided by the Canvas environment and ensure proper Firestore pathing and authentication.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

/**
 * Logs an activity to the user's Firestore activity collection.
 * This function handles authentication if the user is not already signed in.
 
 * @param {string} type - The type of activity (e.g., 'hospital_contact', 'blog_read', 'profile_update').
 * @param {string} description - A brief, human-readable description of the activity.
 * @param {object} [details={}] - Optional additional details about the activity (e.g., hospitalId, blogTitle).
 */
export const logActivity = async (type, description, details = {}) => {
  try {
    // Ensure user is authenticated before logging activity
    // If no current user, try signing in with the provided custom token or anonymously.
    if (!auth.currentUser) {
      if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken);
      } else {
        await signInAnonymously(auth);
      }
    }

    // Get the current user's ID. If still null (e.g., anonymous sign-in failed), use 'anonymous'.
    const userId = auth.currentUser?.uid || 'anonymous';

    // Construct the Firestore collection path for user-specific activities.
    // This adheres to the recommended Firestore security rules for private user data.
    const activitiesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/activities`);

    // Add a new document to the collection with activity details and a server timestamp.
    await addDoc(activitiesCollectionRef, {
      type,
      description,
      details,
      timestamp: serverTimestamp(), // Use Firestore's server timestamp for accurate ordering
    });
    console.log(`Activity logged: ${description}`);
  } catch (error) {
    console.error("Error logging activity to Firestore:", error);
    // In a real application, you might want to show a toast or a user-facing error message here.
  }
};
