import { auth } from './js/firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// --- REGISTRO DE USUARIO ---
const regForm = document.getElementById('register-form');
if (regForm) {
    regForm.onsubmit = async (e) => {
        e.preventDefault(); // Evita que la página se recargue
        console.log("Intentando registrar usuario...");

        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            console.log("Usuario creado en Firebase:", userCredential.user.email);

            // Enviar correo de verificación
            await sendEmailVerification(userCredential.user);
            console.log("Correo de verificación enviado.");
            
            alert("¡Cuenta creada! Revisa tu correo electrónico - Spam.");
            await signOut(auth); 
            location.reload(); 
        } catch (error) {
            console.error("Error detallado:", error.code, error.message);
            alert("Error al registrar: " + error.message);
        }
    };
} else {
    console.error("No se encontró el formulario 'register-form' en el HTML.");
}

// --- INGRESO DE USUARIO ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        console.log("Intentando iniciar sesión...");

        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            if (user.emailVerified) {
                alert("Acceso concedido. ¡Bienvenido!");
                window.location.href = "index.html"; 
            } else {
                alert("Tu correo no ha sido verificado. Revisa tu bandeja de entrada - Spam.");
                await signOut(auth);
            }
        } catch (error) {
            console.error("Error al ingresar:", error.code);
            alert("Correo o contraseña incorrectos.");
        }
    };
}