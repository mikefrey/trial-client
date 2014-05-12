var trials = require('../index')
trials.serverHost = 'http://localhost:3001'
trials.teamName = 'At Muss Fear'

// http.get
trials.add(function(url, callback) {
  var http = require('http')
  var concat = require('concat-stream')
  http.get(url, function(res) {
    res.pipe(concat(function(data) {
      callback(null, data.toString())
    }))
  })
})

// multi-get
trials.add(function(urls, callback) {
  var http = require('http')
  var concat = require('concat-stream')

  var count = urls.length
  var results = []
  urls.forEach(function(url, idx) {
    http.get(url, function(res) {
      res.pipe(concat(function(data) {
        results[idx] = data.toString()
        count--
        if (!count) callback(null, results)
      }))
    })
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

// socket
trials.add(function(ip, port, outStream) {
  var net = require('net')
  var through = require('through')
  var upper = through(function(data) {
    this.emit('data', data.toString().toUpperCase())
  })
  var socket = net.connect(port, ip)
  socket.pipe(upper).pipe(outStream)
})

// http-server
trials.add(function(port, callback) {
  var http = require('http')
  var server = http.createServer(function(req, res) {
    req.pipe(res)
    res.on('finish', function() { server.close() })
  }).listen(port, callback)
})

// final
trials.add(function(passwordUrl, messageUrl, outStream) {
  var http = require('http')
  var zlib = require('zlib')
  var crypto = require('crypto')
  var through = require('through')
  var concat = require('concat-stream')

  http.get(passwordUrl, function(res) {
    res.pipe(concat(function(password) {
      http.get(messageUrl, function(res) {
        res.pipe(zlib.createGunzip())
           .pipe(crypto.createDecipher('aes256', password))
           .pipe(through(function(data) {
              this.emit('data', data.toString().replace(/[aeiou]/g, ''))
           }))
           .pipe(crypto.createCipher('aes256', password))
           .pipe(zlib.createGzip())
           .pipe(outStream)
      })
    }))
  })
})


trials.start()
