var trials = require('../index')
var http = require('http')
var concat = require('concat-stream')

trials.serverHost = 'http://localhost:3001'
trials.teamName = 'At Muss Fear'

// http
trials.add(function(url, callback) {
  var http = require('http')
  http.get(url, function(res) {
    res.pipe(concat(function(data) {
      callback(null, data.toString())
    }))
  })
})

// crypto
trials.add(function(key, callback) {
  var crypto = require('crypto')
  var hmac = crypto.createHmac('sha256', key)
  hmac.update(trials.teamName)
  callback(null, hmac.digest('base64'))
})


// gunzip
trials.add(function(url, outStream) {
  var http = require('http')
  var zlib = require('zlib')
  http.get(url, function(res) {
    res.pipe(zlib.createGunzip()).pipe(outStream)
  })
})


trials.start()
