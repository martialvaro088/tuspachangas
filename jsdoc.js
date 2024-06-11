/**
 * Abre el modal de inicio de sesión cuando se hace clic en el enlace correspondiente.
 * @event
 * @param {Event} event - El evento de clic.
 */
document.getElementById('openLoginModalLink').addEventListener('click', function (event) {
    event.preventDefault();
    openModal('loginModalOverlay', 'loginModal');
});

/**
 * Cierra el modal de inicio de sesión cuando se hace clic en el botón correspondiente.
 * @event
 */
document.getElementById('closeLoginModalButton').addEventListener('click', function () {
    closeModal('loginModalOverlay', 'loginModal');
});

/**
 * Abre el modal de registro y cierra el modal de inicio de sesión cuando se hace clic en el botón correspondiente.
 * @event
 */
document.getElementById('openRegisterModalButton').addEventListener('click', function () {
    closeModal('loginModalOverlay', 'loginModal');
    openModal('registerModalOverlay', 'registerModal');
});

/**
 * Cierra el modal de registro cuando se hace clic en el botón correspondiente.
 * @event
 */
document.getElementById('closeRegisterModalButton').addEventListener('click', function () {
    closeModal('registerModalOverlay', 'registerModal');
});

/**
 * Abre un modal.
 * @function
 * @param {string} overlayId - El ID del overlay del modal.
 * @param {string} modalId - El ID del modal.
 */
function openModal(overlayId, modalId) {
    const overlay = document.getElementById(overlayId);
    const modal = document.getElementById(modalId);
    if (overlay && modal) {
        overlay.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10); // Timeout to trigger CSS transition
    } else {
        console.error(`Element with id '${overlayId}' or '${modalId}' not found`);
    }
}

/**
 * Cierra un modal.
 * @function
 * @param {string} overlayId - El ID del overlay del modal.
 * @param {string} modalId - El ID del modal.
 */
function closeModal(overlayId, modalId) {
    const overlay = document.getElementById(overlayId);
    const modal = document.getElementById(modalId);
    if (overlay && modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300); // Duration of the CSS transition
    } else {
        console.error(`Element with id '${overlayId}' or '${modalId}' not found`);
    }
}

/**
 * Inicia sesión del usuario.
 * @async
 * @function
 */
async function iniciarSesion() {
    const username = document.getElementById('usuario').value;
    const password = document.getElementById('clave').value;

    try {
        const response = await fetch('/identificar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const result = await response.json();
        if (result.res === 'login true') {
            comprobarSesion();
        } else {
            alert("Inicio de sesión fallido.");
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
    }
}

/**
 * Registra un nuevo usuario.
 * @async
 * @function
 */
async function registrarUsuario() {
    const username = document.getElementById('new_usuario').value;
    const password = document.getElementById('new_clave').value;

    try {
        const response = await fetch('/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const result = await response.json();
        if (result.res !== 'register true') {
            alert("Registro de usuario fallido.");
        }
    } catch (error) {
        console.error('Error al registrar usuario:', error);
    }
}

/**
 * Comprueba si el usuario tiene una sesión activa.
 * @async
 * @function
 */
async function comprobarSesion() {
    try {
        const response = await fetch('/usuario');
        const result = await response.json();
        if (result.loggedIn) {
            mostrarNombreUsuario(result.username, result.equipoFavorito);
        }
    } catch (error) {
        console.error('Error al comprobar la sesión del usuario:', error);
    }
}

/**
 * Muestra el nombre del usuario y su equipo favorito en la interfaz.
 * @function
 * @param {string} username - El nombre del usuario.
 * @param {string} equipoFavorito - El equipo favorito del usuario.
 */
function mostrarNombreUsuario(username, equipoFavorito) {
    const usernameContainer = document.getElementById('usernameContainer');
    usernameContainer.innerHTML = `
        <img class="icono_user" src="/assets/icons/icono_usuario.png" alt="icon_user">
        <p class="saludo_usuario">${username}</p>
        <img class="icono_selec" src="/assets/icons/${equipoFavorito}.png" alt="icon_user">
        ${equipoFavorito ? `<p class="equipo_fav">${equipoFavorito}</p>` : " "}`;
}

/**
 * Comprueba la sesión del usuario al cargar el contenido del DOM.
 * @event
 */
document.addEventListener('DOMContentLoaded', async () => {
    comprobarSesion();
});
