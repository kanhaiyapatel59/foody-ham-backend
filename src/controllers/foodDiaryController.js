const FoodDiary = require('../models/FoodDiary');
const Product = require('../models/Product');

// Get or create diary for date
exports.getDiary = async (req, res) => {
  try {
    const { date } = req.query;
    const diaryDate = date ? new Date(date) : new Date();
    diaryDate.setHours(0, 0, 0, 0);

    let diary = await FoodDiary.findOne({
      user: req.user.id,
      date: diaryDate
    }).populate('entries.product');

    if (!diary) {
      diary = new FoodDiary({
        user: req.user.id,
        date: diaryDate,
        entries: []
      });
      await diary.save();
    }

    res.json({
      success: true,
      data: diary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add food entry
exports.addFoodEntry = async (req, res) => {
  try {
    const { date, productId, customFood, quantity, mealType } = req.body;
    const diaryDate = new Date(date);
    diaryDate.setHours(0, 0, 0, 0);

    let diary = await FoodDiary.findOne({
      user: req.user.id,
      date: diaryDate
    });

    if (!diary) {
      diary = new FoodDiary({
        user: req.user.id,
        date: diaryDate,
        entries: []
      });
    }

    const entry = {
      quantity,
      mealType,
      consumedAt: new Date()
    };

    if (productId) {
      entry.product = productId;
    } else {
      entry.customFood = customFood;
    }

    diary.entries.push(entry);
    await diary.save();
    await diary.populate('entries.product');

    // Calculate totals
    await calculateDailyTotals(diary);

    res.json({
      success: true,
      data: diary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update daily goals
exports.updateGoals = async (req, res) => {
  try {
    const { date, goals } = req.body;
    const diaryDate = new Date(date);
    diaryDate.setHours(0, 0, 0, 0);

    let diary = await FoodDiary.findOne({
      user: req.user.id,
      date: diaryDate
    });

    if (!diary) {
      diary = new FoodDiary({
        user: req.user.id,
        date: diaryDate,
        entries: []
      });
    }

    diary.dailyGoals = goals;
    await diary.save();

    res.json({
      success: true,
      data: diary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get nutrition progress
exports.getNutritionProgress = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const diaries = await FoodDiary.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: diaries
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to calculate daily totals
const calculateDailyTotals = async (diary) => {
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  for (const entry of diary.entries) {
    let nutrition;
    
    if (entry.product) {
      nutrition = entry.product.nutritionalInfo;
    } else {
      nutrition = entry.customFood;
    }

    if (nutrition) {
      totals.calories += (nutrition.calories || 0) * entry.quantity;
      totals.protein += parseFloat(nutrition.protein || 0) * entry.quantity;
      totals.carbs += parseFloat(nutrition.carbs || 0) * entry.quantity;
      totals.fat += parseFloat(nutrition.fat || 0) * entry.quantity;
    }
  }

  diary.totalNutrition = totals;
  await diary.save();
};