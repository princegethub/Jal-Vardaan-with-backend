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
  phedProfile,
} = require("../controller/phedController");
const { authenticate } = require("../middleweres/isAuthenticate");
const router = express.Router();

router.route("/register").post(registerPhed); // Register a new Phed
router.put("/update" , authenticate,  updatePhed); // Update Phed details
router.get("/gplist", authenticate, getGpList); // Get GP list
router.get("/gp-assets", authenticate, getGpListWithAssets); // Get GP list with assets
router.get("/gps-inventory", authenticate, getGpInventoryList); // Get GP list with inventory
router.get( "/gps-assestinventory", authenticate, getGpListWithAssetsAndInventory); // Get GP list with assets and inventory
router.get("/alerts", authenticate, getAllAlertsForPhed); // Get all alerts for Phed
router.post("/announcement-create", authenticate, createPhedAnnouncement); // Create a new announcement
router.get("/announcement", authenticate, getPhedAnnouncements); // Get all announcements
router.delete( "/announcement/:announcementId", authenticate,deletePhedAnnouncement); // Delete an announcement
router.post("/finance-overview/:gpId", authenticate, getFinanceOverview); // Get finance overview for a GP
router.post("/gp-add", authenticate, addGp); // Add a new GP
router.put("/gp-update/:gpId", authenticate, updateGp); // Update GP details
router.delete("/gp-delete/:gpId", authenticate, deleteGp); // Delete GP
router.get("/gp-details", authenticate, viewGpDetails); // View GP details
router.get("/profile", authenticate, phedProfile); // View GP details

module.exports = router;
