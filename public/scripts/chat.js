let isLoggedIn = false;

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
                }, 10);
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
                }, 300);
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