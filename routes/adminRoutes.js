const express = require('express');
const router = express.Router();
const { isLoggedIn,isAdmin } = require('../check/auth_check');
const {UserRides,UserFeedback, AllFeed, AllRides } = require('../controllers/adminController');
router.post('/UserRides',isLoggedIn,isAdmin,UserRides);
router.post('/UserFeedback',isLoggedIn,isAdmin,UserFeedback);
router.get('/AllRides',isLoggedIn,isAdmin,AllRides);
router.get('/AllFeed',isLoggedIn,isAdmin,AllFeed);
module.exports = router;
