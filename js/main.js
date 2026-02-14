// 1. Importamos la base de datos y las funciones de Firestore
import { db } from './firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const contenedor = document.getElementById('products-container');

// --- VARIABLES GLOBALES (Solo una vez) --
let carrito = [];
const miTelefono = "916992293"; // Tu número real aquí
const cartBadge = document.querySelector('.cart-badge');

// Elementos del Modal
const modal = document.getElementById("cart-modal");
const btnAbrirModal = document.querySelector(".cart-container");
const btnCerrarModal = document.querySelector(".close-modal");
const listaCarritoUI = document.getElementById("cart-items-list");
const totalUI = document.getElementById("cart-total-amount");

// 3. Función principal para cargar productos
async function obtenerProductos(categoriaSeleccionada = null) {
    try {
        contenedor.innerHTML = '<div class="loader"></div>';
        
        let q;
        const productosRef = collection(db, "productos");

        if (categoriaSeleccionada) {
            q = query(productosRef, where("categoria", "==", categoriaSeleccionada));
        } else {
            q = productosRef;
        }
        
        const querySnapshot = await getDocs(q);
        contenedor.innerHTML = '';

        if (querySnapshot.empty) {
            contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No hay productos en esta categoría.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const datos = doc.data();
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

// --- LÓGICA DE FILTRO ---
const botonesFiltro = document.querySelectorAll('.tab-btn');

botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        botonesFiltro.forEach(b => b.classList.remove('active'));
        boton.classList.add('active');
        const categoria = boton.innerText.trim(); 
        console.log("Filtrando por:", categoria);
        obtenerProductos(categoria);
    });
});

document.querySelector('.cat-item.active')?.addEventListener('click', () => {
    obtenerProductos(); 
});

// --- LÓGICA DEL CARRITO (Agregar productos) ---
contenedor.addEventListener('click', (e) => {
    const boton = e.target.closest('.add-btn');
    
    if (boton) {
        const card = boton.closest('.product-card');
        const producto = {
            nombre: card.querySelector('h4').innerText,
            precio: card.querySelector('.price-tag').innerText
        };

        carrito.push(producto);
        
        // Actualizar contador visual
        if(cartBadge) cartBadge.innerText = carrito.length;
        
        // Tu animación sutil
        boton.style.backgroundColor = "var(--turquesa-dark)";
        setTimeout(() => boton.style.backgroundColor = "var(--turquesa)", 200);
    }
});

// --- LÓGICA DEL MODAL ---

// 2. Abrir el modal y mostrar la lista
// 2. Abrir el modal y mostrar la lista con opción de eliminar
btnAbrirModal.onclick = function() {
    renderizarCarrito();
    modal.style.display = "block";
}

// Función separada para poder redibujar la lista si borramos algo
function renderizarCarrito() {
    listaCarritoUI.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        listaCarritoUI.innerHTML = "<p style='text-align:center; padding:20px;'>Tu carrito está vacío</p>";
    }

    carrito.forEach((prod, index) => {
        listaCarritoUI.innerHTML += `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <span>${prod.nombre}</span>
                    <strong>${prod.precio}</strong>
                </div>
                <button class="delete-item" data-index="${index}">&times;</button>
            </div>
        `;
        const precioLimpio = prod.precio.replace('$', '').replace(',', '');
        total += parseFloat(precioLimpio);
    });

    totalUI.innerText = `$${total.toFixed(2)}`;
    if(cartBadge) cartBadge.innerText = carrito.length;
}

// Lógica para detectar el clic en el botón de eliminar
listaCarritoUI.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-item')) {
        const indexABorrar = e.target.getAttribute('data-index');
        // Eliminamos el producto del arreglo
        carrito.splice(indexABorrar, 1);
        // Volvemos a dibujar la lista actualizada
        renderizarCarrito();
    }
});


// 3. Cerrar modal
btnCerrarModal.onclick = () => modal.style.display = "none";
window.onclick = (event) => { 
    if (event.target == modal) modal.style.display = "none"; 
}

// 4. Botón final de WhatsApp dentro del Modal
document.getElementById("btn-whatsapp-send").onclick = function() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }
    let listaTexto = "";
    carrito.forEach((p, i) => listaTexto += `${i+1}. *${p.nombre}* (${p.precio})\n`);
    
    const mensaje = `¡Hola NovaMarket! 👋\nMi pedido es:\n${listaTexto}\n*Total:* ${totalUI.innerText}`;
    window.open(`https://wa.me/${miTelefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
};

// Carga inicial de productos
obtenerProductos();


// --- LÓGICA DE SALUDO DINÁMICO ---
function actualizarSaludo() {
    // Buscamos el elemento donde dice "BIENVENIDO" o "Mucho Gusto"
    // Según tu captura es el span debajo de Jhon Kevin
    const saludoElemento = document.querySelector('.user-name span:last-child');
    
    if (saludoElemento) {
        const hora = new Date().getHours();
        let mensaje = "";

        if (hora >= 6 && hora < 12) {
            mensaje = "¡Buenos días! ☀️";
        } else if (hora >= 12 && hora < 19) {
            mensaje = "¡Buenas tardes! ☕";
        } else {
            mensaje = "¡Buenas noches! 🌙";
        }

        saludoElemento.innerText = mensaje;
    }
}

// Ejecutamos la función apenas cargue la página

actualizarSaludo();
obtenerProductos(); // Esta ya la tienes
activarBuscadores(); // <--- AGREGA ESTA LÍNEA

// --- FUNCIÓN DE BÚSQUEDA ACTUALIZADA ---
function activarBuscadores() {
    // 1. Seleccionamos el de arriba (barra blanca) y el de abajo (menu search)
    const buscadorSuperior = document.querySelector('.search-bar input');
    const buscadorMenu = document.querySelector('.menu-search-box input');

    // Esta es la lógica que oculta o muestra las cards
    const filtrarProductos = (evento) => {
        const texto = evento.target.value.toLowerCase().trim();
        const productos = document.querySelectorAll('.product-card');

        productos.forEach(card => {
            const nombre = card.querySelector('h4').innerText.toLowerCase();
            // Si el texto que escribes está en el nombre, se queda; si no, se va.
            card.style.display = nombre.includes(texto) ? "flex" : "none";
        });
    };

    // 2. Conectamos AMBOS al mismo filtro
    // Escucha al de arriba
    buscadorSuperior?.addEventListener('input', filtrarProductos);
    
    // Escucha al de abajo
    buscadorMenu?.addEventListener('input', filtrarProductos);
}
