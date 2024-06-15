const User = require('../models/UserSchema');
const Trip = require('../models/tripSchema');
require('dotenv').config();
const geofenceInKm=1;
const twilioAcc=process.env.TWILIO_NO;
const twilioToken=process.env.TWILIO_TOKEN;
const twilioNumber=process.env.TWILIO_PHONE;
const createTrip = async (req, res) => {
  const { username, travelCompanions, pickupLat, pickupLong, dropLat, dropLong } = req.body;
  
  const driverName = "Ravi Kumar", driverPhoneNumber="9468533764", cabNumber="RJ14 21M66";
  const curLat=pickupLat,curLong=pickupLong;
  const status="ongoing";
  
  const trip = await Trip.findOne({ username, status: 'ongoing' });
  if(trip){
    return res.status(400).json({ message: 'You already have an ongoing trip', success: false, data: null });
  }
  try {
    if(travelCompanions.length)
    for (const Cusername of travelCompanions) {
        const companion = await User.findOne({ username: Cusername, isCompanion: true });
        
        if (!companion) {
          return res.status(400).json({ message: `Travel companion with username ${Cusername} doesn't exist `, success: false, data: null });
        }
      }
    
    const newTrip = new Trip({
      username,
      driverName,
      driverPhoneNumber,
      cabNumber,
      travelCompanions,
      status,
      pickupLat,
      pickupLong,
      dropLat,
      dropLong,
      curLat,
      curLong
    });
    
    if(travelCompanions.length)
    for (const Cusername of travelCompanions) {
        const companion = await User.findOne({ username: Cusername, isCompanion: true });
        
        companion.notifications.push('Trip started');
        await companion.save();
        const message = `Your friend ${username} has started a trip. View details: http://localhost:5000/api/trips/viewTrip/${newTrip._id}`;
        
        const accountSid = twilioAcc;
        const authToken = twilioToken;
        const twilioPhoneNumber = twilioNumber;
        
        
        const client = require('twilio')(accountSid, authToken);
        
      
      await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: companion.phoneNo 
      });

      }
    await newTrip.save();

    
    const tripId = newTrip._id; 
    const tripLink = `http://localhost:5000/api/trips/viewTrip/${tripId}`; 
    res.status(201).json({ message: 'Trip created successfully', success: true, data: tripLink });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};


const viewTrip = async (req, res) => {
  const { tripId } = req.params;

  try {
    
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found', success: false, data: null });
    }

    if (trip.status === 'completed') {
      return res.status(400).json({ message: 'The trip is completed', success: false, data: null });
    }

    res.status(200).json({ message: 'Trip details loaded successfully', success: true, data: {
      driverName: trip.driverName,
      driverPhoneNumber: trip.driverPhoneNumber,
      cabNumber: trip.cabNumber,
      status: trip.status,
      pickupLat: trip.pickupLat,
      pickupLong: trip.pickupLong,
      dropLat: trip.dropLat,
      dropLong: trip.dropLong,
      curLat: trip.curLat,
      curLong: trip.curLong
    } });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};


const viewUserRides = async (req, res) => {
  const { username } = req.body;

  try {
    const trips = await Trip.find({ username: username });
    
    res.status(200).json({ message: 'Trips loaded successfully', success: true, data: {
      trips: trips.map(trip => ({
        tripId: trip._id,
        driverName: trip.driverName,
        driverPhoneNumber: trip.driverPhoneNumber,
        cabNumber: trip.cabNumber,
        status: trip.status,
        pickupLat: trip.pickupLat,
        pickupLong: trip.pickupLong,
        dropLat: trip.dropLat,
        dropLong: trip.dropLong,
        curLat: trip.curLat,
        curLong: trip.curLong
      }))
    } });
  } catch (error) {
    console.error('Error retrieving trips:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};


const updateLocation = async (req, res) => {
  function calculateDistance(coord1, coord2) {
    
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }

    
    var lat1 = parseFloat(coord1.latitude);
    var lon1 = parseFloat(coord1.longitude);
    var lat2 = parseFloat(coord2.latitude);
    var lon2 = parseFloat(coord2.longitude);

    
    var R = 6371;

    
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);

    
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = R * c; 
    return distance;
  }

  const { username, curLat, curLong ,travelCompanions} = req.body;

  try {
    
    const trip = await Trip.findOne({ username, status: 'ongoing' });

    
    if (!trip) {
      return res.status(404).json({ message: 'Ongoing trip not found for user', success: false, data: null });
    }

    
    if (trip.username !== username) {
      return res.status(403).json({ message: 'Permission Denied', success: false, data: null });
    }

    
    trip.curLat = curLat;
    trip.curLong = curLong;

    
    if (
      calculateDistance({ latitude: trip.dropLat, longitude: trip.dropLong }, { latitude: curLat, longitude: curLong }) < geofenceInKm &&
      trip.reachedNearL=== false
    ) {
      trip.reachedNearL = true;
      if(travelCompanions.length)
    for (const Cusername of travelCompanions) {
        const companion = await User.findOne({ username: Cusername, isCompanion: true });
        companion.notifications.push('You are within 1 km of your destination');
        await companion.save();
      }
    }

    if (trip.curLat === trip.dropLat && trip.curLong === trip.dropLong) {
      trip.status = 'completed';
      if(travelCompanions.length)
      for (const Cusername of travelCompanions) {
        const companion = await User.findOne({ username: Cusername, isCompanion: true });
        companion.notifications.push('Trip completed successfully');
        await companion.save();
      }
    }
    
    await trip.save();

    res.status(200).json({ message: 'Location updated successfully', success: true, data: trip });
  } catch (error) {
    console.error('Error updating  location:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};




const addFeedback = async (req, res) => {
  const { tripId, username, feedback } = req.body;
  console.log(tripId,username,feedback)
  try {
    
    const trip = await Trip.findById(tripId);
    
    trip.feedbacks.push({ username, feedback });
    
    await trip.save();

    res.status(200).json({ message: 'Feedback added successfully', success: true, data: trip });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};
const getNotification = async (req, res) => {
  const { username } = req.body;

  try {
    
    const user = await User.findOne({ username });
    
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    
    return res.status(200).json({ success: true, notifications: user.notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { createTrip, viewTrip, viewUserRides ,updateLocation,addFeedback,getNotification};
