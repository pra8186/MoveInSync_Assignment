const express = require('express');
const router = express.Router();
const { isLoggedIn, checkUser, checkCompanion } = require('../check/auth_check');
const { createTrip, viewTrip, viewUserRides, updateLocation, addFeedback, getNotification } = require('../controllers/tripController');
const { isTraveler,isCompanion } = require('../check/auth_check');

router.post('/createTrip',isLoggedIn,isTraveler,createTrip);
router.get('/viewTrip/:tripId',  isLoggedIn,isCompanion,checkCompanion,viewTrip);
router.get('/viewUserRides',isLoggedIn,isTraveler,viewUserRides);
router.post('/updateLocation',isLoggedIn,isTraveler,updateLocation);
router.post('/addFeedback',isLoggedIn,checkUser,addFeedback);
router.get('/getNotification',isLoggedIn,getNotification);
module.exports = router;