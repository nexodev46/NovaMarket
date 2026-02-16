// 1. Importamos la base de datos y las funciones de Firestore
import { db } from './firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const contenedor = document.getElementById('products-container');

// --- VARIABLES GLOBALES (Solo una vez) --
let carrito = [];
const miTelefono = "916992293"; // Tu número real aquí
const cartBadge = document.querySelector('.cart-badge');
let favoritos = JSON.parse(localStorage.getItem('misFavoritos')) || [];

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
            
            // Dentro del forEach de querySnapshot

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

document.querySelector('.cat-item i.fa-th-large').parentElement.addEventListener('click', () => {
    // Esto vuelve a llamar a tu función principal que trae todo de la base de datos
    obtenerProductos(); 
});

    
// La línea 93 ahora debería estar limpia para que siga la lógica del carrito abajo
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

        // --- INICIO DE LA ANIMACIÓN DEL BADGE ---
        if(cartBadge) {
            cartBadge.innerText = carrito.length;
            
            // 1. Quitamos la clase por si ya la tenía de un clic anterior
            cartBadge.classList.remove('animar-badge');
            
            // 2. Forzamos un "reflow" (truco para que el navegador reinicie la animación)
            void cartBadge.offsetWidth; 
            
            // 3. Agregamos la clase que hace el salto
            cartBadge.classList.add('animar-badge');
        }
        // --- FIN DE LA ANIMACIÓN ---

        mostrarMensajeAgregado(producto.nombre);
        
        // Animación sutil del botón azul
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
  // >>> AQUÍ ES DONDE VA, FUERA DE RENDERIZAR <<<

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

    const envio = JSON.parse(localStorage.getItem('datosEnvio')) || null;
    let listaTexto = "";
    carrito.forEach((p, i) => listaTexto += `${i+1}. *${p.nombre}* (${p.precio})\n`);
    
    let mensaje = `¡Hola NovaMarket! 👋\n\n*MI PEDIDO:*\n${listaTexto}\n*Total:* ${totalUI.innerText}\n\n`;
    
    if (envio) {
        mensaje += `*DATOS DE ENVÍO:*\n📍 *Nombre:* ${envio.nombre}\n🏠 *Dirección:* ${envio.direccion}\n📌 *Referencia:* ${envio.referencia}`;
    } else {
        mensaje += `_(No se proporcionó dirección de entrega)_`;
    }

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

function marcarFavoritosGuardados() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const nombre = card.querySelector('h4').innerText;
        const corazon = card.querySelector('.fa-heart');
        
        // Si el nombre está en nuestra lista de favoritos, le ponemos la clase roja
        if (favoritos.includes(nombre)) {
            corazon.classList.add('active');
        }
    });
}contenedor.addEventListener('click', (e) => {
    const corazon = e.target.closest('.fa-heart');
    
    if (corazon) {
        const card = corazon.closest('.product-card');
        const nombreProducto = card.querySelector('h4').innerText;

        if (favoritos.includes(nombreProducto)) {
            // Si ya era favorito, lo sacamos de la lista
            favoritos = favoritos.filter(item => item !== nombreProducto);
            corazon.classList.remove('active');
        } else {
            // Si no estaba, lo agregamos
            favoritos.push(nombreProducto);
            corazon.classList.add('active');
        }

        // Guardamos la lista actualizada en el navegador
        localStorage.setItem('misFavoritos', JSON.stringify(favoritos));
    }
});


// --- CONTROL DE FAVORITOS ---

const elModalFav = document.getElementById("fav-modal");
const laListaFav = document.getElementById("fav-items-list");

// 1. Buscamos el botón Favorite por su clase y posición
const todosLosItemsMenu = document.querySelectorAll('.cat-item');
let botonFavReal = null;

todosLosItemsMenu.forEach(item => {
    if(item.innerText.includes("Favorite")) {
        botonFavReal = item;
    }
});

// 2. Función para pintar los favoritos
function dibujarFavoritos() {
    const guardados = JSON.parse(localStorage.getItem('misFavoritos')) || [];
    laListaFav.innerHTML = "";

    if (guardados.length === 0) {
        laListaFav.innerHTML = "<p style='text-align:center; padding:30px;'>No tienes favoritos todavía. ❤️</p>";
        return;
    }

    guardados.forEach(prod => {
        const div = document.createElement('div');
        div.className = 'fav-row';
        div.innerHTML = `
            <span style="font-weight:bold;">${prod}</span>
            <i class="fas fa-trash" onclick="borrarDeFavs('${prod}')" style="color:red; cursor:pointer;"></i>
        `;
        laListaFav.appendChild(div);
    });
}

// 3. Abrir al hacer clic
if (botonFavReal) {
    botonFavReal.onclick = function() {
        dibujarFavoritos();
        elModalFav.style.setProperty('display', 'block', 'important');
    };
}

// 4. Cerrar
document.querySelector(".close-fav").onclick = () => elModalFav.style.display = "none";

window.onclick = (e) => {
    if (e.target == elModalFav) elModalFav.style.display = "none";
};

