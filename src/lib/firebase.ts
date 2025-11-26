import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Web App Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH7mv-Zy1PL2cFZ8kkujdzktZJyoAb4Y",
  authDomain: "phone-mechanic-final.firebaseapp.com",
  projectId: "phone-mechanic-final",
  storageBucket: "phone-mechanic-final.firebasestorage.app",
  messagingSenderId: "606430764528",
  appId: "1:606430764528:web:49f72357b909960dcbb1135",
  measurementId: "G-VLNHL8CELPX"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
