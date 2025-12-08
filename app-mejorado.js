// =========================================================
// VARIABLES GLOBALES Y ELEMENTOS DEL DOM
// =========================================================

const URL_API = 'https://fakestoreapi.com/products?limit=8';
const LISTA_PRODUCTOS_HTML = document.querySelector('.lista-productos');
const CONTADOR_CARRITO_HTML = document.getElementById('contador-carrito');
const MODAL_CARRITO_HTML = document.getElementById('modal-carrito');
const CARRITO_LISTA_HTML = document.getElementById('carrito-lista');
const CARRITO_TOTAL_HTML = document.getElementById('carrito-total');
const BOTONES_CATEGORIA = document.querySelectorAll('.producto');
const FORMULARIO_CONTACTO = document.querySelector('#contacto form');
const LOADER_HTML = document.getElementById('loader');
const TOAST_CONTAINER = document.getElementById('toast-container');
const BUSCADOR_HTML = document.getElementById('busqueda-productos');

let productosDisponibles = []; 
let carrito = JSON.parse(localStorage.getItem('carritoDietetica')) || []; 

// Nombres y rutas de imagen locales para la dietética
const productosDietetica = [
    { titulo: "Almendras (x 100g)", categoria: "frutos-secos", imagen: "./images/Almendras.jpg" },
    { titulo: "Maní (x 100g)", categoria: "frutos-secos", imagen: "./images/Maní.jpg" },
    { titulo: "Caju (x 500g)", categoria: "frutos-secos", imagen: "./images/Caju.jpg" },
    { titulo: "Garbanzo (x500g)", categoria: "legumbres", imagen: "./images/Garbanzos.jpg" },
    { titulo: "Lentejas (x 500g)", categoria: "legumbres", imagen: "./images/Lentejas.jpg" },
    { titulo: "Nueces (x 100g)", categoria: "frutos-secos", imagen: "./images/Nueces.jpg" },
    { titulo: "Té Verde (en hebras)", categoria: "infusiones", imagen: "./images/te-verde.jpg" },
    { titulo: "Galletas Sin TACC", categoria: "sin-tacc", imagen: "./images/galletas-sintacc.jpg" },
    { titulo: "Avena instantánea", categoria: "cereales", imagen: "./images/avena.jpg" },
    { titulo: "Aceite de Oliva Extra Virgen", categoria: "aceites", imagen: "./images/aceite-oliva.jpg" },
    { titulo: "Semillas de Chía", categoria: "semillas", imagen: "./images/semillas-chia.jpg" },
    { titulo: "Manzana", categoria: "disecadas", imagen: "./images/disecadas.jpg" },
    { titulo: "Castaña de Caju (x 500g)", categoria: "frutos-secos", imagen: "./images/Caju.png" },
];

// =========================================================
// SISTEMA DE NOTIFICACIONES TOAST
// =========================================================

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    TOAST_CONTAINER.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =========================================================
// CONTROL DEL LOADER
// =========================================================

function mostrarLoader() {
    LOADER_HTML.style.display = 'block';
}

function ocultarLoader() {
    LOADER_HTML.style.display = 'none';
}

// =========================================================
// CONSUMO DE API CON LOADER
// =========================================================

async function obtenerProductosAPI() {
    mostrarLoader();
    try {
        const respuesta = await fetch(URL_API);
        if (!respuesta.ok) {
            throw new Error(`Error en la solicitud: ${respuesta.status}`);
        }
        const datosAPI = await respuesta.json();
        
        // Mapeamos los datos de la API con los datos locales
        productosDisponibles = datosAPI.map((producto, index) => {
            const dataLocal = productosDietetica[index % productosDietetica.length];
            return {
                id: producto.id,
                titulo: dataLocal.titulo,
                imagen: dataLocal.imagen,
                precio: parseFloat(producto.price * 500).toFixed(0),
                category: dataLocal.categoria
            };
        });
        
        mostrarProductos(productosDisponibles);
        ocultarLoader();
        
    } catch (error) {
        console.error("Error al obtener datos de la API:", error);
        LISTA_PRODUCTOS_HTML.innerHTML = '<p class="error-msg">No se pudieron cargar los productos. Por favor, intente más tarde.</p>';
        ocultarLoader();
        mostrarToast('Error al cargar productos', 'error');
    }
}

// =========================================================
// RENDERIZAR PRODUCTOS EN EL DOM
// =========================================================

