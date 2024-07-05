// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDQDzbnCOcFO1_t3pcKIkJsMQKeALvUg4U",
    authDomain: "portfolio-cfaca.firebaseapp.com",
    projectId: "portfolio-cfaca",
    storageBucket: "portfolio-cfaca.appspot.com",
    messagingSenderId: "867911033242",
    appId: "1:867911033242:web:92b2712e7cdc73706e1a23",
    measurementId: "G-WT18M7BMKH"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const analytics = getAnalytics(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const db = getFirestore(FIREBASE_APP);