// multiplayer connection
const socket = io();

document.addEventListener('DOMContentLoaded', () => {

    const joinGameButton = document.getElementById('joinGameButton');
    const sendButton = document.getElementById('sendButton');
    const userList = document.getElementById('userList');
    const messageList = document.getElementById('messageList');
    const quitButton = document.getElementById('quitButton');
    const eraseButton = document.getElementById('eraseButton');
    const greeting = document.getElementById('greeting');
    const warning = document.getElementById('warning');

    if (joinGameButton) {
        joinGameButton.addEventListener('click', () => {
            const username = document.getElementById('username').value;
            if (!username) {
                warning.innerHTML = "please enter a username"
            } else {
                socket.emit('join game', username);
                socket.emit('get messages');
                socket.on('username available', () => {
                    console.log('You joined the game as ' + username);
                    greeting.innerHTML = 'Hello ' + username + '!';

                    // code to change what's displayed
                    document.getElementById('loginPage').classList.add('hidden');
                    document.getElementById('gamePage').classList.remove('hidden');
                    // code to recieve what's currently on screen
                    socket.emit('request shapes list');
                    socket.on('receive shapes list', (shapeList) => {
                        var len = shapeList.length;
                        for (var i = 0; i < len; i++) {
                            let point = new Point();
                            point.position = shapeList[i];
                            point.color = [0.5, 0.5, 0.5, 1.0];
                            point.size = 5;

                            g_shapesList.push(point)
                        }
                        renderAllShapes();
                    });

                    setupWebGL()
                    connectVariablesToGLSL()

                    canvas.onmousedown = click;
                    canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev, 1) } };


                });
                socket.on('username taken', (message) => {
                    warning.innerHTML = message
                });
            }
        });
    }

    if(sendButton) {
        sendButton.addEventListener('click', () => {
            const message = document.getElementById('chatInput').value;
            socket.emit('send message', message);
            chatInput.value = '';
        });
    }

    if (quitButton) {
        quitButton.addEventListener('click', () => {
            warning.innerHTML = ''
            socket.emit('leave game');

            // code to change what's displayed
            document.getElementById('gamePage').classList.add('hidden');
            document.getElementById('loginPage').classList.remove('hidden');
        });
    }

    if (userList) {
        socket.on('update users', (users) => {
            //console.log("updating users");
            userList.innerHTML = '';
            users.forEach((user) => {
                const li = document.createElement('li');
                li.appendChild(document.createTextNode(user));
                userList.appendChild(li);
            });
        });
    }

    if (messageList) {
        socket.on('update messages', (messages) => {
            messageList.innerHTML = '';
            messages.forEach((message) => {
                const li = document.createElement('li');
                li.appendChild(document.createTextNode(message));
                messageList.appendChild(li);
            });
        });
    }

    if (eraseButton) {
        eraseButton.addEventListener('click', () => {
            socket.emit('request erase');
        });
    }


    socket.on('receive shape update', (shape) => {
        //console.log("receving shape update")
        let point = new Point();
        point.position = shape.position;
        point.color = shape.color;
        point.size = shape.size;

        g_shapesList.push(point)
        renderAllShapes();
    });

    socket.on('erase shape list', () => {
        g_shapesList = [];
        renderAllShapes();
    });

})