var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/transit";

var addVehicle = function (vehicleProfile) {
    console.log("-------vehicles.js--------");

    MongoClient.connect(url, function(error, db){
        if(error) throw error;

        db.collection("vehicles").insertOne(vehicleProfile, function (err, result) {
            if(err) throw err;
            console.log("Inserted-----"+result);
            db.close();
        });
    });
    return "add vehicles";
};

module.exports = {
    addVehicle : function (vehicleProfile) {
        addVehicle(vehicleProfile);
    }
};