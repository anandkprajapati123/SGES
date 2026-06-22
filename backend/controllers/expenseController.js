const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const {
      tripId,
      title,
      description,
      amount,
      category,
      paidBy,
      splitType,
      splitMembers,
      customAmounts,
      date
    } = req.body;

    if (!tripId || !title || !category || !splitType) {
      return res.status(400).json({ message: 'Missing required expense fields' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if current user is a member of this trip
    if (!trip.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: Not a member of this trip' });
    }

    let calculatedAmount = Number(amount);
    let finalPayers = [];
    let finalPaidBy = paidBy;

    if (req.body.multiplePayers && req.body.multiplePayers.length > 0) {
      finalPayers = req.body.multiplePayers.map(p => ({
        memberId: p.memberId,
        amount: Number(p.amount)
      }));
      calculatedAmount = finalPayers.reduce((acc, curr) => acc + curr.amount, 0);
      
      const primaryPayer = finalPayers.reduce((max, p) => p.amount > max.amount ? p : max, { amount: -1 });
      finalPaidBy = primaryPayer.memberId || finalPayers[0].memberId;
    } else {
      if (!amount || !paidBy) {
        return res.status(400).json({ message: 'Missing required expense fields (amount and paidBy)' });
      }
      finalPayers = [{ memberId: paidBy, amount: Number(amount) }];
      calculatedAmount = Number(amount);
      finalPaidBy = paidBy;
    }

    if (isNaN(calculatedAmount) || calculatedAmount <= 0) {
      return res.status(400).json({ message: 'Total expense amount must be greater than 0' });
    }

    // Validate Split Type
    if (splitType === 'Equal') {
      if (!splitMembers || splitMembers.length === 0) {
        return res.status(400).json({ message: 'Split members must be provided for Equal split' });
      }
    } else if (splitType === 'Custom') {
      if (!customAmounts || customAmounts.length === 0) {
        return res.status(400).json({ message: 'Custom amounts must be provided for Custom split' });
      }

      // Check if custom amounts sum up to the total expense amount
      const totalCustom = customAmounts.reduce((acc, curr) => acc + Number(curr.amount), 0);
      const diff = Math.abs(totalCustom - calculatedAmount);
      if (diff > 0.05) { // Allow small floating-point discrepancies
        return res.status(400).json({
          message: `The sum of custom splits (₹${totalCustom.toFixed(2)}) must equal the total expense amount (₹${calculatedAmount.toFixed(2)})`
        });
      }
    }

    const expense = await Expense.create({
      tripId,
      title,
      description,
      amount: calculatedAmount,
      category,
      paidBy: finalPaidBy,
      multiplePayers: finalPayers,
      splitType,
      splitMembers: splitType === 'Equal' ? splitMembers : [],
      customAmounts: splitType === 'Custom' ? customAmounts : [],
      date: date || Date.now()
    });

    const payer = await User.findById(finalPaidBy);
    const actor = await User.findById(req.user.id);
    const isMultiPayer = finalPayers.filter(p => p.amount > 0).length > 1;
    const payerText = isMultiPayer ? 'multiple members' : payer.name;

    // Log Activity
    await Activity.create({
      tripId,
      action: `added expense "${title}" of ₹${calculatedAmount} (paid by ${payerText})`,
      performedBy: req.user.id
    });

    // Notify other trip members
    const notifyMembers = trip.members.filter((mId) => mId.toString() !== req.user.id);
    for (const mId of notifyMembers) {
      let msg = `${actor.name} added ₹${calculatedAmount} for "${title}" in "${trip.tripName}".`;
      if (!isMultiPayer && finalPaidBy !== req.user.id) {
        msg = `${actor.name} added ₹${calculatedAmount} for "${title}" (Paid by ${payer.name}) in "${trip.tripName}".`;
      } else if (isMultiPayer) {
        msg = `${actor.name} added ₹${calculatedAmount} for "${title}" (Paid by multiple members) in "${trip.tripName}".`;
      }
      await Notification.create({
        userId: mId,
        message: msg
      });
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add Expense Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      category,
      paidBy,
      splitType,
      splitMembers,
      customAmounts,
      date
    } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const trip = await Trip.findById(expense.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip associated with this expense was not found' });
    }

    // Check if user is a member of the trip
    if (!trip.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: Not a member of this trip' });
    }

    let calculatedAmount = amount !== undefined ? Number(amount) : expense.amount;
    let finalPayers = expense.multiplePayers || [];
    let finalPaidBy = paidBy || expense.paidBy;

    if (req.body.multiplePayers) {
      if (req.body.multiplePayers.length > 0) {
        finalPayers = req.body.multiplePayers.map(p => ({
          memberId: p.memberId,
          amount: Number(p.amount)
        }));
        calculatedAmount = finalPayers.reduce((acc, curr) => acc + curr.amount, 0);
        
        const primaryPayer = finalPayers.reduce((max, p) => p.amount > max.amount ? p : max, { amount: -1 });
        finalPaidBy = primaryPayer.memberId || finalPayers[0].memberId;
      } else {
        if (amount !== undefined || paidBy !== undefined) {
          const checkPaidBy = paidBy || expense.paidBy;
          const checkAmount = amount !== undefined ? Number(amount) : expense.amount;
          finalPayers = [{ memberId: checkPaidBy, amount: checkAmount }];
          calculatedAmount = checkAmount;
          finalPaidBy = checkPaidBy;
        }
      }
    } else if (amount !== undefined || paidBy !== undefined) {
      const checkPaidBy = paidBy || expense.paidBy;
      const checkAmount = amount !== undefined ? Number(amount) : expense.amount;
      finalPayers = [{ memberId: checkPaidBy, amount: checkAmount }];
      calculatedAmount = checkAmount;
      finalPaidBy = checkPaidBy;
    }

    // Validate Custom Split if updated
    const finalSplitType = splitType || expense.splitType;
    if (finalSplitType === 'Custom') {
      const activeCustomAmounts = customAmounts || expense.customAmounts;
      if (!activeCustomAmounts || activeCustomAmounts.length === 0) {
        return res.status(400).json({ message: 'Custom amounts must be provided for Custom split' });
      }
      const totalCustom = activeCustomAmounts.reduce((acc, curr) => acc + Number(curr.amount), 0);
      const diff = Math.abs(totalCustom - calculatedAmount);
      if (diff > 0.05) {
        return res.status(400).json({
          message: `The sum of custom splits (₹${totalCustom.toFixed(2)}) must equal the total expense amount (₹${calculatedAmount.toFixed(2)})`
        });
      }
    } else if (finalSplitType === 'Equal') {
      const activeSplitMembers = splitMembers || expense.splitMembers;
      if (!activeSplitMembers || activeSplitMembers.length === 0) {
        return res.status(400).json({ message: 'Split members must be provided for Equal split' });
      }
    }

    // Update fields
    expense.title = title || expense.title;
    expense.description = description !== undefined ? description : expense.description;
    expense.amount = calculatedAmount;
    expense.category = category || expense.category;
    expense.paidBy = finalPaidBy;
    expense.multiplePayers = finalPayers;
    expense.splitType = finalSplitType;
    expense.date = date || expense.date;

    if (finalSplitType === 'Equal') {
      expense.splitMembers = splitMembers || expense.splitMembers;
      expense.customAmounts = [];
    } else if (finalSplitType === 'Custom') {
      expense.customAmounts = customAmounts || expense.customAmounts;
      expense.splitMembers = [];
    }

    await expense.save();

    const actor = await User.findById(req.user.id);

    // Log Activity
    await Activity.create({
      tripId: trip._id,
      action: `updated expense "${expense.title}"`,
      performedBy: req.user.id
    });

    // Notify other trip members
    const notifyMembers = trip.members.filter((mId) => mId.toString() !== req.user.id);
    for (const mId of notifyMembers) {
      await Notification.create({
        userId: mId,
        message: `${actor.name} updated the expense "${expense.title}" in "${trip.tripName}".`
      });
    }

    res.json(expense);
  } catch (error) {
    console.error('Update Expense Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const trip = await Trip.findById(expense.tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip associated with this expense was not found' });
    }

    // Check if user is member of trip
    if (!trip.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: Not a member of this trip' });
    }

    // Delete
    await Expense.findByIdAndDelete(req.params.id);

    const actor = await User.findById(req.user.id);

    // Log Activity
    await Activity.create({
      tripId: trip._id,
      action: `deleted expense "${expense.title}"`,
      performedBy: req.user.id
    });

    // Notify other members
    const notifyMembers = trip.members.filter((mId) => mId.toString() !== req.user.id);
    for (const mId of notifyMembers) {
      await Notification.create({
        userId: mId,
        message: `${actor.name} deleted the expense "${expense.title}" from "${trip.tripName}".`
      });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete Expense Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name email profilePicture')
      .populate('splitMembers', 'name email profilePicture')
      .populate('multiplePayers.memberId', 'name email profilePicture');
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const trip = await Trip.findById(expense.tripId);
    if (!trip.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: Not a member of this trip' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get Expense Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user expenses across all active trips
// @route   GET /api/expenses
// @access  Private
const getUserExpenses = async (req, res) => {
  try {
    const trips = await Trip.find({ members: req.user.id });
    const tripIds = trips.map((t) => t._id);

    const expenses = await Expense.find({ tripId: { $in: tripIds } })
      .populate('paidBy', 'name email profilePicture')
      .populate('splitMembers', 'name email profilePicture')
      .populate('multiplePayers.memberId', 'name email profilePicture')
      .populate('tripId', 'tripName')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Get User Expenses Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseById,
  getUserExpenses
};
