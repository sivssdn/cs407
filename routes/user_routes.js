var express = require('express');
var router = express.Router();
var users = require("../models/users");
var vehicles = require("../models/vehicles");

//Application routes
router.get('/', function (req, res, next) {
    /* /user */
    if (sessionPresent(req, res)) {
        var userMail = req.session.userMail;

        users.getUserProfile(userMail).then(function (profile) {
            /*    var userMail = req.session.userMail;
                console.log(userMail);
            */

            if (profile.length > 0) {
                //if user profile exists
                res.render('available_seats_form',{message: 'Saved Successfully'});
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

//for editing profile only
router.get('/edit', function (req, res, next) {

    if (sessionPresent(req, res)) {
        var userMail = req.session.userMail;

        users.getUserProfile(userMail).then(function (profile) {
                res.render('my_profile', {userProfile: profile});
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
            res.redirect('/user/vehicles');
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
    } else {
        return 1;
    }
};

var formatDate = function (date) {
    //to format date to validate and for comparison

    //assuming input format dd-mm-yyyy and converted to yyyy-mm-dd

    var formattedDate = date.split("-");
    formattedDate = formattedDate[2] + "-" + formattedDate[1] + "-" + formattedDate[0] + "T00:00Z";
    return formattedDate;
};

module.exports = router;
