
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZ0bMjIUJyL_5Jfe1VlMHATrQo_Dlr1_4",
  authDomain: "ai-negotiation-simulator-d5dcf.firebaseapp.com",
  projectId: "ai-negotiation-simulator-d5dcf",
  storageBucket: "ai-negotiation-simulator-d5dcf.firebasestorage.app",
  messagingSenderId: "468222351342",
  appId: "1:468222351342:web:84c8a41b966aeb41e820ff",
  measurementId: "G-50N5KHF64R",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
