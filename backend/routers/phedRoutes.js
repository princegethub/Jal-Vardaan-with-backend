const express = require("express");
const {
  registerPhed,
  updatePhed,
  getGpList,
  getGpListWithAssets,
  getGpInventoryList,
  getGpListWithAssetsAndInventory,
  getAllAlertsForPhed,
  createPhedAnnouncement,
  getPhedAnnouncements,
  deletePhedAnnouncement,
  getFinanceOverview,
  addGp,
  updateGp,
  deleteGp,
  viewGpDetails,
} = require("../controller/phedController");
const { authenticate } = require("../middleweres/isAuthenticate");
const router = express.Router();

router.route("/register").post(registerPhed);
router.route("/:phedId").put(updatePhed);
router.get("/gplist", authenticate, getGpList);

//Uncheck Apis
router.get("/gp-assets", authenticate, getGpListWithAssets);
router.get("/gps-inventory", authenticate, getGpInventoryList);
router.get(
  "/gps-assestinventory",
  authenticate,
  getGpListWithAssetsAndInventory
);
router.get(
  "/gps-assestinventory",
  authenticate,
  getGpListWithAssetsAndInventory
);
router.get("/alerts", authenticate, getAllAlertsForPhed);
router.post("/announcement-create", authenticate, createPhedAnnouncement); // Create a new announcement
router.get("/announcement", authenticate, getPhedAnnouncements); // Get all announcements
router.delete(
  "/announcement/:announcementId",
  authenticate,
  deletePhedAnnouncement
); // Delete an announcement
router.post("/finance-overview/:gpId", authenticate, getFinanceOverview);

router.post("/gp-add", authenticate, addGp); // Add GP

router.put("/gp-update/:gpId", authenticate, updateGp); // Update GP

router.delete("/gp-delete/:gpId", authenticate, deleteGp); // Delete GP

router.get("/gp-details", authenticate, viewGpDetails); // detils GPs

module.exports = router;
