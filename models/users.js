var vehicle = require("../models/vehicles");

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/transit";

var addUser = function (user) {

    MongoClient.connect(url, function (error, db) {
        console.log("----add user / users.js-----");

        if (error) throw error;
        var insertUserObject = {
            "name": user.name,
            "email": user.email,
            "contact": user.phone,
            "department": user.department
        };
        db.collection("users").insertOne(insertUserObject, function (error, result) {
            if (error) throw error;
            console.log("---user added---" + result);
            db.close();
        });
    });

};

var getUserProfile = function (userEmail) {

    //promises to be able to return the result
    return MongoClient.connect(url).then(function (db, error) {
        console.log("----get user / users.js-----");
        if (error) throw error;
        /*return db.collection("users").find({email: userEmail}).toArray();*/
        var profile = db.collection("users").find({email: userEmail}).toArray();
        db.close();
        return profile;
    });
};

var getUserVehicles = function (userEmail) {

    return MongoClient.connect(url).then(function (db, error) {
        if(error) throw error;
        var userVehiclesList= db.collection("vehicles").find({owner: userEmail}).toArray();
        db.close();
        return userVehiclesList;
    });

};

var getUserBookings = function (userEmail) {

    return MongoClient.connect(url).then(function(db , error){
        if(error) throw error;
        var vehiclesList = db.collection("vehicles").find({passengers : {$elemMatch: {email: userEmail}}}).toArray();
        db.close();
        return vehiclesList;
    });
};

var bookUserSeat = function (vehicleID, passengerEmail) {
//---------------------------------------------------------------------------
    MongoClient.connect(url, function (error, db) {
        if (error) throw error;
        var passengerDetails = {
            $push: {
                passengers: [
                    {
                        email: passengerEmail
                    }
                ]
            }
        };
        db.collection("vehicles").update({_id : vehicleID}, passengerDetails, function (error, result) {
            if(error) throw error;
            console.log(result);
        });
    });
};

module.exports = {
    addUser: function (user) {
        addUser(user);
    },
    addUserVehicle: function (vehicleProfile) {
        vehicle.addVehicle(vehicleProfile);
    },
    getUserProfile: function (userEmail) {
        return getUserProfile(userEmail);
    },
    getUserVehicles: function (userEmail) {
        return getUserVehicles(userEmail);
    },
    getUserBookings: function (userEmail) {
        return getUserBookings(userEmail);
    },
    bookUserSeat : function (vehicleID, passengerEmail) {
        bookUserSeat(vehicleID, passengerEmail);
    }
};