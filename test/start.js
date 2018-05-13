/**
 * To start the program:
    - start mongodb server
    - on command line type node start.js vehicleID
 * */

const childProcess = require('child_process');
var vehicleID = process.argv[2];

for (var i = 0; i < 3; i++) {
    /*
     using fork to spawn a child process becauseit returns an object with a built-in communication channel
     in addition to having all the methods in a normal ChildProcess instance.
    * */

    var workerProcess = childProcess.fork("checkSeatsBooking.js", vehicleID);

    workerProcess.on('close', function (code) {
        console.log('child process exited with code ' + code);
    });
}