var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var ObjectID = mongo.ObjectID;
var url = "mongodb://localhost:27017/transit";

var addVehicle = function (vehicleProfile) {
    console.log("-------vehicles.js--------");

    MongoClient.connect(url, function (error, db) {
        if (error) throw error;

        db.collection("vehicles").insertOne(vehicleProfile, function (err, result) {
            if (err) throw err;
            console.log("Inserted-----" + result);
            db.close();
        });
    });
    return "vehicle added";
};

var getVehicles = function (journeyDetails) {
    console.log("---get vehicles---");
    return MongoClient.connect(url).then(function (db, error) {
        if (error) throw error;
        var query = {
            departure_date: journeyDetails.date,
            source: journeyDetails.source,
            destination: journeyDetails.destination,
            $and: [
                {departure_time: {$gte: journeyDetails.time1}},
                {departure_time: {$lte: journeyDetails.time2}}
            ]
        };

        var vehicleList = db.collection("vehicles").find(query).toArray();
        db.close();
        return vehicleList;
    });
};

var bookSeat = function (vehicleId, userMail) {

    return MongoClient.connect(url).then(function (db, error) {
        if (error) throw error;
        console.log(new ObjectID(vehicleId));
        db.collection("vehicles").findOne({_id: new ObjectID(vehicleId)}, {
            total_seats: 1,
            passengers: 1
        }).then(function (vehicleDetails) {
            //we have vehicle data now as per vehicle id
            //for getting seats left :
            return parseInt(vehicleDetails.total_seats) - parseInt(vehicleDetails.passengers.length);

        }).then(function (seatsLeft) {
            console.log(seatsLeft);
            var upadteQuery = {};
            if (seatsLeft > 0) {
                upadteQuery = {
                    $push: {
                        passengers:
                            {
                                _id: new ObjectID(),
                                email: userMail,
                                status: "Confirmed",
                                date_booked: new Date()
                            }

                    }
                }
            } else {
                upadteQuery = {
                    $push: {
                        passengers:
                            {
                                _id: new ObjectID(),
                                email: userMail,
                                status: "Waitlist",
                                date_booked: new Date()
                            }

                    }
                }
            }
            /*
                var conditions = { _id: 123 };
                var update = { $set: { fooCount: 118 }};
                var options = { upsert: true }; //for appending to the existing records
                model.update(conditions, update, options, callback);
            * */
            var insertStatus = db.collection("vehicles").update({_id: new ObjectID(vehicleId)}, upadteQuery, {upsert: true}, function (error, numAffected) {
                if (error) throw error;
                db.close();
                return numAffected;
            });
            return insertStatus;
        });

    });
};

var cancelSeat = function (vehicleID, passengerID) {

    return MongoClient.connect(url).then(function (db) {
        //validation the status of the passenger (confirmed or waitlist)
        db.collection("vehicles").findOne({_id: new ObjectID(vehicleID)}, {passengers: 1}).then(function (vehiclePassengers) {
            /*
              {   _id: 5a2546a4d4dfbb1bc0bbef0d,
                  passengers:
                   [ { _id: 5a2556ed0e30f920f0a67256,
                       email: 'paras.bhattrai@ashoka.edu.in',
                       status: 'Confirmed',
                       date_booked: 2017-12-04T14:08:45.177Z } ]
               }
            * */
            //console.log(vehiclePassengers.passengers);

            //we have the passengers details of the vehicle,now checking the status of the passenger
            for (var loop1 = 0; loop1 < vehiclePassengers.passengers.length; loop1++) {
                if (vehiclePassengers.passengers[loop1]._id == passengerID) {
                    return vehiclePassengers.passengers[loop1].status;
                }
            }

            return -1; //in case of error return -1
        }).then(function (passengerBookingStatus) {
            var updateQuery = {}, setQuery = {};

             if (passengerBookingStatus === "Confirmed" || passengerBookingStatus === "Waitlist") {
                updateQuery = {
                    _id: new ObjectID(vehicleID),
                    passengers : {
                        $elemMatch : {_id: new ObjectID(passengerID)}
                    }
                };
                setQuery = {
                    $set: {
                        "passengers.$.status": "Cancelled"
                    }
                };
                db.collection("vehicles").update(updateQuery, setQuery, function (error, numAffected) {
                    if(error) throw error;
                    return numAffected
                });
            }
        });
    });
};

module.exports = {
    addVehicle: function (vehicleProfile) {
        addVehicle(vehicleProfile);
    },
    getVehicles: function (journeyDetails) {
        return getVehicles(journeyDetails);
    },
    bookSeat: function (vehicle_id, userMail) {
        return bookSeat(vehicle_id, userMail);
    },
    cancelSeat: function (vehicleID, passengerID) {
        return cancelSeat(vehicleID, passengerID);
    }
};