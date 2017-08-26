const _ = require('lodash')
const cron = require('cron')
const Modem = require('../src/lib/gsm_modem')
const socket = require('../src/lib/socket')
const globalVar = require('./globat_var')

/* LIST DEVICE */
/*
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.1:1.0-port0  ttyUSB0
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.1:1.1-port0  ttyUSB1
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.1:1.2-port0  ttyUSB2
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.1:1.3-port0  ttyUSB3
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.2:1.0-port0  ttyUSB4
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.2:1.1-port0  ttyUSB5
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.2:1.2-port0  ttyUSB6
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.2:1.3-port0  ttyUSB7
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.3:1.0-port0  ttyUSB8
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.3:1.1-port0  ttyUSB9
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.3:1.2-port0  ttyUSB10
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.3:1.3-port0  ttyUSB11
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.4:1.0-port0  ttyUSB12
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.4:1.1-port0  ttyUSB13
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.4:1.2-port0  ttyUSB14
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.4:1.3-port0  ttyUSB15
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.1:1.0-port0  ttyUSB16
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.1:1.1-port0  ttyUSB17
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.1:1.2-port0  ttyUSB18
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.1:1.3-port0  ttyUSB19
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.2:1.0-port0  ttyUSB20
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.2:1.1-port0  ttyUSB21
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.2:1.2-port0  ttyUSB22
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.2:1.3-port0  ttyUSB23
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.3:1.0-port0  ttyUSB24
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.3:1.1-port0  ttyUSB25
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.3:1.2-port0  ttyUSB26
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.3:1.3-port0  ttyUSB27
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.4:1.0-port0  ttyUSB28
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.4:1.1-port0  ttyUSB29
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.4:1.2-port0  ttyUSB30
   /dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.4:1.3-port0  ttyUSB31
   */
let smsc0 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.1:1.0-port0'], alias: 'SMSC-01', msidn: '62895611536817', onDisconnect: onDisconnect, debug: false })
let smsc1 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.1:1.1-port0'], alias: 'SMSC-02', msidn: '62895611536284', onDisconnect: onDisconnect, debug: false })
// let smsc2 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.1:1.2-port0'], alias: 'SMSC-03', msidn: 'XXX', onDisconnect: onDisconnect, debug: false })
let smsc3 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.1:1.3-port0'], alias: 'SMSC-04', msidn: '62895611536280', onDisconnect: onDisconnect, debug: false })
let smsc4 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.2:1.0-port0'], alias: 'SMSC-05', msidn: '62895611536803', onDisconnect: onDisconnect, debug: false })
let smsc5 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.2:1.1-port0'], alias: 'SMSC-06', msidn: '62895611536784', onDisconnect: onDisconnect, debug: false })
let smsc6 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.2:1.2-port0'], alias: 'SMSC-07', msidn: '62895611536818', onDisconnect: onDisconnect, debug: false })
let smsc7 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.2:1.3-port0'], alias: 'SMSC-08', msidn: '6281285671972', onDisconnect: onDisconnect, debug: false })
let smsc8 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.3:1.0-port0'], alias: 'SMSC-09', msidn: '6281285672135', onDisconnect: onDisconnect, debug: false })
let smsc9 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.3:1.1-port0'], alias: 'SMSC-10', msidn: '6281285672381', onDisconnect: onDisconnect, debug: false })
let smsc10 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.3:1.2-port0'], alias: 'SMSC-11', msidn: '6281285672098', onDisconnect: onDisconnect, debug: false })
let smsc11 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.3:1.3-port0'], alias: 'SMSC-12', msidn: '6281285682186', onDisconnect: onDisconnect, debug: false })
let smsc12 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.4:1.0-port0'], alias: 'SMSC-13', msidn: '6281381988072', onDisconnect: onDisconnect, debug: false })
let smsc13 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.4:1.1-port0'], alias: 'SMSC-14', msidn: '6281381988071', onDisconnect: onDisconnect, debug: false })
let smsc14 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.4:1.2-port0'], alias: 'SMSC-15', msidn: '6281381988068', onDisconnect: onDisconnect, debug: false })
let smsc15 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.3.4:1.3-port0'], alias: 'SMSC-16', msidn: '6281381988069', onDisconnect: onDisconnect, debug: false })
// let smsc16 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.1:1.0-port0'], alias: 'SMSC-17', msidn: '6281383729224', onDisconnect: onDisconnect, debug: false })
// let smsc17 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.1:1.1-port0'], alias: 'SMSC-18', msidn: '6281285672078', onDisconnect: onDisconnect, debug: false })
// let smsc18 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.1:1.2-port0'], alias: 'SMSC-19', msidn: '6281398085977', onDisconnect: onDisconnect, debug: false })
// let smsc19 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.1:1.3-port0'], alias: 'SMSC-20', msidn: '6281289945263', onDisconnect: onDisconnect, debug: false })
// let smsc20 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.2:1.0-port0'], alias: 'SMSC-21', msidn: '6281398085958', onDisconnect: onDisconnect, debug: false })
// let smsc21 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.2:1.1-port0'], alias: 'SMSC-22', msidn: '6281398085989', onDisconnect: onDisconnect, debug: false })
// let smsc22 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.2:1.2-port0'], alias: 'SMSC-23', msidn: '6281398085991', onDisconnect: onDisconnect, debug: false })
// let smsc23 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.2:1.3-port0'], alias: 'SMSC-24', msidn: '6281285672408', onDisconnect: onDisconnect, debug: false })
// let smsc24 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.3:1.0-port0'], alias: 'SMSC-25', msidn: '6281398085975', onDisconnect: onDisconnect, debug: false })
// let smsc25 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.3:1.1-port0'], alias: 'SMSC-26', msidn: '6281398085979', onDisconnect: onDisconnect, debug: false })
// let smsc26 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.3:1.2-port0'], alias: 'SMSC-27', msidn: 'xxx', onDisconnect: onDisconnect, debug: false })
// let smsc27 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.3:1.3-port0'], alias: 'SMSC-28', msidn: '6281383729286', onDisconnect: onDisconnect, debug: false })
// let smsc28 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.4:1.0-port0'], alias: 'SMSC-29', msidn: '6281383729215', onDisconnect: onDisconnect, debug: false })
// let smsc29 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.4:1.1-port0'], alias: 'SMSC-30', msidn: '6281383729218', onDisconnect: onDisconnect, debug: false })
// let smsc30 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.4:1.2-port0'], alias: 'SMSC-31', msidn: '6281383729216', onDisconnect: onDisconnect, debug: false })
// let smsc31 = new Modem({ ports: ['/dev/serial/by-path/platform-3f980000.usb-usb-0:1.5.4:1.3-port0'], alias: 'SMSC-32', msidn: '6281289945243', onDisconnect: onDisconnect, debug: false })

