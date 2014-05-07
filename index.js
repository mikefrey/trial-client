
require('colors')
var concat = require('concat-stream')
var http = require('http')
var url = require('url')

var handlers = []
var host
var team


function run(trial, result) {

  var httpOpts = {
    hostname: host,
    headers: {
      'x-team': team,
      'x-trial': trial,
      'x-result': result
    }
  }

  http.get(host, function(res) {
    var status = res.statusCode
    if (status == 404) return console.error('Trial "%s" not found', trial.red)
    if (status == 401) return console.error('Incorrect result for "%s"', trial.red)
    if (status != 200) return console.error('Something crazy went wrong'.red)

    // first trial doesn't have a result, so don't show a message for it
    if (result) console.log('Success!'.green, '"%s" was the correct result for trial "%s"!', result.blue, trial.blue)

    if (handlers.length) {
      var fn = handlers.shift()

      res.pipe(concat(function(data) {

      }))
      // TODO: buffer up the response payload.
      // display it to the user as a message.
    }


  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });

}


module.exports = {

  get serverHost: function() { return host },
  set serverHost: function(val) { host = val },

  get teamName: function() { return team },
  set teamName: function(val) { team = val },

  add: function(fn) {
    handlers.push(fn)
  },

  start: function() {
    if (!host) throw new Error('serverHost must be set prior to calling start()')
    var parsed = url.parse(host)
    if (!parsed.hostname) throw new Error('serverHost must be a valid url.')
    if (!parsed.protocol) host = 'http://' + host

    run('start', '')
  }

}