
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "[YOUR-API-KEY]",
  authDomain: "[YOUR-PROJECT-DOMAIN]",
  projectId: "gef-mixer",
  storageBucket: "[YOUR-BUCKET-ID]",
  messagingSenderId: "[YOUR-MESSAGE-ID]",
  appId: "[YOUR-APP-ID]",
  measurementId: "[YOUR-MEASUREMENT-ID]"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, analytics };
