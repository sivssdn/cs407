/**
 * To start the program, on command line type node start.js
 * */

const fs = require('fs');
const child_process = require('child_process');


for (var i = 0; i < 3; i++) {
    /*
     using fork to spawn a child process becauseit returns an object with a built-in communication channel
     in addition to having all the methods in a normal ChildProcess instance.
    * */

    var worker_process = child_process.fork("support.js", [i]);

    worker_process.on('close', function (code) {
        console.log('child process exited with code ' + code);
    });
}