// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2ULumcKiBQykumao2DZ906k739iDAMLU",
  authDomain: "foodie-app-f4e37.firebaseapp.com",
  projectId: "foodie-app-f4e37",
  storageBucket: "foodie-app-f4e37.firebasestorage.app",
  messagingSenderId: "537819807402",
  appId: "1:537819807402:web:54d25caaf3d227de711ad3",
  measurementId: "G-PW64VHHM2F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);