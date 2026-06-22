const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { calculateSettlements } = require('./tripController');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all trips user is a member of
    const trips = await Trip.find({ members: userId });
    const tripIds = trips.map((t) => t._id);

    // Calculate total expenses in all trips (overall spending)
    const expenses = await Expense.find({ tripId: { $in: tripIds } });
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate amounts owed / owes using the settlement summaries of all trips
    let amountOwedByOthers = 0;
    let amountUserOwesOthers = 0;

    for (const trip of trips) {
      const summary = await calculateSettlements(trip._id);
      if (summary && summary.settlements) {
        summary.settlements.forEach((settlement) => {
          if (settlement.from.id === userId) {
            amountUserOwesOthers += settlement.amount;
          } else if (settlement.to.id === userId) {
            amountOwedByOthers += settlement.amount;
          }
        });
      }
    }

    // Get recent activities across all user's trips
    const recentActivities = await Activity.find({ tripId: { $in: tripIds } })
      .populate('performedBy', 'name email profilePicture')
      .populate('tripId', 'tripName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent notifications for user
    const recentNotifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalTrips: trips.length,
      totalExpenses,
      amountOwedByOthers: Math.round(amountOwedByOthers * 100) / 100,
      amountUserOwesOthers: Math.round(amountUserOwesOthers * 100) / 100,
      recentActivities,
      recentNotifications
    });
  } catch (error) {
    console.error('Get Dashboard Data Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardData
};
