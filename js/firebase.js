
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js"; 






const firebaseConfig = {



  apiKey: "AIzaSyC7C3x0SEisWGunvaWXMpZdqztTu3LlkTQ",
  authDomain: "novamarket-977f8.firebaseapp.com",
  projectId: "novamarket-977f8",
  storageBucket: "novamarket-977f8.firebasestorage.app",
  messagingSenderId: "533943563293",
  appId: "1:533943563293:web:5f73ebb89f068b9c7fc2f4",
  measurementId: "G-JVYMKG49BP"
};



const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const auth = getAuth(app);