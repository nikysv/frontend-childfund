import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxwdXCmWyvJO5uVZDtG7zx_ydq5oKYCTk",
  authDomain: "childfund-a90da.firebaseapp.com",
  projectId: "childfund-a90da",
  storageBucket: "childfund-a90da.firebasestorage.app",
  messagingSenderId: "597625682182",
  appId: "1:597625682182:web:7e0d7216a5f3efe0304687",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
