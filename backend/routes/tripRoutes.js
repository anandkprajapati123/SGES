const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTripById,
  addMember,
  getTripSettlements,
  getTripActivities,
  joinTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createTrip)
  .get(protect, getTrips);

router.route('/:id')
  .get(protect, getTripById);

router.post('/:id/invite', protect, addMember);
router.post('/:id/join', protect, joinTrip);
router.get('/:id/settlements', protect, getTripSettlements);
router.get('/:id/activities', protect, getTripActivities);

module.exports = router;
