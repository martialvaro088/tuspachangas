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

document.addEventListener('DOMContentLoaded', (event) => {
    // Obtener los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const seleccionId = params.get('param'); // Obtener el valor del parámetro 'param'

    if (seleccionId) {
        // Hacer una solicitud a la API para obtener los datos de la selección específica
        fetch(`/getSeleccion/${seleccionId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (!data.jugadores || !Array.isArray(data.jugadores)) {
                    throw new Error('Formato de datos incorrecto');
                }
                mostrarTabla([data]); // Pasar un array con un solo elemento
            })
            .catch(error => console.error('Error:', error));
    } else {
        console.error('No se proporcionó un ID de selección en la URL.');
    }
});

function mostrarTabla(data) {
    const contenedor = document.getElementById('tabla_selecciones');
    contenedor.innerHTML = ''; // Limpiar contenido anterior

    data.forEach(seleccion => {
        const table = document.createElement('table');
        const caption = document.createElement('caption');
        caption.textContent = seleccion.nombre + ' - ' + seleccion.seleccionador;
        table.appendChild(caption);

        const thead = document.createElement('thead');
        thead.innerHTML = `
<tr>
    <th>Número</th>
    <th>Nombre</th>
    <th>Posición</th>
    <th>Edad</th>
    <th>Club</th>
    <th>Goles</th>
</tr>
`;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        seleccion.jugadores.forEach(jugador => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
    <td>${jugador.numero}</td>
    <td>${jugador.nombre}</td>
    <td>${jugador.posicion}</td>
    <td>${jugador.edad}</td>
    <td>${jugador.club}</td>
    <td>${jugador.goles}</td>
`;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        contenedor.appendChild(table);
    });
}