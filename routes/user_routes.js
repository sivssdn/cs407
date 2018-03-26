var express = require('express');
var router = express.Router();
var users = require("../models/users");
var bodyParser = require('body-parser');
var vehicles = require("../models/vehicles");

//Application routes
router.get('/', function (req, res, next) {
    if (sessionPresent(req, res)) {
        var userMail = req.session.userMail;


        users.getUserProfile(userMail).then(function (profile) {
            /*    var userMail = req.session.userMail;
                console.log(userMail);
            */

            if (profile.length > 0) {
                //if user profile exists
                res.render('available_seats_form');
            } else {
                //profile does not exist
                res.render('my_profile', {userProfile: profile});
            }
        }, function (err) {
            console.error('The promise was rejected', err, err.stack);
        });

    } else {
        res.redirect('/authentication/login');
    }
});
/*router.get('/:id', function (req, res, next) {
    console.log("-------"+req.params.id);
});*/

router.post("/add", function (req, res, next) {
    if (sessionPresent(req, res)) {
        //console.log(req.body);
        //add user
        var user = {
            name: req.body.name,
            email: req.session.userMail,
            phone: req.body.phone,
            department: req.body.department
        };
        users.addUser(user).then(function () {
            res.redirect('/user');
        });

    } else {
        //not logged in
        res.redirect('/authentication/login');
    }
});

/*/user/vehicles  - user vehicles*/
router.get('/vehicles', function (req, res, next) {
    if (sessionPresent(req, res)) {
        var userMail = req.session.userMail;
        users.getUserVehicles(userMail).then(function (vehicleList) {

            //console.log(vehicleList[0].passengers);
            res.render('my_vehicles', {vehicles: vehicleList});
        }, function (error) {
            console.log("Promise was rejected in /vehicles", error, error.stack);
        });

    } else {
        //not logged in
        res.redirect('/authentication/login');
    }
});

router.get('/vehicles/add', function (req, res, next) {
    if (sessionPresent(req, res)) {
        res.render('add_vehicles');
    } else {
        //not logged in
        res.redirect('/authentication/login');
    }
});

router.post('/vehicles/add', function (req, res, next) {
    /*/user/vehicles/add*/
    if (sessionPresent(req, res)) {

        var departure_time = new Date("2000-11-11T" + req.body.departure_time + "Z"); //for comparison purposes, date is fixed
        var departure_date = formatDate(req.body.departure_date);

        var vehicleProfile = {
            "departure_date": new Date(departure_date),
            "departure_time": departure_time,
            "source": req.body.departure_place,
            "destination": req.body.arrival_place,
            "vehicle_identification": req.body.vehicle_name,
            "total_seats": parseInt(req.body.vehicle_seats),
            /*"price": req.body.seat_price,*/
            "owner": req.session.userMail,
            "passengers": []
        };

        users.addUserVehicle(vehicleProfile).then(function (error) {
            if (error) throw error;
            var userMail = req.session.userMail;

            return users.getUserVehicles(userMail);
        }).then(function (vehicleList) {
            res.render('my_vehicles', {newVehicleProfile: vehicleProfile, vehicles: vehicleList});
        });

    } else {
        //not logged in
        res.redirect('/authentication/login');
    }
});

router.post('/vehicles/remove', function (req, res, next) {
    if (sessionPresent(req, res)) {
        vehicles.removeVehicle(req.body.vehicle_id).then(function (err) {
            if (err) throw err;

            //print user vehicles list

            var userMail = req.session.userMail;
            users.getUserVehicles(userMail).then(function (vehicleList) {

                //console.log(vehicleList[0].passengers);
                res.render('my_vehicles', {vehicles: vehicleList});
            }, function (error) {
                console.log("Promise was rejected in /vehicles", error, error.stack);
            });
            //--user vehicles list over

        });
    }else {
        //not logged in
        res.redirect('/authentication/login');
    }
});

router.get('/bookings', function (req, res, next) { //user/bookings
    if (sessionPresent(req, res)) {
        var userMail = req.session.userMail;
        users.getUserBookings(userMail).then(function (vehicleList) {
            res.render('my_bookings', {vehicles: vehicleList, userMail: userMail});
        }, function (error) {
            console.log("Promise was rejected in /bookings", error, error.stack);
        });

    } else {
        //not logged in
        res.redirect('/authentication/login');
    }
});

