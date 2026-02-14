// 1. Importamos las librerías oficiales (Usando la versión 10.8.1 que pusiste)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Tu configuración (Verificada con tus datos de Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyC7C3x0SEisWGunaWXMpZdqztTu3Ll1kTQ",
  authDomain: "novamarket-977f8.firebaseapp.com",
  projectId: "novamarket-977f8",
  storageBucket: "novamarket-977f8.firebasestorage.app",
  messagingSenderId: "533943563293",
  appId: "1:533943563293:web:5f73ebb89f068b9c7fc2f4",
  measurementId: "G-JVYMKG49BP"
};

// 3. Inicializamos la App
const app = initializeApp(firebaseConfig);

// 4. Exportamos la base de datos para que main.js la pueda usar
export const db = getFirestore(app);