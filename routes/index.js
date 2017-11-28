var express = require('express');
var router = express.Router();
var vehicles = require('../models/vehicles');
var users = require("../models/users");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/user', function (req, res, next) {
    users.getUserProfile("abc@g.c");
    res.render('my_profile');
});
router.get("/add", function (req, res, next) {
    //add user
    var user = {email : "abc@gmail.com",
        phone : 9958108332,
        department : "ASP"
    };
    users.addUser(user);
    res.send("user added");
});
router.get('/vehicles', function(req, res, next){
    users.getUserVehicles("user id");
    res.render('my_vehicles');
});

router.get('/vehicles/add',function (req, res, next) {
   // /user/vehicles/add
    var vehicleProfile = {
        "departure_date" : "date",
        "departure_time" : "time",
        "source" : "place",
        "destination" : "destination_place",
        "vehicle_identification" : "number or name",
        "total_seats" : 2,
        "price" : 100,
        "owner": userEmail,
        "passengers" : []
    };
    users.addUserVehicle(vehicleProfile);
    res.render('add_vehicles');
});
router.get('/bookings', function (req, res, next) { //user/bookings
    //next is callback function, mandatory argument
    users.getUserVehicles("a@gmail.com");
    res.render('my_bookings');
});

router.get('/available_seats_form', function (req, res, next) {
    //can change between get and post
    res.render('available_seats_form');
});
router.get('/bookings/book', function (req, res, next) {
    //   /user/bookings/book
    //can change between get and post
    res.render('available_seats');
});

module.exports = router;
