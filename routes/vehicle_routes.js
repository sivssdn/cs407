var express = require('express');
var router = express.Router();
var vehicles = require("../models/vehicles");
var bodyParser = require('body-parser');


router.get('/', function (req, res, next) {
    /*for /vehicles*/
    if (sessionPresent(req, res)) {
        //can change between get and post
        res.render('available_seats_form');
    } else {
        //not logged in
        res.redirect("/authentication/login");
    }
});

router.post('/', function (req, res, next) {
    /*for /vehicles*/
    if (sessionPresent(req, res)) {

        var journeyDate = new Date(formatDate(req.body.date));
        var time1 = new Date("2000-11-11 " + req.body.time1);
        var time2 = new Date("2000-11-11 " + req.body.time1 );
        var journeyDetails = {
            date: journeyDate,
            source: req.body.source,
            destination: req.body.destination,
            time1: time1,
            time2: time2
        };
        console.log(journeyDetails);
        vehicles.getVehicles(journeyDetails).then(function (vehicleList) {
            console.log(vehicleList);
            res.render("available_seats", {vehicles: vehicleList});
        }, function (error) {
            console.log("Promise was rejected in /bookings", error, error.stack);
        });

    } else {
        res.redirect("/authentication/login");
    }
});

router.get('/book', function (req, res, next) {
    if (sessionPresent(req, res)) {
        res.render('available_seats');
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

var formatDate = function(date){
    //to format date to validate and for comparison
    var formattedDate = date.split("-");
    formattedDate = formattedDate[2]+"-"+formattedDate[1]+"-"+formattedDate[0]+"T00:00Z";
    return formattedDate;
};

module.exports = router;