// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 1. Add this import
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMYJJlqRRb3gIYqDGlODRnPud2Y6DQY5U",
  authDomain: "novacart-pro.firebaseapp.com",
  projectId: "novacart-pro",
  storageBucket: "novacart-pro.firebasestorage.app",
  messagingSenderId: "1088484341517",
  appId: "1:1088484341517:web:f9ce2d917433db387ae244",
  measurementId: "G-JW6SMQ5J58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Add this line at the very bottom so Login and Register can use it!
export const auth = getAuth(app);