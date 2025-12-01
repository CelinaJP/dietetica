// =========================================================
// 7. VARIABLES GLOBALES Y CONSUMO DE API
// =========================================================

const URL_API = 'https://fakestoreapi.com/products?limit=8'; 
const LISTA_PRODUCTOS_HTML = document.querySelector('.lista-productos');
const CONTADOR_CARRITO_HTML = document.getElementById('contador-carrito');
const MODAL_CARRITO_HTML = document.getElementById('modal-carrito');
const CARRITO_LISTA_HTML = document.getElementById('carrito-lista');
const CARRITO_TOTAL_HTML = document.getElementById('carrito-total');
const BOTONES_CATEGORIA = document.querySelectorAll('.producto');
const FORMULARIO_CONTACTO = document.querySelector('#contacto form');
let productosDisponibles = []; 
let carrito = JSON.parse(localStorage.getItem('carritoDietetica')) || []; 

// Nombres y rutas de imagen locales para la dietética (Para poder poner tus fotos)
const productosDietetica = [
    { titulo: "Almendras (x 100g)", categoria: "frutos-secos", imagen: "./images/almendras.jpg" },
    { titulo: "Lentejas (x 500g)", categoria: "legumbres", imagen: "./images/lentejas.jpg" },
    { titulo: "Nueces (x 100g)", categoria: "frutos-secos", imagen: "./images/nueces.jpg" },
    { titulo: "Té Verde (en hebras)", categoria: "infusiones", imagen: "./images/te-verde.jpg" },
    { titulo: "Galletas Sin TACC", categoria: "sin-tacc", imagen: "./images/galletas-sintacc.jpg" },
    { titulo: "Avena instantánea", categoria: "cereales", imagen: "./images/avena.jpg" },
    { titulo: "Aceite de Oliva Extra Virgen", categoria: "aceites", imagen: "./images/aceite-oliva.jpg" },
    { titulo: "Semillas de Chía", categoria: "semillas", imagen: "./images/semillas-chia.jpg" }
];


// Función para obtener productos de la API usando Fetch
async function obtenerProductosAPI() {
    try {
        const respuesta = await fetch(URL_API);
        if (!respuesta.ok) {
            throw new Error(`Error en la solicitud: ${respuesta.status}`);
        }
        const datosAPI = await respuesta.json();
        
        // Mapeamos los datos de la API con los datos locales para usar TUS FOTOS
        productosDisponibles = datosAPI.map((producto, index) => {
            const dataLocal = productosDietetica[index % productosDietetica.length];
            return {
                id: producto.id,
                titulo: dataLocal.titulo,
                imagen: dataLocal.imagen, // Usamos la ruta local de la imagen
                precio: parseFloat(producto.price * 500).toFixed(0), // Escalamos el precio
                category: dataLocal.categoria
            };
        });

        mostrarProductos(productosDisponibles);
    } catch (error) {
        console.error("Error al obtener datos de la API:", error);
        LISTA_PRODUCTOS_HTML.innerHTML = '<p class="error-msg">No se pudieron cargar los productos. Por favor, intente más tarde.</p>';
    }
}

