var express = require('express');
var router = express.Router();
var vehicles = require('../models/vehicles');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/add_vehicles',function (req, res, next) {
    vehicles();
    res.render('add_vehicles');
});
router.get('/my_bookings', function (req, res, next) {
    //next is callback function, mandatory argument
    res.render('my_bookings');
});
router.get('/my_profile', function (req, res, next) {
    res.render('my_profile');
});
router.get('/my_vehicles', function(req, res, next){
    res.render('my_vehicles');
});
router.get('/available_seats_form', function (req, res, next) {
    res.render('available_seats_form');
});
router.get('/available_seats', function (req, res, next) {
    res.render('available_seats');
});

module.exports = router;
