var express = require('express');
var router = express.Router();
var users = require("../models/users");
var bodyParser = require('body-parser');

//Application routes
router.get('/', function (req, res, next) {
    if (sessionPresent(req, res)) {
        var userMail = req.session.userMail;

        users.getUserProfile(userMail).then(function (profile) {
        /*    var userMail = req.session.userMail;
            console.log(userMail);
         */

            res.render('my_profile', {userProfile: profile});
        }, function (err) {
            console.error('The promise was rejected', err, err.stack);
        });

    } else {
        res.redirect('/authentication/login');
    }
});

router.post("/add", function (req, res, next) {
    if(sessionPresent(req, res)) {
        //console.log(req.body);
        //add user
        var user = {
            name: req.body.name,
            email: req.session.userMail,
            phone: req.body.phone,
            department: req.body.department
        };
        users.addUser(user);
        res.redirect('/user');
        //res.send("user added");

    }else{
        //not logged in
        res.redirect('/authentication/login');
    }
});
router.get('/vehicles', function (req, res, next) {
    if(sessionPresent(req, res)) {
        var userMail = req.session.userMail;
        users.getUserVehicles(userMail).then(function (vehicleList) {
            res.render('my_vehicles', {vehicles : vehicleList});
        }, function (error) {
            console.log("Promise was rejected in /vehicles", error, error.stack);
        });

    }else{
        //not logged in
        res.redirect('/authentication/login');
    }
});

router.get('/vehicles/add', function (req, res, next) {
    if(sessionPresent(req, res)) {
        res.render('add_vehicles');
    }else{
        //not logged in
        res.redirect('/authentication/login');
    }
});

router.post('/vehicles/add', function (req, res, next) {
    /*/user/vehicles/add*/
    if(sessionPresent(req, res)) {

        var vehicleProfile = {
            "departure_date": req.body.departure_date,
            "departure_time": req.body.departure_time,
            "source": req.body.departure_place,
            "destination": req.body.arrival_place,
            "vehicle_identification": req.body.vehicle_name,
            "total_seats": req.body.vehicle_seats,
            "price": req.body.seat_price,
            "owner": req.session.userMail,
            "passengers": []
        };
        users.addUserVehicle(vehicleProfile);
        res.render('add_vehicles');
    }else{
        //not logged in
        res.redirect('/authentication/login');
    }
});

router.get('/bookings', function (req, res, next) { //user/bookings
    checkSession(req, res);
    //next is callback function, mandatory argument
    users.getUserBookings("a@gmail.com");
    res.render('my_bookings');
});

router.get('/available_seats_form', function (req, res, next) {
    checkSession(req, res);
    //can change between get and post
    res.render('available_seats_form');
});
router.get('/bookings/book', function (req, res, next) {
    checkSession(req, res);
    //   /user/bookings/book
    //can change between get and post
    res.render('available_seats');
});

var sessionPresent = function (req, res, next) {
    if (req.session === undefined || !req.session.userMail) {
        return 0;
        //res.redirect('/authentication/login');
    } else {
        return 1;
    }
};
module.exports = router;