function mostrarProductos(productos) {
    LISTA_PRODUCTOS_HTML.innerHTML = '';
    
    if (productos.length === 0) {
        LISTA_PRODUCTOS_HTML.innerHTML = '<p class="no-resultados">No se encontraron productos</p>';
        return;
    }
    
    productos.forEach(producto => {
        const item = document.createElement('div');
        item.classList.add('producto-item');
        item.setAttribute('data-category', producto.category);
        
        item.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.titulo}" loading="lazy">
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
// FILTRADO POR CATEGORÍA
// =========================================================

function aplicarFiltro() {
    BOTONES_CATEGORIA.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Remover clase 'activo' de todos
            BOTONES_CATEGORIA.forEach(b => b.classList.remove('activo'));
            e.target.classList.add('activo');

            // Obtener categoría seleccionada
            const categoriaSeleccionada = e.target.dataset.category;
            
            // Filtrar productos
            let productosParaMostrar = [];

            if (categoriaSeleccionada === 'todos') {
                productosParaMostrar = productosDisponibles;
            } else {
                productosParaMostrar = productosDisponibles.filter(
                    prod => prod.category === categoriaSeleccionada
                );
            }

            mostrarProductos(productosParaMostrar);

            if (productosParaMostrar.length === 0) {
                LISTA_PRODUCTOS_HTML.innerHTML = `<p class="no-resultados">No hay productos en esta categoría</p>`;
            }
        });
    });
}

// =========================================================
// BÚSQUEDA DE PRODUCTOS
// =========================================================

function filtrarPorBusqueda(termino) {
    const terminoLower = termino.toLowerCase();
    const productosFiltrados = productosDisponibles.filter(prod =>
        prod.titulo.toLowerCase().includes(terminoLower)
    );
    
    if (productosFiltrados.length === 0 && termino.trim() !== '') {
        LISTA_PRODUCTOS_HTML.innerHTML = `<p class="no-resultados">No se encontraron productos para "${termino}"</p>`;
    } else if (termino.trim() === '') {
        mostrarProductos(productosDisponibles);
    } else {
        mostrarProductos(productosFiltrados);
    }
}

// =========================================================
// CARRITO DE COMPRAS - GESTIÓN
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

    if (!productoAPI) return;

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
    mostrarToast(`✓ "${productoAPI.titulo}" añadido al carrito`, 'success');
}

// =========================================================
// CARRITO - RENDERIZACIÓN Y EDICIÓN
// =========================================================

function renderizarCarrito() {
    CARRITO_LISTA_HTML.innerHTML = '';
    let totalCompra = 0;

    if (carrito.length === 0) {
        CARRITO_LISTA_HTML.innerHTML = '<li style="text-align: center; color: #999; border-left: none;"><p>El carrito está vacío. ¡Comienza a comprar!</p></li>';
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
    const productoEliminado = carrito.find(p => p.id === idEliminar);
    carrito = carrito.filter(prod => prod.id !== idEliminar);
    guardarCarrito();
    renderizarCarrito();
    mostrarToast(`✓ "${productoEliminado.titulo}" eliminado del carrito`, 'info');
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
        manejarEliminarProducto(e);
    }
}

// =========================================================
// VALIDACIÓN DE FORMULARIO
// =========================================================

function validarFormulario(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    
    if (!nombre || !email || !mensaje) {
        mostrarToast("Todos los campos son obligatorios.", 'warning');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarToast("Por favor, ingrese un correo electrónico válido.", 'warning');
        return;
    }

    mostrarToast("✅ ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.", 'success');
    e.target.reset();
}

// =========================================================
// INICIALIZACIÓN DEL PROYECTO
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    obtenerProductosAPI(); 
    aplicarFiltro(); 
    actualizarContadorCarrito();
    
    if (FORMULARIO_CONTACTO) {
        FORMULARIO_CONTACTO.addEventListener('submit', validarFormulario);
    }
    
    // Búsqueda de productos
    if (BUSCADOR_HTML) {
        BUSCADOR_HTML.addEventListener('input', (e) => {
            filtrarPorBusqueda(e.target.value);
        });
    }
    
    // Modal del carrito
    const iconoCarrito = document.getElementById('icono-carrito'); 
    if (iconoCarrito) {
        iconoCarrito.addEventListener('click', () => {
            renderizarCarrito(); 
            MODAL_CARRITO_HTML.style.display = 'block';
        });
    }
    
    // Cerrar modal
    const cerrarModal = document.querySelector('.cerrar-modal');
    if (cerrarModal) {
        cerrarModal.addEventListener('click', () => {
            MODAL_CARRITO_HTML.style.display = 'none';
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === MODAL_CARRITO_HTML) {
            MODAL_CARRITO_HTML.style.display = 'none';
        }
    });
});