// Función para renderizar los productos en el DOM
function mostrarProductos(productos) {
    LISTA_PRODUCTOS_HTML.innerHTML = '';
    
    productos.forEach(producto => {
        const item = document.createElement('div');
        item.classList.add('producto-item');
        item.setAttribute('data-category', producto.category);
        
        item.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.titulo}">
            <h4>${producto.titulo}</h4>
            <p>$${producto.precio}</p>
            <button class="btn-agregar" data-id="${producto.id}">Agregar al Carrito</button>
        `;
        LISTA_PRODUCTOS_HTML.appendChild(item);
    });
    
    document.querySelectorAll('.btn-agregar').forEach(button => {
        button.addEventListener('click', manejarAgregarCarrito);
    });
}


// =========================================================
// 7. MANEJO DE FILTRADO (DOM)
// =========================================================

function aplicarFiltro() {
    BOTONES_CATEGORIA.forEach(boton => {
        boton.addEventListener('click', () => {
            const categoriaSeleccionada = boton.dataset.category;
            const productosDOM = document.querySelectorAll('.lista-productos .producto-item');

            // Manejo de clase 'activo'
            BOTONES_CATEGORIA.forEach(b => b.classList.remove('activo'));
            boton.classList.add('activo');

            // Filtrado de productos en el DOM
            productosDOM.forEach(producto => {
                const categoriaProducto = producto.dataset.category;
                
                if (categoriaSeleccionada === 'todos' || categoriaProducto === categoriaSeleccionada) {
                    producto.classList.remove('oculto');
                } else {
                    producto.classList.add('oculto');
                }
            });
        });
    });
}


// =========================================================
// 8. CARRITO DE COMPRAS DINÁMICO (localStorage)
// =========================================================

function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
    CONTADOR_CARRITO_HTML.textContent = totalItems;
}

function guardarCarrito() {
    localStorage.setItem('carritoDietetica', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function manejarAgregarCarrito(e) {
    const idProducto = parseInt(e.target.dataset.id);
    const productoExistente = carrito.find(prod => prod.id === idProducto);
    const productoAPI = productosDisponibles.find(prod => prod.id === idProducto);

    if (!productoAPI) return; // Salir si el producto no se encuentra

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: idProducto,
            titulo: productoAPI.titulo,
            precio: parseFloat(productoAPI.precio),
            cantidad: 1
        });
    }
    
    guardarCarrito();
    alert(`"${productoAPI.titulo}" añadido al carrito!`);
}


// =========================================================
// 9. EDICIÓN Y VISUALIZACIÓN DEL CARRITO
// =========================================================

function renderizarCarrito() {
    CARRITO_LISTA_HTML.innerHTML = '';
    let totalCompra = 0;

    if (carrito.length === 0) {
        CARRITO_LISTA_HTML.innerHTML = '<li><p>El carrito está vacío.</p></li>';
    } else {
        carrito.forEach(prod => {
            const subtotal = prod.precio * prod.cantidad;
            totalCompra += subtotal;
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="carrito-item-info">
                    <span>${prod.titulo} ($${prod.precio})</span>
                </div>
                <div class="carrito-item-controles">
                    <input type="number" min="1" value="${prod.cantidad}" data-id="${prod.id}" class="input-cantidad">
                    <button class="btn-eliminar" data-id="${prod.id}">X</button>
                    <span class="carrito-subtotal">$${subtotal.toFixed(0)}</span>
                </div>
            `;
            CARRITO_LISTA_HTML.appendChild(li);
        });
        
        CARRITO_LISTA_HTML.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', manejarEliminarProducto);
        });
        CARRITO_LISTA_HTML.querySelectorAll('.input-cantidad').forEach(input => {
            input.addEventListener('change', manejarCambioCantidad);
        });
    }

    CARRITO_TOTAL_HTML.textContent = `Total: $${totalCompra.toFixed(0)}`;
}

function manejarEliminarProducto(e) {
    const idEliminar = parseInt(e.target.dataset.id);
    carrito = carrito.filter(prod => prod.id !== idEliminar);
    guardarCarrito();
    renderizarCarrito();
}

function manejarCambioCantidad(e) {
    const idProducto = parseInt(e.target.dataset.id);
    const nuevaCantidad = parseInt(e.target.value);
    
    if (nuevaCantidad > 0) {
        const producto = carrito.find(prod => prod.id === idProducto);
        if (producto) {
            producto.cantidad = nuevaCantidad;
            guardarCarrito();
            renderizarCarrito();
        }
    } else {
        // Si la cantidad es 0, se elimina
        manejarEliminarProducto(e);
    }
}


// =========================================================
// 7. VALIDACIÓN DE FORMULARIO (DOM)
// =========================================================

function validarFormulario(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    
    // Validar campos requeridos
    if (!nombre || !email || !mensaje) {
        alert("Todos los campos son obligatorios.");
        return;
    }
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Por favor, ingrese un correo electrónico válido.");
        return;
    }

    // Si todo es válido, simula el envío y muestra mensaje (DOM)
    alert("✅ ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.");
    e.target.reset();
    // Aquí puedes llamar a e.target.submit() para el envío real a Formspree.
}


// =========================================================
// INICIALIZACIÓN
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    obtenerProductosAPI(); 
    aplicarFiltro(); 
    actualizarContadorCarrito();
    
    if (FORMULARIO_CONTACTO) {
        FORMULARIO_CONTACTO.addEventListener('submit', validarFormulario);
    }
    
    // Evento para mostrar el modal del carrito
    const iconoCarrito = document.getElementById('icono-carrito'); 
    if (iconoCarrito) {
        iconoCarrito.addEventListener('click', () => {
            renderizarCarrito(); 
            MODAL_CARRITO_HTML.style.display = 'block';
        });
    }
    
    // Evento para cerrar el modal
    const cerrarModal = document.querySelector('.cerrar-modal');
    if (cerrarModal) {
        cerrarModal.addEventListener('click', () => {
            MODAL_CARRITO_HTML.style.display = 'none';
        });
    }

    // Evento para cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === MODAL_CARRITO_HTML) {
            MODAL_CARRITO_HTML.style.display = 'none';
        }
    });
});