var vehicle = require("../models/vehicles");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/transit";

var addUser = function (user) {

    return MongoClient.connect(url).then(function (db, error) {
        if (error) throw error;
        var insertUserObject = {
            "name": user.name,
            "email": user.email,
            "contact": user.phone,
            "department": user.department
        };

        //upsert for inserting if no true record exist
        return db.collection("users").updateOne({email : user.email},insertUserObject,{upsert: true}, function (error, numAffected) {
            db.close();
            if(error) throw error;
            return numAffected;
        });
    });
};

var getUserProfile = function (userEmail) {

    //promises to be able to return the result
    return MongoClient.connect(url).then(function (db, error) {

        if (error) throw error;
        return db.collection("users").find({email: userEmail}).toArray().then(function (profile) {
            db.close();
            return profile;
        });

    });
};

var getUserVehicles = function (userEmail) {

    return MongoClient.connect(url).then(function (db, error) {
        if (error) throw error;

        var sortResults = {departure_date: -1}; //-1 for sorting in descending order, recent date first

        var userVehiclesList = db.collection("vehicles").find({owner: userEmail}).sort(sortResults).limit(200).toArray();
        db.close();
        return userVehiclesList;
    });

};

var getUserBookings = function (userEmail) {

    return MongoClient.connect(url).then(function (db, error) {
        if (error) throw error;
        var sortResults = {departure_date: -1};
        var vehiclesList = db.collection("vehicles").find({passengers: {$elemMatch: {email: userEmail}}}).sort(sortResults).limit(200).toArray();
        db.close();
        return vehiclesList;
    });
};

module.exports = {
    addUser: function (user) {
        return addUser(user);
    },
    addUserVehicle: function (vehicleProfile) {
        return vehicle.addVehicle(vehicleProfile);
    },
    getUserProfile: function (userEmail) {
        return getUserProfile(userEmail);
    },
    getUserVehicles: function (userEmail) {
        return getUserVehicles(userEmail);
    },
    getUserBookings: function (userEmail) {
        return getUserBookings(userEmail);
    }
};