require('dotenv').config()

module.exports = function () {
  const express = require('express')
  const { initRouter } = require('./router/index')
  const { PORT, CORS_SETTINGS } = require('../lib/constants')

  const app = express()
  const { sentry } = require('../lib/logger/index')
  const cors = require('cors')
  const { startPollers } = require('./pollers')
  const initDb = require('../lib/db')

  // The request handler must be the first middleware on the app
  app.use(sentry.Handlers.requestHandler())

  app.use(cors(CORS_SETTINGS))

  initRouter(app)

  const server = app.listen(PORT, async () => {
    await initDb()
    console.log(`Harvest API listening on port: ${PORT}`)
    startPollers()
  })
  app.use(sentry.Handlers.errorHandler())

  server.on('close', function () {
    // close all ongoing activities, but giving 10s to be able to show errors when running tests
    console.log('Harvest API received Close event. Closing down in 5s...')
    setTimeout(() => {
      process.exit(1)
    }, 5000)
  })

  return server
}
