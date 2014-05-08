
require('colors')
var concat = require('concat-stream')
var http = require('http')
var url = require('url')

var handlers = []
var host
var team


function validate(trial, opts, result) {

  var httpOpts = url.parse(host)
  httpOpts.headers = {
    'x-team': team,
    'x-trial': trial,
    'x-result': result,
    'x-options': JSON.stringify(opts)
  }

  http.get(httpOpts, function(res) {
    var status = res.statusCode
    if (status == 404) return console.error('Trial "%s" not found', trial.red)
    if (status == 401) return console.error('Incorrect result for "%s"', trial.red)
    if (status != 200) return console.error('Something crazy went wrong'.red)

    // first trial doesn't have a result, so don't show a message for it
    if (result) console.log('Success!'.green, '"%s" was the correct result for trial "%s"!', result.blue, trial.blue)

    // grab all the data out of the response
    res.pipe(concat(function(data) {
      var next = res.headers['x-trial']
      data = JSON.parse(data.toString())
      run(next, data.options, function(err, success) {
        // if the next trial wasn't successful
        // show the instructions again.
        if (!success) console.log(data.description)
      })
    }))

  }).on('error', function(e) {
    console.log("Got error: " + e.message)
  })

}

function run(trial, opts, fn, callback) {
  var fn = handlers.shift()
  if (!fn) return process.nextTick(callback)

  fn(opts, function(err, result) {
    if (err) return console.error(error)

    validate(trial, opts, result)
  })
}


module.exports = {

  get serverHost() { return host },
  set serverHost(val) { host = val },

  get teamName() { return team },
  set teamName(val) { team = val },

  add: function(fn) {
    handlers.push(fn)
  },

  start: function() {
    if (!host) throw new Error('serverHost must be set prior to calling start()')
    var parsed = url.parse(host)
    if (!parsed.hostname) throw new Error('serverHost must be a valid url.')
    if (!parsed.protocol) host = 'http://' + host

    validate('start', '')
  }

}