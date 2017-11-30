var express = require('express');
var router = express.Router();
var users = require("../models/users");
var bodyParser = require('body-parser');

//Application routes
router.get('/', function (req, res, next) {
    if (sessionPresent(req, res)) {
        //var userMail = req.session.userMail;

        users.getUserProfile("abc@g.c").then(function (profile) {
        /*    var userMail = req.session.userMail;
            console.log(userMail);
*/
            //res.render('my_profile', {userProfile: profile, usermail : userMail});
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
        res.send("user added");

    }else{
        //not logged in
        res.redirect('/authentication/login');
    }
});
router.get('/vehicles', function (req, res, next) {
    checkSession(req, res);
    users.getUserVehicles("user id");
    res.render('my_vehicles');
});

router.get('/vehicles/add', function (req, res, next) {
    checkSession(req, res);
    // /user/vehicles/add
    var vehicleProfile = {
        "departure_date": "date",
        "departure_time": "time",
        "source": "place",
        "destination": "destination_place",
        "vehicle_identification": "number or name",
        "total_seats": 2,
        "price": 100,
        "owner": userEmail,
        "passengers": []
    };
    users.addUserVehicle(vehicleProfile);
    res.render('add_vehicles');
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
