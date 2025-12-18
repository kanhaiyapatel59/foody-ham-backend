const express = require('express');
const router = express.Router();
const {
  createReservation,
  getUserReservations,
  getAllReservations,
  updateReservationStatus
} = require('../controllers/reservationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getUserReservations)
  .post(createReservation);

router.get('/admin/all', admin, getAllReservations);
router.put('/:id/status', admin, updateReservationStatus);

module.exports = router;