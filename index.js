
require('colors')
var concat = require('concat-stream')
var http = require('http')
var url = require('url')

var handlers = []
var host
var team


function verify(trial, opts, result, callback) {

  var httpOpts = url.parse(host)
  httpOpts.headers = {
    'x-team': team,
    'x-trial': trial,
    'x-result': result,
    'x-options': JSON.stringify(opts)
  }

  http.get(httpOpts, function(res) {
    var status = res.statusCode
    if (status == 404) return console.error('\nTrial "%s" not found', trial.red)
    if (status == 401) {
      console.error('\nIncorrect result for "%s"', trial.red)
      return callback && callback()
    }
    if (status != 200) return console.error('\nSomething crazy went wrong'.red)

    // first trial doesn't have a result, so don't show a message for it
    if (result) console.log('\nSuccess!'.green + ' "%s" was the correct result for trial "%s"!', result.blue, trial.blue)

    // grab all the data out of the response
    res.pipe(concat(function(data) {
      var next = res.headers['x-trial']

      if (!next) {
        console.log('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'.rainbow)
        console.log(' Congratulations on completing all trials!')
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'.rainbow)
        return
      }

      data = JSON.parse(data.toString())
      run(next, data.options, function(err, success) {
        // if the next trial wasn't successful
        // show the instructions again.
        if (!success) {
          console.log('\nInstructions for "%s%s'.white, next.blue, '"'.white)
          console.log(data.description)
        }
      })
    }))

  }).on('error', function(e) {
    console.log("Got error: " + e.message)
  })

}

function run(trial, options, callback) {
  var fn = handlers.shift()
  if (!fn) return process.nextTick(callback)

  var opts = [].concat(options, function(err, result) {
    if (err) return callback(console.error(error))
    verify(trial, options, result, callback)
  })

  console.log('\nAttempting %s', trial)
  fn.apply(null, opts)
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

    verify('start', '')
  }

}