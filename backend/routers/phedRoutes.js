const express = require("express");
const { registerPhed , updatePhed } = require("../controller/phedController");
const router = express.Router();



router.route("/register").post(registerPhed);
router.route("/:phedId").put(updatePhed);

module.exports = router;