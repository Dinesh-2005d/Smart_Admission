// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';

// Acadivo Firebase Project
const firebaseConfig = {
  apiKey:            "AIzaSyCAjg4UBnMalTXJHbWYXJ_iwh5bhNQJ0-Q",
  authDomain:        "smartadmission.firebaseapp.com",
  projectId:         "smartadmission",
  storageBucket:     "smartadmission.firebasestorage.app",
  messagingSenderId: "699907822094",
  appId:             "1:699907822094:web:0108bca1412bcbeea3a25f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
