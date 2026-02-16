// 1. Importamos la base de datos y las funciones de Firestore
import { db } from './firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const contenedor = document.getElementById('products-container');

// --- VARIABLES GLOBALES ---
let carrito = [];
const miTelefono = "916992293"; 
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
            
            // Verificamos si es favorito para poner el corazón rojo al cargar
            const claseCorazon = favoritos.includes(nombreFinal) ? 'fas active' : 'far';

            contenedor.innerHTML += `
            <article class="product-card">
                <img src="${imagenFinal}" alt="${nombreFinal}">
                <div class="product-info">
                    <i class="${claseCorazon} fa-heart" style="float: right; color: var(--turquesa); cursor: pointer;"></i>
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
        contenedor.innerHTML = '<p>Hubo un error al cargar los productos.</p>';
    }
}

// --- LÓGICA DE FILTRO ---
const botonesFiltro = document.querySelectorAll('.tab-btn');
botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        botonesFiltro.forEach(b => b.classList.remove('active'));
        boton.classList.add('active');
        const categoria = boton.innerText.trim(); 
        obtenerProductos(categoria);
    });
});

document.querySelector('.cat-item i.fa-th-large').parentElement.addEventListener('click', () => {
    obtenerProductos(); 
});

// --- LÓGICA UNIFICADA: FAVORITOS, TALLAS Y CARRITO ---
contenedor.addEventListener('click', (e) => {
    // 1. CORAZÓN (FAVORITOS)
    const corazon = e.target.closest('.fa-heart');
    if (corazon) {
        const card = corazon.closest('.product-card');
        const nombreProducto = card.querySelector('h4').innerText;

        corazon.classList.toggle('fas');
        corazon.classList.toggle('far');
        corazon.classList.toggle('active');

        if (favoritos.includes(nombreProducto)) {
            favoritos = favoritos.filter(item => item !== nombreProducto);
        } else {
            favoritos.push(nombreProducto);
        }
        localStorage.setItem('misFavoritos', JSON.stringify(favoritos));
        if (typeof dibujarFavoritos === 'function') dibujarFavoritos();
        return; 
    }

    // 2. TALLAS
    const chip = e.target.closest('.size-chip');
    if (chip) {
        const parent = chip.parentElement;
        parent.querySelectorAll('.size-chip').forEach(s => s.classList.remove('selected'));
        chip.classList.add('selected');
        return;
    }

    // 3. BOTÓN AGREGAR
    const boton = e.target.closest('.add-btn');
    if (boton) {
        const card = boton.closest('.product-card');
        const tallaElegida = card.querySelector('.size-chip.selected')?.innerText || "M";

        const producto = {
            nombre: card.querySelector('h4').innerText,
            precio: card.querySelector('.price-tag').innerText,
            talla: tallaElegida
        };

        carrito.push(producto);

        if(cartBadge) {
            cartBadge.innerText = carrito.length;
            cartBadge.classList.remove('animar-badge');
            void cartBadge.offsetWidth; 
            cartBadge.classList.add('animar-badge');
        }

        mostrarMensajeAgregado(`${producto.nombre} (${tallaElegida})`);
        boton.style.backgroundColor = "var(--turquesa-dark)";
        setTimeout(() => boton.style.backgroundColor = "var(--turquesa)", 200);
    }
});

// --- LÓGICA DEL MODAL ---
btnAbrirModal.onclick = function() {
    renderizarCarrito();
    modal.style.display = "block";
}

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
                    <span>${prod.nombre} <b style="color:var(--turquesa)">(${prod.talla})</b></span>
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

listaCarritoUI.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-item')) {
        const indexABorrar = e.target.getAttribute('data-index');
        carrito.splice(indexABorrar, 1);
        renderizarCarrito();
    }
});

btnCerrarModal.onclick = () => modal.style.display = "none";
window.onclick = (event) => { 
    if (event.target == modal) modal.style.display = "none"; 
}

document.getElementById("btn-whatsapp-send").onclick = function() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }
    const envio = JSON.parse(localStorage.getItem('datosEnvio')) || null;
    let listaTexto = "";
    carrito.forEach((p, i) => listaTexto += `${i+1}. *${p.nombre}* (${p.talla}) - ${p.precio}\n`);
    
    let mensaje = `¡Hola NovaMarket! 👋\n\n*MI PEDIDO:*\n${listaTexto}\n*Total:* ${totalUI.innerText}\n\n`;
    if (envio) {

        mensaje += `*DATOS DE ENVÍO:*\n📍 *Nombre:* ${envio.nombre}\n🏠 *Dirección:* ${envio.direccion}\n📌 *Referencia:* ${envio.referencia}`;
    } else {
        mensaje += `_(No se proporcionó dirección de entrega)_`;

    }

    window.open(`https://wa.me/${miTelefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
};

actualizarSaludo();
obtenerProductos();
activarBuscadores();








function actualizarSaludo() {




    const saludoElemento = document.querySelector('.user-name span:last-child');


    if (saludoElemento) {
        const hora = new Date().getHours();
        let mensaje = hora < 12 ? "¡Buenos días! ☀️" : hora < 19 ? "¡Buenas tardes! ☕" : "¡Buenas noches! 🌙";
        saludoElemento.innerText = mensaje;
    }
}


