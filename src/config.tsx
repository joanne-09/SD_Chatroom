// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyABQdJvbzbxOVupwHXAeUnmJMa3CtaR0W4",
    authDomain: "midtermproject-112062309.firebaseapp.com",
    projectId: "midtermproject-112062309",
    databaseURL: "https://midtermproject-112062309-default-rtdb.firebaseio.com/",
    storageBucket: "midtermproject-112062309.firebasestorage.app",
    messagingSenderId: "893224602038",
    appId: "1:893224602038:web:ee948cb7a2c7034fad5917",
    measurementId: "G-FGPLD3L9ZN"
};

// Initialize Firebase
const config = initializeApp(firebaseConfig);
const database = getDatabase(config);
const auth = getAuth(config);
export {database, auth};