let device = _.compact([smsc0, smsc1, smsc3, smsc4, smsc5, smsc6, smsc7, smsc8, smsc9, smsc10, smsc11, smsc12, smsc13, smsc14, smsc15])
// let device = _.compact([smsc0, smsc1, smsc3, smsc4, smsc5, smsc6, smsc7, smsc8, smsc9, smsc10, smsc11, smsc12, smsc13, smsc14, smsc15, smsc16, smsc18, smsc19, smsc20, smsc21, smsc22, smsc23, smsc24, smsc25, smsc27, smsc28, smsc29, smsc30, smsc31])
let activeDevice = []
let offlineDevice = []

function startModem () {
  _.forEach(device, (item, index) => {
    let obj = {
      hostname: globalVar.device.hostname,
      id: device[index].alias,
      port: device[index].ports[0],
      msidn: device[index].msidn
    }
    device[index].connect((err) => {
      if (err) {
        console.log('SMSC-' + index + ' not connected')
        offlineDevice.push(obj)
      } else {
        console.log('SMSC-' + index + ' connected')
        activeDevice.push(obj)
      }
    })
  })
}

function stopModem () {
  _.forEach(device, (item, index) => {
    device[index].stopForever()
  })
}

function startSmsc () {
  startModem()
  socket.emit('active_device', activeDevice)
  socket.emit('offline_device', offlineDevice)
}

function onDisconnect (Modem) {
  console.log('onDisconnect')
  if (globalVar.autoReconnect) {

  }
  console.log(this)
}

socket.on('restart_request', (data) => {
  stopModem()
  startSmsc()
})

let restartDevice = new cron.CronJob({
  cronTime: '0 * * * *',
  onTick: function () {
    console.log('start restart smsc at', Date())
    stopModem()
    startSmsc()
  },
  start: false,
  timeZone: 'Asia/Jakarta'})

startSmsc()
// restartDevice.start()
module.exports = device
