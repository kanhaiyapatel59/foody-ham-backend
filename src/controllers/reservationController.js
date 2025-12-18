const Reservation = require('../models/Reservation');

// Create reservation
exports.createReservation = async (req, res) => {
  try {
    const { date, time, partySize, specialOccasion, specialRequests, contactPhone } = req.body;
    
    const reservation = new Reservation({
      user: req.user.id,
      date: new Date(date),
      time,
      partySize,
      specialOccasion,
      specialRequests,
      contactPhone
    });

    await reservation.save();
    await reservation.populate('user', 'name email');
    
    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get user reservations
exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate('user', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all reservations (admin)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update reservation status
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status, tableNumber } = req.body;
    
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status, tableNumber },
      { new: true }
    ).populate('user', 'name email');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};