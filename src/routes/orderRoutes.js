const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders, getUserOrders, getOrder, updateOrderStatus, cancelOrder, getOrderItems } = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);
router.get("/", protect, getUserOrders);
router.get("/all", protect, admin, getAllOrders);
router.get("/:id", protect, getOrder);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);
router.get("/:id/items", protect, getOrderItems);

module.exports = router;
