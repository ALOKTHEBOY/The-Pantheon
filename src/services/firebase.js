// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 1. Add this import
import { getFirestore } from "firebase/firestore"; // 1. Add this import

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXibxcdOESaSSKhns-4nwqNFNzplidRyE",
  authDomain: "the-pantheon-358ec.firebaseapp.com",
  projectId: "the-pantheon-358ec",
  storageBucket: "the-pantheon-358ec.firebasestorage.app",
  messagingSenderId: "333094260423",
  appId: "1:333094260423:web:ed5379a71988802c59b8e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app); 
export const db = getFirestore(app); // 2. Add this line to export the database