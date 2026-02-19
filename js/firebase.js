// 1. Importamos las librerías oficiales
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js"; // <--- AGREGADO

// 2. Tu configuración
const firebaseConfig = {
  apiKey: "AIzaSyC7C3x0SEisWGunvaWXMpZdqztTu3LlkTQ",
  authDomain: "novamarket-977f8.firebaseapp.com",
  projectId: "novamarket-977f8",
  storageBucket: "novamarket-977f8.firebasestorage.app",
  messagingSenderId: "533943563293",
  appId: "1:533943563293:web:5f73ebb89f068b9c7fc2f4",
  measurementId: "G-JVYMKG49BP"
};

// 3. Inicializamos la App
const app = initializeApp(firebaseConfig);

// 4. Exportamos los servicios
export const db = getFirestore(app);
export const auth = getAuth(app); // <--- AGREGADO