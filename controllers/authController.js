const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/UserSchema');

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

const isValidEmail = (email) => {
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const addUser = async (req, res) => {
  
  const {email, password,username,phoneNo, role} = req.body;
  
  try {
    if((role.localeCompare('traveler')!= 0)  && (role.localeCompare('companion')!=0)){
      return res.status(400).json({ message: 'Invalid request', success: false, data: null });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists', success: false, data: null });
    }
    const existingPhoneNo = await User.findOne({ phoneNo });
    if (existingPhoneNo) {
      return res.status(400).json({ message: 'PhoneNo already exists', success: false, data: null });
    }

    
    const phoneRegex = /^\+?[0-9]{0,3}[0-9]{10}$/;
    if (!phoneRegex.test(phoneNo)) {
      return res.status(400).json({ message: 'Invalid phone number format', success: false, data: null });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format', success: false, data: null });
    }
    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists', success: false, data: null });
    } 



    
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit', success: false, data: null });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);
    const isTraveler = role.localeCompare('traveler')==0
    const isCompanion = role.localeCompare('companion')==0
    
    const newUser = new User({email, password: hashedPassword,isTraveler,isCompanion,username,phoneNo});

    
    await newUser.save();

    

    
    res.status(201).json({ message: "User created successfully.", success: true, data: null });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};

const addAdmin = async (req, res) => {
  const {email, password,username,phoneNo} = req.body;
  
  const isAdmin = true;
  try {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists', success: false, data: null });
    }
    const existingPhoneNo = await User.findOne({ phoneNo });
    if (existingPhoneNo) {
      return res.status(400).json({ message: 'PhoneNo already exists', success: false, data: null });
    }
    
    const phoneRegex = /^\+?[0-9]{0,3}[0-9]{10}$/;
    if (!phoneRegex.test(phoneNo)) {
      return res.status(400).json({ message: 'Invalid phone number format', success: false, data: null });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format', success: false, data: null });
    }
    
    const existingUser = await User.findOne({ email });
    
    if (existingUser ) {
      return res.status(400).json({ message: 'Email already exists', success: false, data: null });
    } 



    
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit', success: false, data: null });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({email, password: hashedPassword,isAdmin,username,phoneNo});

    
    await newUser.save();

    
    res.status(201).json({ message: "User created successfully.", success: true, data: null });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};





const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format', success: false, data: null });
    }  
    
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: 'Account does not exist', success: false, data: null });
    }

    
  
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials', success: false, data: null });
    }

    
    const token = jwt.sign({email: user.email,username:user.username}, JWT_SECRET , { expiresIn: '24h' });

    res.status(200).json({ message: 'Login successful', success: true, data: { token } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};


const resetPassword = async (req, res) => {
  const { email, newPassword, verifyNewPassword } = req.body;

  try {
    
    if (newPassword !== verifyNewPassword) {
      return res.status(400).json({ message: 'Passwords do not match', success: false, data: null });
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit', success: false, data: null });
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    
    await User.updateOne({ email }, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successfully', success: true, data: null });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};


module.exports = { addUser,loginUser ,addAdmin,resetPassword};
