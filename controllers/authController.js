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






// const verifyUser = async (req, res) => {
//   const { hash } = req.params;
//   try {
    
//     const verificationData = await Verification.findOne({ hash });

//     if (!verificationData) {
//       return res.status(400).json({ message: 'Invalid verification link', success: false, data: null });
//     }

    
//     if (verificationData.verified) {
//       return res.status(201).json({ message: 'Account already verified', success: true, data: null });
//     }

    
//     await Verification.updateOne({ hash }, { verified: true });
//     res.status(200).json({ message: 'Account verified successfully', success: true, data: null });
//   } catch (error) {
//     console.error('Error verifying user:', error);
//     res.status(500).json({ message: 'Server Error', success: false, data: null });
//   }
// };


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

    
    // const verificationData = await Verification.findOne({ email: user.email });
    // if (!verificationData || !verificationData.verified) {
    //   return res.status(400).json({ message: 'Account not verified.Verify the account to log in.', success: false, data: null });
    // }

    
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

// const forgetPassword = async (req, res) => {
//   const { email } = req.body;
  
//   try {
//     if (!isValidEmail(email)) {
//       return res.status(400).json({ message: 'Invalid email format', success: false, data: null });
//     }
    
//     const existingUser = await User.findOne({ email });
//     //const verificationDetails = await Verification.findOne({ email });

//     if (!existingUser || !verificationDetails || !verificationDetails.verified) {
//       return res.status(400).json({ message: 'User not found or not verified', success: false, data: null });
//     }

    
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     await ForgetPassword.findOneAndDelete({ email });

    
//     const forgetPasswordData = new ForgetPassword({ email, otp });
//     await forgetPasswordData.save();

    
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: mailingEmail,
//         pass: mailingEmailPassword,
//       }
//     });

//     const mailOptions = {
//       from: mailingEmail,
//       to: email,
//       subject: 'Password Reset OTP',
//       text: `Your OTP for password reset is: ${otp}`
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: 'OTP sent successfully', success: true, data: null });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ message: 'Server Error', success: false, data: null });
//   }
// };

// const resetPasswordOtp = async (req, res) => {
//   const { email, otp, newPassword, verifyNewPassword } = req.body;

//   try {
//     if (!isValidEmail(email)) {
//       return res.status(400).json({ message: 'Invalid email format', success: false, data: null });
//     }
    
//     if (newPassword !== verifyNewPassword) {
//       return res.status(400).json({ message: 'Passwords do not match', success: false, data: null });
//     }
//     const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
//     if (!passwordRegex.test(newPassword)) {
//       return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit', success: false, data: null });
//     }

    
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'User does not exist', success: false, data: null });
//     }

    
//     const forgetPasswordData = await ForgetPassword.findOne({ email });
//     if (!forgetPasswordData ) {
//       return res.status(400).json({ message: 'No password change request for this email', success: false, data: null });
//     }
//     if (forgetPasswordData.otp !== otp) {
//       return res.status(400).json({ message: 'Invalid OTP', success: false, data: null });
//     }

    
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

    
//     await User.updateOne({ email }, { password: hashedPassword });

    
//     await ForgetPassword.findOneAndDelete({ email });

//     res.status(200).json({ message: 'Password reset successfully', success: true, data: null });
//   } catch (error) {
//     console.error('Error resetting password:', error);
//     res.status(500).json({ message: 'Server Error', success: false, data: null });
//   }
// };
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
// const toggleTraveler = async (req, res) => {
//   const {email}=req.body;
//   try {
    
//     const user = await User.findOne({ email });
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     if (user.isTraveler) {
//       return res.status(400).json({ success: false, message: 'You cannot use this functionality.' });
//     }

    
//     await User.updateOne({ email }, { isTraveler: !user.isTraveler });

//     return res.status(200).json({ success: true, message: 'isTraveler flag toggled successfully' });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

// const toggleTravelerC =  async (req, res) => {
//   const {email}=req.body;
//   try {
    
//     const user = await User.findOne({ email });

    
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     if (user.isCompanion) {
//       return res.status(400).json({ success: false, message: 'You cannot use this functionality because the user is already a traveler' });
//     }

    
//     await User.updateOne({ email }, { isCompanion: !user.isCompanion });
    
//     return res.status(200).json({ success: true, message: 'isTraveler flag toggled successfully' });
//   } catch (error) {
    
//     return res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

module.exports = { addUser,loginUser ,addAdmin,resetPassword};
