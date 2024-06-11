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

let isLoggedIn = false;

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
            window.location.reload();
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
            isLoggedIn = true;
        } else {
            mostrarMensajeIniciarSesion();
        }
    } catch (error) {
        console.error('Error al comprobar la sesión del usuario:', error);
        mostrarMensajeIniciarSesion();
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

function mostrarMensajeIniciarSesion() {
    alert('Debe iniciar sesión para usar el chat');
    openModal('loginModalOverlay', 'loginModal');
}

document.addEventListener('DOMContentLoaded', async () => {
    await comprobarSesion();
});

$(function () {
    var socket = io();

    $('form').submit(function (e) {
        e.preventDefault();
        if (!isLoggedIn) {
            mostrarMensajeIniciarSesion();
            return false;
        }
        var message = $('#input').val();
        var destinatario = $('#destinatario').val();

        if (destinatario) {
            socket.emit('private message', { msg: message, to: destinatario });
        } else {
            socket.emit('chat message', message);
        }

        $('#input').val('');
        return false;
    });

    socket.on('chat message', function (data) {
        var li = $('<li>').text(data.from + ' dice: ' + data.msg);
        $('#messages').append(li);
    });

    socket.on('private message', function (data) {
        var li = $('<li>').text(data.from + ' (privado) dice: ' + data.msg).addClass('mensajePrivado');
        $('#messages').append(li);
    });

    socket.on('usuarios conectados', function (usuarios) {
        $('#usuariosConectados').empty();
        for (const [id, username] of Object.entries(usuarios)) {
            var li = $('<li>').text(username);
            if (id === socket.id) { 
                li.addClass('idPropio');
            }
            $('#usuariosConectados').append(li);
        }
    });
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

function mostrarDatos(data) {
    var contenido = document.getElementById('contenido');

    data.forEach(torneo => {
        mostrarJornadas(torneo.fases[0].grupos, contenido);
    });
}

function mostrarJornadas(grupos, contenido) {
    grupos.forEach(grupo => {
        var jornadaDiv = document.createElement('div');
        jornadaDiv.classList.add('jornada');
        jornadaDiv.innerHTML = `<h2 class="h2_jornada">JORNADA ${grupo.jornada}</h2>`;

        grupo.partidos.forEach(partido => {
            var partidoDiv = document.createElement('div');
            let array_goles = partido.datos.resultado.split('-');

            partidoDiv.classList.add('partido_jornada');
            partidoDiv.innerHTML = `
    <div class="tarjeta_partido">
        <img class="foto_grupos" src="${partido.foto}">
        <div class="linea_1">
            <h1 class="nombre_equipo_local">${partido.datos.local}</h1> 
            <h1 class="guion">-</h1> 
            <h1 class="nombre_equipo_visitante">${partido.datos.visitante}</h1>
        </div>
        <div class="contenedor_resultado">
            <p class="resultado_local">${array_goles[0].trim()}</p>
            <p class="resultado_visitante">${array_goles[1].trim()}</p>
        </div>
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

            jornadaDiv.appendChild(partidoDiv);
        });

        contenido.appendChild(jornadaDiv);
    });
}

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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/feed');
        const rss = await response.json();
        const noticiasDiv = document.getElementById('noticias');

        rss.items.forEach(item => {

            const content = item.content;
            const title = item.title;
            const link = item.link;
            const description = item.contentSnippet;
            const pubDate = item.pubDate;

            const noticiaDiv = document.createElement('div');
            noticiaDiv.classList.add('noticia');

            noticiaDiv.innerHTML = `
        <div class="tarjeta_noticia">
            <a class="titulo_noticia" href="${link}" target="_blank">${title}</a>
            <p class="descripcion_noticia">${content}</p>
            <p class="fecha_noticia">${new Date(pubDate).toLocaleDateString()}</p>
        </div>
    `;
            noticiasDiv.appendChild(noticiaDiv);
        });
    } catch (error) {
        console.error('Error al cargar las noticias:', error);
    }
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
        mostrarSemis(torneo.fases[2].semis, contenido);
    });
}

function mostrarSemis(semis, contenido) {
    semis.forEach(semi => {
        var semisDiv = document.createElement('div');
        semisDiv.classList.add('semis');
        semisDiv.innerHTML = `<h2 class="h2_semis">SEMIFINALES</h2>`;

        semi.partidos.forEach(partido => {
            var partidoDiv = document.createElement('div');
            let array_goles = partido.datos.resultado.split('-');

            partidoDiv.classList.add('partido');
            partidoDiv.innerHTML = `
    <div class="tarjeta_partido">
        <img class="foto_semis" src="${partido.foto}">
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
            semisDiv.appendChild(partidoDiv);
        });
        contenido.appendChild(semisDiv);
    });
}

document.addEventListener('DOMContentLoaded', cargarDatos);

document.addEventListener('DOMContentLoaded', async () => {
    comprobarSesion();
});