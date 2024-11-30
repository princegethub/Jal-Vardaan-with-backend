const express = require("express");
const { registerPhed } = require("../controller/phedController");
const router = express.Router();


router.route("/register").post(registerPhed);

module.exports = router;