/**
 * To start the program:
    - start mongodb server
    - on command line type node start.js
 * */

const childProcess = require('child_process');


for (var i = 0; i < 3; i++) {
    /*
     using fork to spawn a child process becauseit returns an object with a built-in communication channel
     in addition to having all the methods in a normal ChildProcess instance.
    * */

    var workerProcess = childProcess.fork("checkSeatsBooking.js", [i]);

    workerProcess.on('close', function (code) {
        console.log('child process exited with code ' + code);
    });
}