// 5. Borrar
window.borrarDeFavs = function(n) {
    let f = JSON.parse(localStorage.getItem('misFavoritos')) || [];
    f = f.filter(x => x !== n);
    localStorage.setItem('misFavoritos', JSON.stringify(f));
    dibujarFavoritos();
    if(typeof marcarFavoritosGuardados === 'function') marcarFavoritosGuardados();
};




function mostrarMensajeAgregado(nombreProducto) {
    // 1. Creamos el elemento
    const toast = document.createElement('div');
    toast.className = 'toast-notificacion';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${nombreProducto} agregado al pedido`;

    // 2. Lo metemos a la página
    document.body.appendChild(toast);

    // 3. Lo borramos del código después de 3 segundos para no llenar la web de basura
    setTimeout(() => {
        toast.remove();
    }, 3000);
}



const deliveryModal = document.getElementById("delivery-modal");
const btnDelivery = document.querySelector('.cat-item i.fa-shipping-fast')?.parentElement 
                 || [...document.querySelectorAll('.cat-item')].find(el => el.innerText.includes("Delivery"));

// Abrir Modal
if (btnDelivery) {
    btnDelivery.onclick = () => deliveryModal.style.display = "block";
}

// Cerrar Modal
document.querySelector(".close-delivery").onclick = () => deliveryModal.style.display = "none";

// Guardar datos en LocalStorage para que no se borren al recargar
document.getElementById("btn-save-delivery").onclick = function() {
    const datos = {
        nombre: document.getElementById("del-nombre").value,
        direccion: document.getElementById("del-direccion").value,
        referencia: document.getElementById("del-referencia").value
    };

    if(!datos.nombre || !datos.direccion) {
        alert("Por favor, ingresa nombre y dirección.");
        return;
    }

    localStorage.setItem('datosEnvio', JSON.stringify(datos));
    mostrarMensajeAgregado("Datos de entrega guardados");
    deliveryModal.style.display = "none";
};



// --- LÓGICA DEL BOTÓN DATOS ---
const infoModal = document.getElementById("info-modal");

// Buscamos el botón por el texto "Datos" (el último de los círculos)
const todosLosItemsCat = document.querySelectorAll('.cat-item');
let botonDatos = null;

todosLosItemsCat.forEach(item => {
    if(item.innerText.includes("Datos")) {
        botonDatos = item;
    }
});

// Abrir al hacer clic
if (botonDatos) {
    botonDatos.onclick = function() {
        infoModal.style.display = "block";
    };
}

// Cerrar al darle a la X
document.querySelector(".close-info").onclick = () => infoModal.style.display = "none";

// Cerrar si hacen clic fuera del cuadrito
window.addEventListener('click', (e) => {
    if (e.target == infoModal) infoModal.style.display = "none";
});


// --- LÓGICA DEL BOTÓN PROMO ---
const promoModal = document.getElementById("promo-modal");
const listaPromoUI = document.getElementById("promo-items-list");

// 1. Buscamos el botón "Promo" entre los círculos
const botonesCirculares = document.querySelectorAll('.cat-item');
let botonPromoReal = null;

botonesCirculares.forEach(item => {
    if(item.innerText.includes("Promo")) {
        botonPromoReal = item;
    }
});

// 2. Función para mostrar productos en promoción
async function dibujarPromociones() {
    listaPromoUI.innerHTML = '<p style="text-align:center;">Buscando ofertas...</p>';
    
    try {
        const productosRef = collection(db, "productos");
        // Filtramos solo los que tengan categoria "Promo"
        const q = query(productosRef, where("categoria", "==", "Promo"));
        const querySnapshot = await getDocs(q);
        
        listaPromoUI.innerHTML = "";

        if (querySnapshot.empty) {
            listaPromoUI.innerHTML = "<p style='text-align:center; padding:20px;'>Próximamente nuevas ofertas. 😉</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const prod = doc.data();
            listaPromoUI.innerHTML += `
                <div class="cart-item-row" style="border-left: 4px solid #ff4757; margin-bottom: 10px; padding-left: 10px;">
                    <div class="cart-item-info">
                        <span style="font-weight:bold; color:#333;">${prod.nombre}</span>
                        <strong style="color:#ff4757;">$${prod.precio} <small style="text-decoration:line-through; color:#aaa; font-weight:normal;">$${(parseFloat(prod.precio) * 1.2).toFixed(2)}</small></strong>
                    </div>
                    <button class="add-btn-promo" onclick="agregarDesdePromo('${prod.nombre}', '${prod.precio}')" 
                            style="background:#4dbbc4; color:white; border:none; border-radius:5px; padding:5px 10px; cursor:pointer;">
                        +
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar promos:", error);
    }
}

// 3. Eventos de Abrir y Cerrar
if (botonPromoReal) {
    botonPromoReal.onclick = function() {
        dibujarPromociones();
        promoModal.style.display = "block";
    };
}

document.querySelector(".close-promo").onclick = () => promoModal.style.display = "none";

// 4. Función para agregar al carrito directo desde la pestaña de Promo
window.agregarDesdePromo = function(nombre, precio) {
    carrito.push({ nombre, precio: "$" + precio });
    if(cartBadge) cartBadge.innerText = carrito.length;
    mostrarMensajeAgregado(nombre);
};





