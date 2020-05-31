const socketio = require('socket.io');
const token = require('./jswt')

let setServer = (server) => {
    let io = socketio.listen(server);
    let myIo = io.of('/')
    myIo.on('connection', (socket) => {
        console.log("on connection--emitting verify user");
        socket.emit("verifyUser", "");
        
    })
}


module.exports = {
    setServer: setServer
}