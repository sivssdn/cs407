var MongoClient = require('mongodb').MongoClient;
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
            departure_date : journeyDetails.date,
            source: journeyDetails.source,
            destination: journeyDetails.destination
        };
console.log(query);
        var vehicleList = db.collection("vehicles").find(query).toArray();
        db.close();
        return vehicleList;
    });
};

module.exports = {
    addVehicle: function (vehicleProfile) {
        addVehicle(vehicleProfile);
    },
    getVehicles : function (journeyDetails) {
        return getVehicles(journeyDetails);
    }
};