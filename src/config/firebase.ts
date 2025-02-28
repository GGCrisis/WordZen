import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC8e1dTP0BfiFJNmpHW2qaabxhilV-c9pk",
  authDomain: "vocab-f7a82.firebaseapp.com",
  projectId: "vocab-f7a82",
  storageBucket: "vocab-f7a82.firebasestorage.app",
  messagingSenderId: "774294339159",
  appId: "1:774294339159:web:fbe24bba54d72e82dfed12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
export const auth = getAuth(app);
export default app;