const Glue = require('glue')
const Hoek = require('hoek')
const Path = require('path')

const manifest = require('./config/manifest')
const options = {
  relativeTo: Path.join(__dirname, '/src')
}

if (process.env.NODE_ENV !== 'production') {
  manifest.registrations.push({
    plugin: 'blipp'
  })
}

Glue.compose(manifest, options, (err, server) => {
  Hoek.assert(!err, err)

  server.start(err => {
    Hoek.assert(!err, err)
    server.connections.forEach((connection) => {
      console.log('Server started at: ' + connection.info.uri)
    })
  })
})
