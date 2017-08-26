const io = require('socket.io-client')
const socket = io.connect('http://5.189.176.218:2124', {
  reconnection: true,
  forceNew: true
})

socket.on('connect', function (socket) {
  console.log('Socket client connected to server')
})

module.exports = socket
