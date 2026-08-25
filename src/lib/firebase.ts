import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAxe9LcM_V4PBQnVJ_VfUJOUCVazP3N3M",
  authDomain: "resqpaw-97112.firebaseapp.com",
  projectId: "resqpaw-97112",
  storageBucket: "resqpaw-97112.firebasestorage.app",
  messagingSenderId: "722356515985",
  appId: "1:722356515985:web:fb2f7b58f396bc36bbfb30",
  measurementId: "G-K9BG7CLEKH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
