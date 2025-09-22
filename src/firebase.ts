
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAd83GPMU0P1bczZHvpxa95ldYsRpC97HY",
  authDomain: "gef-mixer.firebaseapp.com",
  projectId: "gef-mixer",
  storageBucket: "gef-mixer.firebasestorage.app",
  messagingSenderId: "1067367218518",
  appId: "1:1067367218518:web:4f8250d6809b0ff9bdeaf7",
  measurementId: "G-HWLCYQL7B4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, analytics };
