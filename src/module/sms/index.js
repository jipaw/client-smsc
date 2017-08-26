const redis = require('redis')
const redisClient = redis.createClient()
const kue = require('kue')
const queue = kue.createQueue()
const device = require('../../../config/modem')
const socket = require('../../lib/socket')
const uuid = require('uuid/v4')
const cron = require('cron')

const maxData = 3

redisClient.on('error', function (err) {
  console.log('Error ' + err)
})

exports.register = (server, options, next) => {

  device.forEach(function (item, index) {
    device[index].on('message', onStatusReport)
    device[index].on('report', onStatusReport)
    device[index].on('USSD', onUSSD)
  })

  function onUSSD (ussd) {
    console.log('onUSSD', ussd)
  }

  function onStatusReport (report) {
    console.log('onStatusReport', report)
  }

  device.forEach(function (item, index) {
    device[index].on('reportreceived', function (reportObj) {
      socket.emit('report_send', reportObj)
    })
    device[index].on('messagereceived', function (msg) {
      socket.emit('message_send', msg)
    })
  })

  socket.on('ussd_request', (data) => {
    console.log(data)
    let ussd = data.ussd
    let msidn = data.msidn
    for (var i = 0; i < device.length; i++) {
      device.push(device.splice(0, 1)[0])
      if (device[0].msidn.toString() === msidn.toString()) {
        break
      }
    }
    device[0].getUSSD(ussd, (err, data) => {
      if (err) console.log('[LOG ERROR]', err)
      // console.log('[LOG USSD]', data)
      let obj = {
        type: 'USSD',
        msidn: device[0].msidn.toString(),
        message: data
      }
      console.log(obj)
      socket.emit('ussd_data', obj)
    })
  })

  socket.on('sms_request', function (data) {
    // console.log(data)
    const key = 'trx:' + uuid()
    redisClient.hmset(key, {
      destination: data.destination,
      text: data.text,
      user: data.user,
      trxid: data.trxid,
      reference: data.reference,
      flag: data.flag,
      hlr: data.hlr,
      chip_sender: data.chip,
      smsc: data.smsc,
      counter: data.counter,
      delay: data.delay
    }, (err, reply) => {
      if (err) { console.error(err) }
      return 'OK'
    })
  })

  let job = new cron.CronJob({
    cronTime: '*/1 * * * * *',
    onTick: function () {
      const keys = '*trx:*'
      // const cursor = '0'
      // redisClient.scan(cursor, 'COUNT', 10, 'MATCH', keys, (e, r) => {
      redisClient.keys(keys, (e, r) => {
        if (e) { console.error(e) }
        // console.log(r)
        if (!r.length || r === null || r === undefined || r[0] === 'trx:undefined') { return }
        // if (!r[1].length || r[1] === null || r[1] === undefined || r[1] === 'trx:undefined') { return }
        console.log(r)
        for (let i = 0; i < r.length; i++) {
          if (i >= maxData) { break }
          const key = r[i]
          // console.log(key)
          redisClient.hgetall(key, (err, reply) => {
            if (err) console.log('[LOG ERROR] Error query redis', e)
            redisClient.del(key)
            const datas = reply
            function create () {
              let job = queue.create('send_message', {
                name: 'send sms message',
                destination: datas.destination,
                text: datas.text,
                user: datas.user,
                trxid: datas.trxid,
                reference: datas.reference,
                hlr: datas.hlr,
                flag: datas.flag,
                delay: datas.delay,
                counter: datas.counter,
                smsc: datas.smsc,
                chip_sender: datas.chip_sender
              })

              job.on('complete', function () {
                var log = 'Job ' + job.id + ' by ' + job.data.smsc + ' - ' + job.data.chip_sender + ' send sms to ' + job.data.destination + ' is done'
                console.log(log)
              }).on('failed', function () {
                var log = 'Job ' + job.id + ' by ' + job.data.smsc + ' - ' + job.data.chip_sender + ' send sms to ' + job.data.destination + ' is failed'
                console.log(log)
              })
              job.removeOnComplete(true).save()
            }
            create()

            queue.process('send_message', 2, function (job, done) {
              setTimeout(() => {
                function next () {
                  var data = job.data
                  for (var i = 0; i < device.length; i++) {
                    device.push(device.splice(0, 1)[0])
                    if (device[0].msidn.toString() === data.chip_sender.toString()) {
                      break
                    }
                  }
                  device[0].sendSMS({
                    receiver: data.destination,
                    text: data.text,
                    request_status: true
                  }, function (err, ref) {
                    if (err || ref === undefined) {
                      if (data['flag'] === 'New') { data['flag'] = 'Resend' }
                      if (data['flag'] === 'Resend') { data['flag'] = 'Resend' }
                      data['counter'] = parseInt(data['counter']) + 1
                      socket.emit('send_data', data)
                      // console.log(data);
                      return done(new Error('Failed to send sms'))
                    }
                    if (ref) {
                      data['reference'] = ref[0]
                      if (data['flag'] === 'New') { data['flag'] = 'Sent' }
                      if (data['flag'] === 'Resend') { data['flag'] = 'ResendOk' }
                      data['counter'] = parseInt(data['counter']) + 1
                      // console.log(data);
                      socket.emit('send_data', data)
                      device[0].deleteAllSMS(function (err, results) {
                        if (err) {
                          console.log('Unable to delete message')
                        }
                      })
                      return done()
                    }
                  })
                }
                setTimeout(() => {
                  next()
                }, job.data.delay * 1000)
              }, job.data.delay * 100)
            })
          })
        }
      })
    },
    start: false,
    timeZone: 'Asia/Jakarta'})

  socket.on('connect', function (socket) {
    job.start()
  })

  next()
}

exports.register.attributes = {
  name: 'HTTP-SMS Route',
  version: '1.0.0'
}
