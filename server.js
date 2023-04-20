const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3002
const socketio = require('socket.io')
const { captureRejectionSymbol } = require('events')
const app = express()
const server = http.createServer(app)
const io = socketio(server) 
// List of all current users
const connectedUsers = new Set();
const messageList = new Set();
const shapesList = [];
const MAX_MESSAGES = 23;

// allows server to find where this is located
app.use(express.static(path.join(__dirname, "public")))


app.get('/game', (req, res) => {
    res.sendFile(__dirname + '/public/game.html');
  });

// start server 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

io.on('connection', (socket) => {
    console.log('a user connected');

    // grabs all the connected users upon first load
    io.emit('update users', Array.from(connectedUsers));
  
    socket.on('join game', (username) => {
        if (connectedUsers.has(username)) {
            socket.emit('username taken', username + ' is already taken');
        } else {
            socket.emit('username available');
            console.log(username + ' joined the game');
            connectedUsers.add(username);
            socket.data.username = username;
            io.emit('update users', Array.from(connectedUsers));
        }
    });

    socket.on('send message', (message) => {
        const username = socket.data.username
        const messageWithUsername = `${username}: ${message}`;
        messageList.add(messageWithUsername);
        if (messageList.size >= MAX_MESSAGES) {
            messageList.delete(Array.from(messageList)[0]); // Remove the oldest message
          }
        io.emit('update messages', Array.from(messageList));
    });

    socket.on('get messages', () => {
        io.emit('update messages', Array.from(messageList));
    });

    socket.on('leave game', () => {
        console.log(socket.data.username + ' quit the game');
        connectedUsers.delete(socket.data.username);
        // updates the user list
        io.emit('update users', Array.from(connectedUsers));
    });

    socket.on('disconnect', function () {
        console.log(socket.data.username + ' disconnected');
        connectedUsers.delete(socket.data.username);
        // updates the user list
        io.emit('update users', Array.from(connectedUsers));
    });

    socket.on('push shape update', (shape) => {
        shapesList.push(shape)
        io.emit('receive shape update', shape);
    });

    socket.on('request shapes list', () => {
        //console.log(shapesList)
        //var position = shapesList.map(a => a.position);
        socket.emit('receive shapes list', shapesList);
    });

    socket.on('request erase', () => {
        shapesList.length = 0;
        io.emit('erase shape list');
    });

});