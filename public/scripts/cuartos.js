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

document.addEventListener('DOMContentLoaded', async () => {
    comprobarSesion();
    cargarDatos();
});

function cargarDatos() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/getEurocopa', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            mostrarDatos(data);
        }
    };
    xhr.send();
}

function mostrarDatos(data) {
    var contenido = document.getElementById('contenido');

    data.forEach(torneo => {
        mostrarCuartos(torneo.fases[1].cuartos, contenido);
    });
}

function mostrarCuartos(cuartos, contenido) {
    cuartos.forEach(cuarto => {
        var cuartosDiv = document.createElement('div');
        cuartosDiv.classList.add('cuartos');
        cuartosDiv.innerHTML = `<h2 class="h2_cuartos">CUARTOS DE FINAL</h2>`;

        cuarto.partidos.forEach(partido => {
            var partidoDiv = document.createElement('div');
            let array_goles = partido.datos.resultado.split('-');

            partidoDiv.classList.add('partido_cuartos');
            partidoDiv.innerHTML = `
    <div class="tarjeta_partido">
        <img class="foto_cuartos" src="${partido.foto}">
        <div class="linea_1">
            <h1 class="nombre_equipo_local">${partido.datos.local}</h1> 
            <h1 class="guion">-</h1> 
            <h1 class="nombre_equipo_visitante">${partido.datos.visitante}</h1>
        </div>
        <div class="contenedor_resultado">
            <p class="resultado_local">${array_goles[0].trim()}</p>
            <p class="resultado_visitante">${array_goles[1].trim()}</p>
        </div>
        ${partido.penaltis ? `<p class="penaltis">(${partido.penaltis}.pen)</p>` : ``}
        <div class="contenedor_icono_balon">
            <img class="icono_balon" src="assets/icons/icono_balon.png">
        </div>
        <div class="goles"> 
            <div class="goles_locales">
                ${partido.datos.goles.filter(gol => gol.equipo === "local").length > 0 ? partido.datos.goles.filter(gol => gol.equipo === "local").map(gol => `<p class="gol_local">${gol.minuto}' ${gol.jugador}</p>`).join('') : '<p class="gol_local"></p>'}
            </div>
            <div class="goles_visitantes">
                ${partido.datos.goles.filter(gol => gol.equipo === "visitante").length > 0 ? partido.datos.goles.filter(gol => gol.equipo === "visitante").map(gol => `<p class="gol_visitante">${gol.minuto}' ${gol.jugador}</p>`).join('') : '<p class="gol_visitante"></p>'}
            </div>
        </div>
        <div class="linea_abajo">
            <img class="icono_youtube" src="assets/icons/icono_youtube.png">
            <p class="fecha">${partido.datos.fecha}</p>
        </div>
    </div>
`;

            cuartosDiv.appendChild(partidoDiv);
        });

        contenido.appendChild(cuartosDiv);
    });
}