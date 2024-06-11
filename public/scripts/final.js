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
        mostrarFinal(torneo.fases[3].final, contenido);
    });
}

function mostrarFinal(finales, contenido) {
    finales.forEach(final => {
        var finalesDiv = document.createElement('div');
        finalesDiv.classList.add('finales');
        finalesDiv.innerHTML = `<h2 class="h2_final">FINAL</h2>`;

        final.partidos.forEach(partido => {
            var partidoDiv = document.createElement('div');
            let array_goles = partido.datos.resultado.split('-');

            partidoDiv.classList.add('partido_final');
            partidoDiv.innerHTML = `
    <div class="tarjeta_partido_final">
        <div class="contenedor_foto_final">
            <img class="foto_final" src="${partido.foto}">
        </div>
        <div class="linea_1_final">
            <h1 class="nombre_equipo_local_final">${partido.datos.local}</h1> 
            <h1 class="guion_final">-</h1> 
            <h1 class="nombre_equipo_visitante_final">${partido.datos.visitante}</h1>
        </div>
        <div class="contenedor_resultado_final">
            <p class="resultado_local_final">${array_goles[0].trim()}</p>
            <p class="resultado_visitante_final">${array_goles[1].trim()}</p>
        </div>
        <div class="contenedor_icono_balon_final">
            <img class="icono_balon_final" src="assets/icons/icono_balon.png">
        </div>
        <div class="goles_final"> 
            <div class="goles_locales_final">
                ${partido.datos.goles.filter(gol => gol.equipo === "local").length > 0 ? partido.datos.goles.filter(gol => gol.equipo === "local").map(gol => `<p class="gol_local_final">${gol.minuto}' ${gol.jugador}</p>`).join('') : '<p class="gol_local_final"></p>'}
            </div>
            <div class="goles_visitantes_final">
                ${partido.datos.goles.filter(gol => gol.equipo === "visitante").length > 0 ? partido.datos.goles.filter(gol => gol.equipo === "visitante").map(gol => `<p class="gol_visitante_final">${gol.minuto}' ${gol.jugador}</p>`).join('') : '<p class="gol_visitante_final"></p>'}
            </div>
        </div>
        <div class="linea_abajo_final">
            <img class="icono_youtube_final" src="assets/icons/icono_youtube.png">
            <p class="fecha_final">${partido.datos.fecha}</p>
        </div>
    </div>
`;
            finalesDiv.appendChild(partidoDiv);
        });

        contenido.appendChild(finalesDiv);
    });
}