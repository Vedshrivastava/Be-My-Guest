const express = require("express");
const wrapasync = require("../utils/wrapasync");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const {saveredirectUrl} = require("../middleware")
const userController = require("../controllers/users")

router.get("/signup", userController.signupForm)
router.post("/signup",wrapasync(userController.signup));
router.get("/login", userController.loginForm);
router.get("/logout", userController.logout);
router.post("/login", saveredirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), userController.login);

module.exports = router;