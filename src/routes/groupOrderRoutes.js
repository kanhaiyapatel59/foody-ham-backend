const express = require('express');
const router = express.Router();
const {
  createGroupOrder,
  joinGroupOrder,
  addItemToGroupOrder,
  addVotingItem,
  voteOnItem,
  getGroupOrders,
  getGroupOrder
} = require('../controllers/groupOrderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getGroupOrders)
  .post(createGroupOrder);

router.route('/:groupOrderId')
  .get(getGroupOrder);

router.post('/:groupOrderId/join', joinGroupOrder);
router.post('/:groupOrderId/items', addItemToGroupOrder);
router.post('/:groupOrderId/voting', addVotingItem);
router.post('/:groupOrderId/voting/:votingItemId/vote', voteOnItem);

module.exports = router;