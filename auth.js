import { auth } from './js/firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    signOut,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// --- REGISTRO DE USUARIO (Crear Cuenta) ---
const regForm = document.getElementById('register-form');
if (regForm) {
    regForm.onsubmit = async (e) => {
        e.preventDefault(); 
        
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        const passConfirm = document.getElementById('reg-pass-confirm').value;

        // Validar que las contraseñas coincidan
        if (pass !== passConfirm) {
            alert("⚠️ Las contraseñas no coinciden en el registro.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await sendEmailVerification(userCredential.user);
            alert("¡Cuenta creada! Revisa tu correo (Spam) para verificarla.");
            await signOut(auth); 
            location.reload(); 
        } catch (error) {
            alert("Error al registrar: " + error.message);
        }
    };
}

// --- INGRESO DE USUARIO (Iniciar Sesión) ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            if (userCredential.user.emailVerified) {
                alert("Acceso concedido. ¡Bienvenido!");
                window.location.href = "index.html"; 
            } else {
                alert("Tu correo no ha sido verificado. Revisa tu bandeja de entrada.");
                await signOut(auth);
            }
        } catch (error) {
            alert("Correo o contraseña incorrectos.");
        }
    };
}

// --- RECUPERAR CUENTA (Esta es la parte que te faltaba) ---
const btnRecuperar = document.getElementById('btn-recuperar');
if (btnRecuperar) {
    btnRecuperar.onclick = async (e) => {
        e.preventDefault();
        
        // Obtenemos el correo del campo de login
        const email = document.getElementById('login-email').value;

        if (email === "") {
            alert("⚠️ Por favor, escribe tu correo electrónico en el campo de arriba primero.");
            return;
        }

        try {
            // AQUÍ SE USA LA FUNCIÓN: Esto quita el error de la línea 7
            await sendPasswordResetEmail(auth, email);
            alert("¡Enlace enviado! Revisa tu correo para cambiar tu contraseña.");
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                alert("Este correo no está registrado.");
            } else {
                alert("Error: No se pudo enviar el correo de recuperación.");
            }
        }
    };
}
