const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()

// create a new web server
const server = http.createServer(app)

// create socket to work with the server so that the reason we need to call our server like that
const io = socketio(server) 

// static part
const url = path.join(__dirname, '../public')
app.use(express.static(url))

// admin user
const admin  = 'Admin'

const port = process.env.PORT || 3000

app.get('/hello', (req, res) => {
    res.send('Hello')
})

// Allow client to connect to the server
// socket here an object that contains informations about the new connection
let count = 0;
io.on('connection', (socket) => {
    console.log('new web socket connection')

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        // this method can be used only on this server not to a client
        socket.join(user.room)
        socket.emit('message', generateMessage(admin, 'Welcome!')) // emit to single client 

        // to(roomName) method here to say that it will only be available on the room
        socket.broadcast.to(user.room).emit('message', generateMessage(admin,`${user.username} has joined the room`)) // emit to all clients except the current socket

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    
    // callback function here is the callback set in the chat.js
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)

        if(!user) {
            return callback('User invalid')
        }

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id)
        if(!user) {
            return callback('User invalid')
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `${latitude},${longitude}`))
        callback()
    })

    // when some user disconnect, have to be this listener name to be recognized by the socket
    socket.on('disconnect', () => {
        // no need to broadcast here cause this user is already disconnected
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage(admin, `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('server is running')
})