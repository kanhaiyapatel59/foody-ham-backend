const express = require('express');
const router = express.Router();
const {
  getDiary,
  addFoodEntry,
  updateGoals,
  getNutritionProgress
} = require('../controllers/foodDiaryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getDiary);
router.post('/entry', addFoodEntry);
router.put('/goals', updateGoals);
router.get('/progress', getNutritionProgress);

module.exports = router;