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
        return db.collection("users").find({email: userEmail}).toArray();
    }).then(function (items) {
        //console.log(items);
        return items;
    });
};

var getUserVehicles = function (userEmail) {

    MongoClient.connect(url, function (error, db) {
        console.log("-----get vehicles / users.js-----");
        if (error) throw error;
        db.collection("vehicles").find({owner: userEmail}).toArray(function (error, result) {
            if (error) throw error;
            console.log(result);
            db.close();
        });
    });

};

var getUserBookings = function (userEmail) {

    MongoClient.connect(url, function (error, db) {
        console.log("-----get booking / users.js-----");
        if (error) throw error;
        //for searching email in passenger array
        db.collection("vehicles").find({passengers: {$elemMatch: {email: userEmail}}}).toArray(function (error, result) {
            if (error) throw error;
            console.log(result + "=============");

        });
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
        getUserVehicles(userEmail);
    },
    getUserBookings: function (userEmail) {
        getUserBookings(userEmail);
    },
    bookUserSeat : function (vehicleID, passengerEmail) {
        bookUserSeat(vehicleID, passengerEmail);
    }
};