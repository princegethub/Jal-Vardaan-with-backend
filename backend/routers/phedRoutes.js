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
  addAsset,
  updateAsset,
  deleteAsset,
  updateInventory,
  addInventory,
  deleteInventory,
 
  getPhedInventoryOverview,
  getPhedAssetOverview,
  getPhedFundRequests,
  getPhedAlerts,
} = require("../controller/phedController");
const { authenticate } = require("../middleweres/isAuthenticate");
const router = express.Router();

router.route("/register").post(registerPhed); // Register a new Phed
router.put("/update" , authenticate,  updatePhed); // Update Phed details
router.get("/gplist", authenticate, getGpList); // Get GP list
router.get("/gp-assets", authenticate, getGpListWithAssets); // Get GP list with assets
router.get("/gps-inventory", authenticate, getGpInventoryList); // Get GP list with inventory
router.get( "/gps-assestinventory", authenticate, getGpListWithAssetsAndInventory); // Get GP list with assets and inventory
router.get("/alerts", authenticate, getPhedAlerts); // Get all alerts for Phed
router.post("/announcement-create", authenticate, createPhedAnnouncement); // Create a new announcement
router.get("/announcement", authenticate, getPhedAnnouncements); // Get all announcements
router.delete( "/announcement/:announcementId", authenticate,deletePhedAnnouncement); // Delete an announcement
router.post("/finance-overview/:gpId", authenticate, getFinanceOverview); // Get finance overview for a GP
router.post("/gp-add", authenticate, addGp); // Add a new GP
router.put("/gp-update/:gpId", authenticate, updateGp); // Update GP details
router.delete("/gp-delete/:gpId", authenticate, deleteGp); // Delete GP
router.get("/gp-details", authenticate, viewGpDetails); // View GP details
router.get("/profile", authenticate, phedProfile); // View GP details
// Asset routes
router.post("/asset", authenticate, addAsset);         // Add a new asset
router.put("/asset/:assetId", authenticate, updateAsset);  // Update asset details
router.delete("/asset/:assetId", authenticate, deleteAsset); // Delete an asset
router.get("/assets/overview", authenticate, getPhedAssetOverview); 

router.post("/inventory", authenticate, addInventory);     // Add a new inventory
router.put("/inventory/:inventoryId", authenticate, updateInventory); // Update inventory details
router.delete("/inventory/:inventoryId", authenticate, deleteInventory); // Delete an inventory
router.get("/inventory/overview", authenticate, getPhedInventoryOverview);
// Get all fund requests for PHED
router.get("/fund/requests", authenticate, getPhedFundRequests);


module.exports = router;
