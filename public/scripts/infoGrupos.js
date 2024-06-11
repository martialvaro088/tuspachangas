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
});

document.addEventListener("DOMContentLoaded", function () {
    fetch('/getGrupos')
        .then(response => response.json())
        .then(data => mostrarTabla(data))
        .catch(error => console.error('Error:', error));

    function mostrarTabla(data) {
        const contenedor = document.getElementById('tabla_grupos');

        data.forEach(documento => {
            documento.grupos.forEach(grupo => {
                const table = document.createElement('table');
                const caption = document.createElement('caption');
                caption.textContent = grupo.nombre;
                table.appendChild(caption);

                const thead = document.createElement('thead');
                thead.innerHTML = `
            <tr>
                <th>Equipo</th>
                <th>Partidos</th>
                <th>Victorias</th>
                <th>Derrotas</th>
                <th>Empates</th>
                <th>Goles a favor</th>
                <th>Goles en contra</th>
                <th>Diferencia de goles</th>
                <th>Puntos</th>
            </tr>
        `;
                table.appendChild(thead);

                const tbody = document.createElement('tbody');
                grupo.equipos.forEach(equipo => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                <td class="nombre_equipo">${equipo.nombre}</td>
                <td>${equipo.partidos}</td>
                <td>${equipo.victorias}</td>
                <td>${equipo.derrotas}</td>
                <td>${equipo.empates}</td>
                <td>${equipo.goles_a_favor}</td>
                <td>${equipo.goles_en_contra}</td>
                <td>${equipo.diferencia_de_goles}</td>
                <td>${equipo.puntos}</td>
            `;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);

                contenedor.appendChild(table);
            });
        });
    }
});