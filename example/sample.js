var trials = require('../index')

trials.serverHost = 'http://localhost:3001'
trials.teamName = 'At Moss Fear'

trials.add(function() {
  console.log('first trial', arguments)
})

trials.start()