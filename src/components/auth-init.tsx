"use client";

import { useEffect } from "react";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";

export default function AuthInit() {
  useEffect(() => {
    try {
      const cfg = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
      };
      const app = getApps().length ? getApp() : initializeApp(cfg);
      const auth = getAuth(app);
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          signInAnonymously(auth).catch(() => {});
        }
      });
    } catch {}
  }, []);

  return null;
}
