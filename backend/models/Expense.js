const mongoose = require('mongoose');

const customAmountSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Trip ID is required']
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    enum: ['Food', 'Hotel', 'Transport', 'Shopping', 'Fuel', 'Entertainment', 'Miscellaneous'],
    required: [true, 'Category is required']
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  multiplePayers: [customAmountSchema],
  splitType: {
    type: String,
    enum: ['Equal', 'Custom'],
    required: [true, 'Split type is required']
  },
  splitMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  customAmounts: [customAmountSchema],
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
