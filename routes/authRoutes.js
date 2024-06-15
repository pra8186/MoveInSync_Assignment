const express = require('express');
const router = express.Router();
const { isLoggedIn, isTraveler, isCompanion } = require('../check/auth_check');
const { addUser, loginUser, addAdmin, resetPassword} = require('../controllers/authController');
router.post('/register', addUser);
router.post('/registerAdmin', addAdmin);
router.get('/login', loginUser);
router.post('/resetPassword',isLoggedIn,resetPassword);
module.exports = router;
