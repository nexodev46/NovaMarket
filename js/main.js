// 1. Importamos la base de datos y las funciones de Firestore
import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Referencia al contenedor del HTML
const contenedor = document.getElementById('products-container');

// 3. Función principal para cargar productos
async function obtenerProductos() {
    try {
        // Mensaje de carga inicial
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Cargando deliciosos jugos...</p>';
        
        const querySnapshot = await getDocs(collection(db, "productos"));
        
        // Limpiamos el contenedor para meter los datos reales
        contenedor.innerHTML = '';

        querySnapshot.forEach((doc) => {
    const datos = doc.data();
    
    // Validación: Si el campo viene con mayúscula en Firebase, esto lo corrige automáticamente
    const nombreFinal = datos.nombre || datos.Nombre || "Producto sin nombre";
    const precioFinal = datos.precio || datos.Precio || "0.00";
    const imagenFinal = datos.imagen || datos.Imagen || "https://via.placeholder.com/150";

    contenedor.innerHTML += `
    <article class="product-card">
        <img src="${imagenFinal}" alt="${nombreFinal}">
        <div class="product-info">
            <i class="far fa-heart" style="float: right; color: var(--turquesa); cursor: pointer;"></i>
            <h4>${nombreFinal}</h4>
            <div class="sizes">
                <span class="size-chip">M</span> 
                <span class="size-chip">L</span>
            </div>
            <div class="price-row">
                <span class="price-tag">$${precioFinal}</span>
                <button class="add-btn"><i class="fas fa-shopping-cart"></i></button>
            </div>
        </div>
    </article>
    `;
        });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        contenedor.innerHTML = '<p>Hubo un error al cargar los productos. Revisa tu conexión.</p>';
    }
}

// 5. Llamamos a la función
obtenerProductos();