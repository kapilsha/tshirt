const express = require("express");

const router = express.Router();
const {
  createOrder,
  getOneorder,
  getLoggedInOrders,
  adminGetAllOrders,
  adminDeleteOrder,
  adminUpdateOrder,
} = require("../controllers/orderController");
const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/myorder").get(isLoggedIn, getLoggedInOrders);
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);

router
  .route("/admin/order/:id")
  .delete(isLoggedIn, customRole("admin"), adminDeleteOrder)
  .put(isLoggedIn, customRole("admin"), adminUpdateOrder);

// always place "/:id" route at the bottom of all the route
router.route("/order/:id").get(isLoggedIn, getOneorder);

module.exports = router;
