const mongoose = require('mongoose');

const foodEntrySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  customFood: {
    name: String,
    calories: Number,
    protein: String,
    carbs: String,
    fat: String
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  consumedAt: {
    type: Date,
    default: Date.now
  }
});

const foodDiarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  entries: [foodEntrySchema],
  dailyGoals: {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 150 },
    carbs: { type: Number, default: 250 },
    fat: { type: Number, default: 65 }
  },
  totalNutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FoodDiary', foodDiarySchema);