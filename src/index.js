const http = require('http');
const express = require('express');
const Filter = require('bad-words');
const path = require('path');
const socketIo = require('socket.io')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUserInRoom} = require('./utils/users')


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname,'../public')));

io.on('connection', (socket) => {
    console.log('new socket connection');

    socket.on('join', ({username,room}, callback) => {
        const {error, user} = addUser({id : socket.id, username, room});
        if(error){
            return callback(error)
        } 
        socket.join(user.room);

        socket.emit('message', generateMessage('Admin','Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback();

    })
    socket.on('chats', (text,callback) => {
        const user = getUser(socket.id);
        const filter =new Filter();

        if(filter.isProfane(text)) {
            return callback('Profanity is not allowed!');
        }
        io.to(user.room).emit('message', generateMessage(user.username,text));
        callback();
    })

    socket.emit()

    socket.on('sendLocation', (info,callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('sendLocation', generateLocationMessage(user.username,`https://google.com/maps?q=${info.latitude},${info.longitude}`));
        callback();
        
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
        
    })
})

server.listen(port, err => {
    if(err) console.log(err);
    console.log('server running on port ' + port);
})