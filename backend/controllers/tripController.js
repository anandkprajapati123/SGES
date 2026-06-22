const Trip = require('../models/Trip');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const { tripName, description, startDate, endDate } = req.body;

    if (!tripName) {
      return res.status(400).json({ message: 'Trip name is required' });
    }

    const trip = await Trip.create({
      tripName,
      description,
      creator: req.user.id,
      members: [req.user.id], // Creator is automatically a member
      startDate,
      endDate
    });

    // Log Activity
    await Activity.create({
      tripId: trip._id,
      action: 'created the trip',
      performedBy: req.user.id
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Create Trip Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's trips
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    // Get all trips where user is a member
    const trips = await Trip.find({ members: req.user.id })
      .populate('creator', 'name email profilePicture')
      .populate('members', 'name email profilePicture')
      .sort({ createdAt: -1 });

    // For each trip, let's attach total amount spent and number of expenses
    const tripsWithStats = await Promise.all(
      trips.map(async (trip) => {
        const expenses = await Expense.find({ tripId: trip._id });
        const totalAmountSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        return {
          ...trip.toObject(),
          totalAmountSpent,
          expensesCount: expenses.length
        };
      })
    );

    res.json(tripsWithStats);
  } catch (error) {
    console.error('Get Trips Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trip details
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('creator', 'name email profilePicture')
      .populate('members', 'name email profilePicture');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a member of the trip
    if (!trip.members.some((m) => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied: Not a member of this trip' });
    }

    // Deduplicate members (fixes trips affected by the old ObjectId includes() bug)
    const seen = new Set();
    const uniqueMembers = trip.members.filter((m) => {
      const id = m._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    // If duplicates were found, auto-repair the trip in DB
    if (uniqueMembers.length !== trip.members.length) {
      await Trip.findByIdAndUpdate(trip._id, { members: uniqueMembers.map(m => m._id) });
    }
    trip.members = uniqueMembers;

    // Get expenses
    const expenses = await Expense.find({ tripId: trip._id })
      .populate('paidBy', 'name email profilePicture')
      .populate('splitMembers', 'name email profilePicture')
      .populate('multiplePayers.memberId', 'name email profilePicture')
      .sort({ date: -1 });

    res.json({ trip, expenses });
  } catch (error) {
    console.error('Get Trip Details Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to trip using email
// @route   POST /api/trips/:id/invite
// @access  Private
const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is creator or member (only members can add members)
    // Use .toString() comparison — Mongoose ObjectIds are objects, .includes() won't match by value
    if (!trip.members.some((mId) => mId.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToAdd) {
      return res.status(404).json({ message: `No user found with email ${email}` });
    }

    // Use .toString() comparison to correctly detect if user is already a member
    if (trip.members.some((mId) => mId.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: 'User is already a member of this trip' });
    }

    // Add user
    trip.members.push(userToAdd._id);
    await trip.save();

    const currentUser = await User.findById(req.user.id);

    // Log Activity
    await Activity.create({
      tripId: trip._id,
      action: `added ${userToAdd.name} to the trip`,
      performedBy: req.user.id
    });

    // Create Notification for the added user
    await Notification.create({
      userId: userToAdd._id,
      message: `${currentUser.name} added you to the trip "${trip.tripName}"`
    });

    // Create Notification for other members
    const otherMembers = trip.members.filter(
      (mId) => mId.toString() !== req.user.id && mId.toString() !== userToAdd._id.toString()
    );

    for (const mId of otherMembers) {
      await Notification.create({
        userId: mId,
        message: `${currentUser.name} added ${userToAdd.name} to the trip "${trip.tripName}"`
      });
    }

    res.json({ message: 'Member added successfully', trip });
  } catch (error) {
    console.error('Add Member Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate settlements dynamically
const calculateSettlements = async (tripId) => {
  const trip = await Trip.findById(tripId).populate('members', 'name email profilePicture');
  if (!trip) return null;

  const expenses = await Expense.find({ tripId });

  // Initialize balances map
  const balances = {};
  trip.members.forEach((member) => {
    balances[member._id.toString()] = 0;
  });

  expenses.forEach((expense) => {
    const amount = expense.amount;

    // Credit the payers
    if (expense.multiplePayers && expense.multiplePayers.length > 0) {
      expense.multiplePayers.forEach((payer) => {
        const payerId = payer.memberId.toString();
        if (balances[payerId] !== undefined) {
          balances[payerId] += payer.amount;
        }
      });
    } else if (expense.paidBy) {
      // Fallback to single payer
      const payerId = expense.paidBy.toString();
      if (balances[payerId] !== undefined) {
        balances[payerId] += amount;
      }
    }

    // Debit the split members
    if (expense.splitType === 'Equal') {
      const splitMembers = expense.splitMembers.length > 0 
        ? expense.splitMembers.map(m => m.toString()) 
        : trip.members.map(m => m._id.toString());
      const share = amount / splitMembers.length;

      splitMembers.forEach((memberId) => {
        if (balances[memberId] !== undefined) {
          balances[memberId] -= share;
        }
      });
    } else if (expense.splitType === 'Custom') {
      expense.customAmounts.forEach((custom) => {
        const memberId = custom.memberId.toString();
        if (balances[memberId] !== undefined) {
          balances[memberId] -= custom.amount;
        }
      });
    }
  });

  // Convert balances into debtors and creditors
  const debtors = [];
  const creditors = [];

  Object.keys(balances).forEach((key) => {
    const user = trip.members.find((m) => m._id.toString() === key);
    const balance = balances[key];

    if (balance < -0.01) {
      debtors.push({
        userId: key,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        amount: Math.abs(balance)
      });
    } else if (balance > 0.01) {
      creditors.push({
        userId: key,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        amount: balance
      });
    }
  });

  const settlements = [];

  // Greedy settlement algorithm
  while (debtors.length > 0 && creditors.length > 0) {
    // Sort descending by amount to settle the largest debts first
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debtor = debtors[0];
    const creditor = creditors[0];

    const amountToSettle = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round((amountToSettle + Number.EPSILON) * 100) / 100;

    if (roundedAmount > 0) {
      settlements.push({
        from: {
          id: debtor.userId,
          name: debtor.name,
          email: debtor.email,
          profilePicture: debtor.profilePicture
        },
        to: {
          id: creditor.userId,
          name: creditor.name,
          email: creditor.email,
          profilePicture: creditor.profilePicture
        },
        amount: roundedAmount
      });
    }

    debtor.amount -= amountToSettle;
    creditor.amount -= amountToSettle;

    if (debtor.amount < 0.01) {
      debtors.shift();
    }
    if (creditor.amount < 0.01) {
      creditors.shift();
    }
  }

  return { balances, settlements };
};

// @desc    Get trip settlement summary
// @route   GET /api/trips/:id/settlements
// @access  Private
const getTripSettlements = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!trip.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: Not a member of this trip' });
    }

    const summary = await calculateSettlements(trip._id);
    res.json(summary);
  } catch (error) {
    console.error('Get Settlements Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trip activities
// @route   GET /api/trips/:id/activities
// @access  Private
const getTripActivities = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!trip.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: Not a member of this trip' });
    }

    const activities = await Activity.find({ tripId: req.params.id })
      .populate('performedBy', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    console.error('Get Trip Activities Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join trip using link
// @route   POST /api/trips/:id/join
// @access  Private
const joinTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this trip' });
    }

    // Add user
    trip.members.push(req.user.id);
    await trip.save();

    const userJoined = await User.findById(req.user.id);

    // Log Activity
    await Activity.create({
      tripId: trip._id,
      action: 'joined the trip using an invite link',
      performedBy: req.user.id
    });

    // Notify other members
    const otherMembers = trip.members.filter((mId) => mId.toString() !== req.user.id);
    for (const mId of otherMembers) {
      await Notification.create({
        userId: mId,
        message: `${userJoined.name} joined the trip "${trip.tripName}" using an invite link.`
      });
    }

    res.json({ message: 'Joined trip successfully', trip });
  } catch (error) {
    console.error('Join Trip Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  addMember,
  getTripSettlements,
  calculateSettlements, // Exported for dashboard helper usage
  getTripActivities,
  joinTrip
};
