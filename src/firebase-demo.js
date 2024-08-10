// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMTDWM5uPDGqZwqnwuSMKB9h-Horn4Qh0",
  authDomain: "grably-us.firebaseapp.com",
  projectId: "grably-us",
  storageBucket: "grably-us.appspot.com",
  messagingSenderId: "782015185955",
  appId: "1:782015185955:web:8b95bf24a5ae5f6e92dd96",
  measurementId: "G-318RDBHQ3X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);