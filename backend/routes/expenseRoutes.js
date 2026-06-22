const express = require('express');
const router = express.Router();
const {
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseById,
  getUserExpenses
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, addExpense)
  .get(protect, getUserExpenses);
router.route('/:id')
  .get(protect, getExpenseById)
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

module.exports = router;
