const config = require('config');
const express = require('express')
const app = express()
var cors = require('cors')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

const mongoose = require('mongoose');
const users = require('./routes/users');

const auth = require('./routes/auth');

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

mongoose.connect('mongodb+srv://dbuser:dbuser@cluster0-qnimp.mongodb.net/webrtc', {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
}).then(() => console.log('Connected to MongoDB...')).catch(err => console.error('Could not connect to MongoDB...'));

app.use(cors())
app.use(express.json());
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:id', (req, res) => {
    res.render('room', { roomId: req.params.room })
    const roomId = req.params.room;
})
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId);
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})
app.use('/api/users', users);
app.use('/api/auth', auth);


const host = '0.0.0.0';
const port = process.env.PORT || 4000;
server.listen(port, host, function () {
    console.log("Server started......." + port);
});