router.post('/bookings/add', function (req, res, next) {
    if (sessionPresent(req, res)) {
        var userMail = req.session.userMail;
        vehicles.bookSeat(req.body.vehicle_id, req.session.userMail).then(function (err) {
            if (err) throw err;
            return users.getUserBookings(userMail);
        }).then(function (vehicleList) {
            res.render('my_bookings', {vehicles: vehicleList, userMail: userMail, seatStatus: "Added"});
        }, function (error) {
            console.log("Promise was rejected in /bookings", error, error.stack);
        });

    } else {
        //not logged in
        res.redirect("/authentication/login");
    }
});
router.get('/bookings/add', function (req, res, next) {
    if (sessionPresent(req, res)) {
        res.redirect("/user/bookings");
    } else {
        //not logged in
        res.redirect("/authentication/login");
    }
});

router.post('/bookings/cancel', function (req, res, next) {
    if (sessionPresent(req, res)) {
        var userMail = req.session.userMail;
        vehicles.cancelSeat(req.body.vehicle_id, req.body.passenger_id).then(function (err) {
            if (err) throw err;
            return users.getUserBookings(userMail);
        }).then(function (vehicleList) {
            res.render('my_bookings', {vehicles: vehicleList, userMail: userMail, seatStatus: "Cancelled"});
        }, function (error) {
            console.log("Promise was rejected in /bookings", error, error.stack);
        });

    } else {
        //not logged in
        res.redirect("/authentication/login");
    }
});
router.get('/bookings/cancel', function (req, res, next) {
    if (sessionPresent(req, res)) {
        res.redirect("/user/bookings");
    } else {
        //not logged in
        res.redirect("/authentication/login");
    }
});

var sessionPresent = function (req, res, next) {
    if (req.session === undefined || !req.session.userMail) {
        return 0;
        //res.redirect('/authentication/login');
    } else {
        return 1;
    }
};

var formatDate = function (date) {
    //to format date to validate and for comparison

    //assuming input format dd-mm-yyyy and converted to yyyy-mm-dd
    /*var dateObj = new Date(date);
    var day = parseInt(dateObj.getDate());
    var month = parseInt(dateObj.getMonth())+1;*/
    /*if(month < 10)
        month = "0"+month;
    if(day < 10)
        day = "0"+day;*/
    var formattedDate = date.split("-");
    formattedDate = formattedDate[2] + "-" + formattedDate[1] + "-" + formattedDate[0] + "T00:00Z";
    //return dateObj.getFullYear()+"-"+month+"-"+day+"T00:00Z";
    return formattedDate;
};

