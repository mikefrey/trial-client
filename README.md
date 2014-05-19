node-trial
==========

This is the client for the [node-trial-server](https://github.com/mikefrey/node-trial-server).

You must be running a copy of the server locally, or have access to a running copy on your local network.

Usage
-----

Install via npm:

```
npm install trial-client
```

Create a new file that looks something like this:

```javascript
var trials = require('trial-client')

// set the host name of the trials server:
trials.serverHost = 'http://localhost:3001'

// set your team name:
trials.teamName = '' // Your Team Name

// Add each trial in the order that you solve
// them, from top to bottom, using `trials.add(fn)`

// You can write them all in this file:
// trials.add(function(options, callback) {
//   console.log('first trial', options)
//   callback()
// })

// Or in multiple files and then require them:
// trials.add(require('./trial1'))


// call `trials.start()` at the end.
trials.start()
```

Then execute the file with node:

```
node myFile.js
```