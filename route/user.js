const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUser,
  managerAllUser,
  adminGetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

// admin only route
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);

// admin router to get a single user through user id
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

// manager only route
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);

module.exports = router;
