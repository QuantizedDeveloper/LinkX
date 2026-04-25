// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6fYEcOD4VTZbXmxyv7q9lx8gBOJPFVgk",
  authDomain: "linkx-llm.firebaseapp.com",
  projectId: "linkx-llm",
  storageBucket: "linkx-llm.firebasestorage.app",
  messagingSenderId: "690870855304",
  appId: "1:690870855304:web:6dfa4c2c2a29f5652ba13d",
  measurementId: "G-F8166RM5PN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);