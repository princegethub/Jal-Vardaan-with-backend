const express = require("express");
const { registerPhed , updatePhed , getGpList, getGpListWithAssets, getGpInventoryList, getGpListWithAssetsAndInventory, getAlertsForGp} = require("../controller/phedController");
const {protectRoute} = require("../middleweres/isAuthenticate");
const router = express.Router();



router.route("/register").post(registerPhed);
router.route("/:phedId").put(updatePhed);
router.get("/gplist",protectRoute,  getGpList);

//Uncheck Apis
router.get("/gp-assets", getGpListWithAssets);
router.get("/gps-inventory", getGpInventoryList);
router.get("/gps-assestinventory", getGpListWithAssetsAndInventory);
router.get("/gps-assestinventory", getGpListWithAssetsAndInventory);
router.get('/alerts/:gpId', getAlertsForGp);


module.exports = router;