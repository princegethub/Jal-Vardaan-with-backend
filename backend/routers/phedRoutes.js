const express = require("express");
const { registerPhed } = require("../controller/phedController");
const { loginUser } = require("../controller/loginController");
const router = express.Router();


router.route("/login").post(loginUser);
router.route("/register").post(registerPhed);


module.exports = router;