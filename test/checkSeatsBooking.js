var vehicle = require("../models/vehicles");
console.log("Child Process " + process.argv[2] + " executed." );

const vehicleID = process.argv[2];

//making 100 bookings
for(let loop1 = 0;loop1 < 100;loop1++) {
    vehicle.bookSeat(vehicleID, "test@testing.com");
}
