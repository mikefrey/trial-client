var trials = require('../index')

trials.serverHost = 'http://localhost:3001'
trials.teamName = 'At Muss Fear'

trials.add(function(options, callback) {
  console.log('first trial', options)
})

trials.start()