/*
//script to upload data for vehicles from back-end
router.get('/upload', function (req, res, next) {
//----------------------

    //var dates = ["27-02-2018","28-02-2018","01-03-2018","05-03-2018","06-03-2018","07-03-2018","08-03-2018"];
    //var dates = ["02-03-2018","09-03-2018"];
    var dates = ["03-03-2018","04-03-2018","10-03-2018","11-03-2018"];

    for(var i=0;i<dates.length;i++) {


        var departure_date = formatDate(dates[i]);

        //mon to thursday
        //var timings = ["06:30", "06:45", "07:00", "07:15", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "11:00", "12:00", "14:00", "16:00", "16:30", "17:00", "17:20", "17:40", "18:00", "18:30", "19:00", "19:30", "20:00", "21:00", "22:00"];
        //friday
        //var timings = ["06:30", "06:45", "07:00", "07:15", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "16:30", "17:00", "17:20", "17:40", "18:00", "18:30", "19:00", "19:30", "20:00", "21:00", "22:00"];
        //saturday, sunday
        var timings = ["07:00", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "12:00", "13:00", "14:00", "14:30", "15:00", "15:30", "16:00", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "21:00", "22:00"];
        for (var loop = 0; loop < timings.length; loop++) {

            var departure_time = new Date("2000-11-11T" + timings[loop] + "Z"); //for comparison purposes, date is fixed
            var vehicleProfile = {
                "departure_date": new Date(departure_date),
                "departure_time": departure_time,
                "source": "Campus",
                "destination": "Jahangirpuri",
                "vehicle_identification": "Shuttle",
                "total_seats": 12,
                "price": 0,
                "owner": "Ashoka",
                "passengers": []
            };

            users.addUserVehicle(vehicleProfile).then(function (error) {
                if (error) throw error;
                //var userMail = req.session.userMail;

                return "done";
            }).then(function (value) {
                console.log(value)
            });
        }
    }
});
router.get('/upload1', function (req, res, next) {
//----------------------

    //var dates = ["27-02-2018","28-02-2018","01-03-2018","05-03-2018","06-03-2018","07-03-2018","08-03-2018"];
    //var dates = ["02-03-2018","09-03-2018"];
    var dates = ["03-03-2018","04-03-2018","10-03-2018","11-03-2018"];

    for(var i=0;i<dates.length;i++) {

        var departure_date = formatDate(dates[i]);

        //mon to thursday
        //var timings = ["07:30", "08:00", "08:20", "08:40", "09:00", "09:20", "09:40", "10:00", "10:30", "11:00", "12:00", "14:00", "16:00", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "23:00"];
        //friday
        //var timings = ["07:30", "08:00", "08:20", "08:40", "09:00", "09:20", "09:40", "10:00", "10:30", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "23:00"];
        //saturday, sunday
        var timings = ["08:00", "09:00", "09:30", "10:00", "10:30", "11:00", "12:00", "13:00", "14:00", "15:00", "15:30", "16:00", "17:00", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:45", "23:00"];
        for (var loop = 0; loop < timings.length; loop++) {

            var departure_time = new Date("2000-11-11T" + timings[loop] + "Z"); //for comparison purposes, date is fixed
            var vehicleProfile = {
                "departure_date": new Date(departure_date),
                "departure_time": departure_time,
                "source": "Jahangirpuri",
                "destination": "Campus",
                "vehicle_identification": "Shuttle",
                "total_seats": 12,
                "price": 0,
                "owner": "Ashoka",
                "passengers": []
            };

            users.addUserVehicle(vehicleProfile).then(function (error) {
                if (error) throw error;
                //var userMail = req.session.userMail;

                return "done";
            }).then(function (value) {
                console.log(value)
            });
        }
    }
});
router.get('/upload2', function (req, res, next) {
//----------------------campus parker
    //var dates = ["27-02-2018","28-02-2018","01-03-2018","05-03-2018","06-03-2018","07-03-2018","08-03-2018","02-03-2018","09-03-2018"];
    //var dates = ["03-03-2018","04-03-2018","10-03-2018","11-03-2018"];

    for(var i=0;i<dates.length;i++) {

        var departure_date = formatDate(dates[i]);

        //mon to friday
        //var timings = ["07:45", "08:15", "08:45", "09:15", "10:00", "10:40", "11:45", "13:45", "15:45", "17:45", "18:30", "19:30", "23:00", "00:00"];
        //saturday
        var timings = ["07:45", "08:45", "09:45", "11:45", "13:45", "15:45", "17:45", "19:45", "23:00", "00:00"];

        for (var loop = 0; loop < timings.length; loop++) {

            var departure_time = new Date("2000-11-11T" + timings[loop] + "Z"); //for comparison purposes, date is fixed
            var vehicleProfile = {
                "departure_date": new Date(departure_date),
                "departure_time": departure_time,
                "source": "Campus",
                "destination": "Parker",
                "vehicle_identification": "Shuttle",
                "total_seats": 12,
                "price": 0,
                "owner": "Ashoka",
                "passengers": []
            };

            users.addUserVehicle(vehicleProfile).then(function (error) {
                if (error) throw error;
                //var userMail = req.session.userMail;

                return "done";
            }).then(function (value) {
                console.log(value)
            });
        }
    }
});
router.get('/upload3', function (req, res, next) {
//---------------------- parker campus
    //var dates = ["27-02-2018","28-02-2018","01-03-2018","05-03-2018","06-03-2018","07-03-2018","08-03-2018","02-03-2018","09-03-2018"];
    //var dates = ["03-03-2018","04-03-2018","10-03-2018","11-03-2018"];

    for(var i=0;i<dates.length;i++) {

        var departure_date = formatDate(dates[i]);

        //mon to friday
        //var timings = ["08:00", "08:30", "09:00", "09:40", "10:20", "11:00", "12:00", "14:00", "16:00", "18:00", "19:00", "20:00", "23:10", "00:10"];
        //saturday
        var timings = ["08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "23:10", "00:10"];

        for (var loop = 0; loop < timings.length; loop++) {

            var departure_time = new Date("2000-11-11T" + timings[loop] + "Z"); //for comparison purposes, date is fixed
            var vehicleProfile = {
                "departure_date": new Date(departure_date),
                "departure_time": departure_time,
                "source": "Parker",
                "destination": "Campus",
                "vehicle_identification": "Shuttle",
                "total_seats": 12,
                "price": 0,
                "owner": "Ashoka",
                "passengers": []
            };

            users.addUserVehicle(vehicleProfile).then(function (error) {
                if (error) throw error;
                //var userMail = req.session.userMail;

                return "done";
            }).then(function (value) {
                console.log(value)
            });
        }
    }
});*/
module.exports = router;
