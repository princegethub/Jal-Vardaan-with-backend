const express = require("express");
const router = express.Router();
const { loginUser } = require("../controller/loginController"); // Correct path

router.route("/login").post(loginUser);

module.exports = router;
