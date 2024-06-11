document.getElementById('openLoginModalLink').addEventListener('click', function (event) {
    event.preventDefault();
    openModal('loginModalOverlay', 'loginModal');
});

document.getElementById('closeLoginModalButton').addEventListener('click', function () {
    closeModal('loginModalOverlay', 'loginModal');
});

document.getElementById('openRegisterModalButton').addEventListener('click', function () {
    closeModal('loginModalOverlay', 'loginModal');
    openModal('registerModalOverlay', 'registerModal');
});

document.getElementById('closeRegisterModalButton').addEventListener('click', function () {
    closeModal('registerModalOverlay', 'registerModal');
});

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
        alert("Inicio de sesión fallido.");
        if (result.res === 'login true') {
            comprobarSesion();
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
    }
}

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
        alert("Registro de usuario fallido.");
    } catch (error) {
        console.error('Error al registrar usuario:', error);
    }
}

async function comprobarSesion() {
    try {
        const response = await fetch('/usuario');
        const result = await response.json();
        if (result.loggedIn) {
            mostrarNombreUsuario(result.username, result.equipoFavorito);
            mostrarJugadorFavorito(result.jugadorFavorito);
        }
    } catch (error) {
        console.error('Error al comprobar la sesión del usuario:', error);
    }
}

function mostrarNombreUsuario(username, equipoFavorito) {
    const usernameContainer = document.getElementById('usernameContainer');
    usernameContainer.innerHTML = `
    <img class="icono_user" src="/assets/icons/icono_usuario.png" alt="icon_user">
    <p class ="saludo_usuario">${username}</p>
    <img class="icono_selec" src="/assets/icons/${equipoFavorito}.png" alt="icon_user">
    ${equipoFavorito ? `<p class="equipo_fav">${equipoFavorito}</p>` : " "}`;
}

function mostrarJugadorFavorito(jugadorFavorito) {
    const jugadorFavoritoContainer = document.getElementById('jugador_favorito');
    jugadorFavoritoContainer.innerHTML = `
    <p class="jugador_fav">Jugador Favorito: ${jugadorFavorito}</p>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    comprobarSesion();
});

async function marcarFavorito(seleccionId) {
    try {
        const response = await fetch('/marcarFavorito', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ seleccionId }),
        });
        const result = await response.json();
        alert("Se ha producido un error al marcar como favorito");
    } catch (error) {
        console.error('Error al marcar como favorito:', error);
    }
}

async function marcarJugadorFavorito(jugadorNombre) {
    try {
        const response = await fetch('/marcarJugadorFavorito', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jugadorNombre }),
        });
        const result = await response.json();
        alert(result.res);
        comprobarSesion();
    } catch (error) {
        console.error('Error al marcar jugador como favorito:', error);
    }
}

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', '/getSelecciones', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

document.addEventListener("DOMContentLoaded", function () {
    fetch('/getSelecciones')
        .then(response => response.json())
        .then(data => mostrarSelecciones(data))
        .catch(error => console.error('Error:', error));

    function mostrarSelecciones(data) {
        const contenedor = document.getElementById('container_selecciones');

        data.forEach(seleccion => {
            const seleccionDiv = document.createElement('div');
            seleccionDiv.className = 'seleccion';
            seleccionDiv.innerHTML = `
    <div class="tarjeta_seleccion">
        <img class="escudo_seleccion" src="${seleccion.escudo}">
        <p class="p_nombre">${seleccion.nombre}</p>
        <p class="p_entrenador">Seleccionador: ${seleccion.seleccionador}</p>
        <a class="info_seleccion">
            <img class="icon_info" src="/assets/icons/icono_info.png" onclick="irSeleccion(${seleccion.id})">
        </a>
        <a class="chat_seleccion" onclick="marcarFavorito('${seleccion._id}')">
            <img class="icon_chat" src="/assets/icons/icono_estrella.png">
        </a>
    </div>
`;
            contenedor.appendChild(seleccionDiv);
        });
    }
});

function irSeleccion(id) {
    // Redirigir a otra página o mostrar más información sobre la selección
    console.log("Seleccion ID:", id);
    // Aquí puedes agregar la lógica para redirigir a otra página o mostrar un modal con más información
}

function irSeleccion(id_seleccion) {
    window.location.href = `equipos?param=${id_seleccion}`;
}

async function mostrarJugadores(id_seleccion) {
    try {
        const response = await fetch(`/getJugadores?seleccionId=${id_seleccion}`);
        const data = await response.json();
        const contenedor = document.getElementById('container_jugadores');
        contenedor.innerHTML = '';

        data.forEach(jugador => {
            const jugadorDiv = document.createElement('div');
            jugadorDiv.className = 'jugador';
            jugadorDiv.innerHTML = `
            <div class="tarjeta_jugador">
                <img class="foto_jugador" src="${jugador.foto}">
                <p class="nombre_jugador">${jugador.nombre}</p>
                <p class="posicion_jugador">Posición: ${jugador.posicion}</p>
                <p class="club_jugador">Club: ${jugador.club}</p>
                <button onclick="marcarJugadorFavorito('${jugador.nombre}')">Marcar como favorito</button>
            </div>
            `;
            contenedor.appendChild(jugadorDiv);
        });
    } catch (error) {
        console.error('Error al obtener los jugadores:', error);
    }
}