function activarBuscadores() {

    const buscadorSuperior = document.querySelector('.search-bar input');


    const buscadorMenu = document.querySelector('.menu-search-box input');


    const filtrarProductos = (evento) => {


        const texto = evento.target.value.toLowerCase().trim();
        document.querySelectorAll('.product-card').forEach(card => {


            const nombre = card.querySelector('h4').innerText.toLowerCase();

            card.style.display = nombre.includes(texto) ? "flex" : "none";
        });




    };


    buscadorSuperior?.addEventListener('input', filtrarProductos);

    buscadorMenu?.addEventListener('input', filtrarProductos);

}

// --- LÓGICA DE FAVORITOS (MODAL) ---
const elModalFav = document.getElementById("fav-modal");
const laListaFav = document.getElementById("fav-items-list");







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

const todosLosItemsMenu = document.querySelectorAll('.cat-item');
let botonFavReal = [...todosLosItemsMenu].find(item => item.innerText.includes("Favorite"));

if (botonFavReal) {
    botonFavReal.onclick = function() {
        dibujarFavoritos();
        elModalFav.style.setProperty('display', 'block', 'important');
    };
}





document.querySelector(".close-fav").onclick = () => elModalFav.style.display = "none";





window.borrarDeFavs = function(n) {
    favoritos = favoritos.filter(x => x !== n);
    localStorage.setItem('misFavoritos', JSON.stringify(favoritos));
    dibujarFavoritos();
    obtenerProductos(); // Esto actualiza los corazones en las cartas




};

// Busca esto al final de tu archivo main.js

function mostrarMensajeAgregado(nombreProducto) {
    const toast = document.createElement('div');
    toast.className = 'toast-notificacion';
    
    // Esta línea limpia el "(M)" o "(L)" para que no salga en la burbuja
    const nombreSinTalla = nombreProducto.split(' (')[0]; 
    
    // Ahora usamos el nombre limpio aquí
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${nombreSinTalla} agregado al carrito `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}



// --- DELIVERY, DATOS Y PROMO (TUS FUNCIONES ORIGINALES) ---

const deliveryModal = document.getElementById("delivery-modal");
const btnDelivery = [...document.querySelectorAll('.cat-item')].find(el => el.innerText.includes("Delivery"));

if (btnDelivery) {
    btnDelivery.onclick = () => deliveryModal.style.display = "block";
}
document.querySelector(".close-delivery").onclick = () => deliveryModal.style.display = "none";

document.getElementById("btn-save-delivery").onclick = function() {
    // Obtenemos los valores de los inputs
    const nombreVal = document.getElementById("del-nombre").value.trim();
    const direccionVal = document.getElementById("del-direccion").value.trim();
    const referenciaVal = document.getElementById("del-referencia").value.trim();

    // VALIDACIÓN: Si nombre o dirección están vacíos
    if (nombreVal === "" || direccionVal === "") {
        alert("⚠️ Por favor, ingrese nombre y dirección"); // El mensaje que pediste
        return; // Esto detiene el código y NO cierra el modal ni guarda nada
    }

    // Si pasó la validación, guardamos
    const datos = {
        nombre: nombreVal,
        direccion: direccionVal,
        referencia: referenciaVal
    };

    localStorage.setItem('datosEnvio', JSON.stringify(datos));
    
    // Usamos tu función de mensaje verde para confirmar
    mostrarMensajeAgregado("Datos ");
    
    // Cerramos el modal
    deliveryModal.style.display = "none";
};




const infoModal = document.getElementById("info-modal");
const btnDatos = [...document.querySelectorAll('.cat-item')].find(item => item.innerText.includes("Datos"));
if (btnDatos) btnDatos.onclick = () => infoModal.style.display = "block";
document.querySelector(".close-info").onclick = () => infoModal.style.display = "none";





const promoModal = document.getElementById("promo-modal");
const listaPromoUI = document.getElementById("promo-items-list");
const btnPromoReal = [...document.querySelectorAll('.cat-item')].find(item => item.innerText.includes("Promo"));

async function dibujarPromociones() {
    // 1. Mostramos el mensaje de carga inmediatamente
    listaPromoUI.innerHTML = '<p style="text-align:center;">Buscando ofertas...</p>';
    
    try {
        const productosRef = collection(db, "productos");
        const q = query(productosRef, where("categoria", "==", "Promo"));
        const querySnapshot = await getDocs(q);

        // 2. Usamos setTimeout para que "espere" 3 segundos (3000 milisegundos)
        setTimeout(() => {
            listaPromoUI.innerHTML = ""; // Limpiamos el mensaje de carga

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
                            <strong style="color:#ff4757;">$${prod.precio}</strong>
                        </div>
                        <button class="add-btn-promo" onclick="agregarDesdePromo('${prod.nombre}', '${prod.precio}')" style="background:#4dbbc4; color:white; border:none; padding:5px 10px; cursor:pointer;">+</button>
                    </div>`;
            });
        }, 3000); // <--- Este es el tiempo en milisegundos

    } catch (error) { 
        console.error(error); 
        listaPromoUI.innerHTML = "<p>Error al buscar ofertas.</p>";
    }
}




if (btnPromoReal) btnPromoReal.onclick = () => { dibujarPromociones(); promoModal.style.display = "block"; };
document.querySelector(".close-promo").onclick = () => promoModal.style.display = "none";


window.agregarDesdePromo = function(nombre, precio) {
    carrito.push({ nombre, precio: "$" + precio, talla: "M" });
    if(cartBadge) cartBadge.innerText = carrito.length;
    mostrarMensajeAgregado(nombre);
};



