// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔒 这里直接使用你 .env.local 里的配置值
// 这些信息本来就是公开的，不是私密密钥，放在前端代码里是安全的。
const firebaseConfig = {
  apiKey: "AIzaSyBH7mv-zy1PLc2Fz8kkujdzkt2yoAb4y",
  authDomain: "phone-mechanic-final.firebaseapp.com",
  projectId: "phone-mechanic-final",
  storageBucket: "phone-mechanic-final.firebasestorage.app",
  messagingSenderId: "606430764528",
  appId: "1:606430764528:web:49f723257b9e9960dcb1135",
  measurementId: "G-VLNHL8CELPX",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
