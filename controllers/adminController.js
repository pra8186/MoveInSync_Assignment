const Trip = require('../models/tripSchema');
const UserRides = async (req, res) => {
  const { target } = req.body;

  try {
    
    const trips = await Trip.find({ 'username': target});

    res.status(200).json({ message: 'Rides Loaded successfully', success: true, data: trips });
  } catch (error) {
    console.error('Error Loading rides:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};

const UserFeedback= async (req, res) => {
  const { target } = req.body;

  try {
    const feedbacks = await Trip.aggregate([
      
      { $match: { 'feedbacks.username': target } },
      
      { $unwind: '$feedbacks' },
      
      { $match: { 'feedbacks.username': target } },
      
      {
        $group: {
          _id: '$_id',
          feedbacks: { $push: '$feedbacks' }
        }
      }
    ]);

    
    const extractedFeedbacks = feedbacks.map(trip => trip.feedbacks).flat();

    res.status(200).json({ message: 'Feedback Loaded successfully', success: true, data: extractedFeedbacks });
  } catch (error) {
    console.error('Error loading feedback:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};
const AllRides = async (req, res) => {
  try {
    
    const trips = await Trip.find();

    res.status(200).json({ message: 'All rides fetched successfully', success: true, data: trips });
  } catch (error) {
    console.error('Error fetching all rides:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
};
const AllFeed = async (req, res) => {
  try {
    const feedbacks = await Trip.aggregate([
      
      { $unwind: '$feedbacks' },
      
      {
        $group: {
          _id: '$_id',
          feedbacks: { $push: '$feedbacks' }
        }
      }
    ]);

    
    const extractedFeedbacks = feedbacks.map(trip => trip.feedbacks).flat();

    res.status(200).json({ message: 'All feedbacks loaded successfully', success: true, data: extractedFeedbacks });
  } catch (error) {
    console.error('Error loading all feedbacks:', error);
    res.status(500).json({ message: 'Server Error', success: false, data: null });
  }
}

module.exports = { UserRides,UserFeedback,AllRides,AllFeed };
