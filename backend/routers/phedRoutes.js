const express = require("express");
const { registerPhed , updatePhed , getGpList} = require("../controller/phedController");
const {protectRoute} = require("../middleweres/isAuthenticate");
const router = express.Router();



router.route("/register").post(registerPhed);
router.route("/:phedId").put(updatePhed);
router.get("/gplist",protectRoute,  getGpList);

module.exports = router;