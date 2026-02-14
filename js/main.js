// 1. Importamos la base de datos y las funciones de Firestore (Añadimos query y where)
import { db } from './firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const contenedor = document.getElementById('products-container');

// 3. Función principal para cargar productos (Ahora recibe una categoría opcional)
async function obtenerProductos(categoriaSeleccionada = null) {
    try {
        // Mensaje de carga inicial con tu loader
        contenedor.innerHTML = '<div class="loader"></div>';
        
        let q;
        const productosRef = collection(db, "productos");

        // LÓGICA DE FILTRO: Si hay categoría, filtramos; si no, traemos todo
        if (categoriaSeleccionada) {
            q = query(productosRef, where("categoria", "==", categoriaSeleccionada));
        } else {
            q = productosRef;
        }
        
        const querySnapshot = await getDocs(q);
        
        // Limpiamos el contenedor para meter los datos reales
        contenedor.innerHTML = '';

        // Si la categoría está vacía en Firebase, avisamos al usuario
        if (querySnapshot.empty) {
            contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No hay productos en esta categoría.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const datos = doc.data();
            
            // Tu validación original
            const nombreFinal = datos.nombre || datos.Nombre || "Producto sin nombre";
            const precioFinal = datos.precio || datos.Precio || "0.00";
            const imagenFinal = datos.imagen || datos.Imagen || "https://via.placeholder.com/150";

            // Tu estructura HTML intacta
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

 // --- LÓGICA DE FILTRO CORREGIDA ---
const botonesFiltro = document.querySelectorAll('.tab-btn');

botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        // 1. Efecto visual de botones
        botonesFiltro.forEach(b => b.classList.remove('active'));
        boton.classList.add('active');

        // 2. Limpiamos el texto para evitar errores de espacios o mayúsculas
        // .trim() quita espacios invisibles
        const categoria = boton.innerText.trim(); 
        
        console.log("Filtrando por:", categoria); // Esto te ayudará a ver qué busca en la consola

        // 3. Llamamos a la función
        // Si el botón es uno especial para mostrar TODO, podrías poner una condición
        // Pero basándonos en tu código actual:
        obtenerProductos(categoria);
    });
});

// Tip: Si tienes un botón para mostrar todos los productos de nuevo:
document.querySelector('.cat-item.active')?.addEventListener('click', () => {
    obtenerProductos(); // Carga todos sin filtro
});