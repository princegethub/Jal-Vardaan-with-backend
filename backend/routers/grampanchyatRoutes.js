const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleweres/isAuthenticate");
const gpController = require("../controller/grampanchyatController");

// User routes
router.post("/user/add", authenticate, gpController.addUser);
router.put("/user/edit/:userId", authenticate, gpController.editUser);
router.delete("/user/delete/:userId", authenticate, gpController.deleteUser);
router.get("/users/active", authenticate, gpController.getActiveUsers);
router.get("/users/inactive", authenticate, gpController.getInactiveUsers);
router.get("/user/:userId", authenticate, gpController.getUserDetails);

// Asset and Inventory routes
router.get("/assets", authenticate, gpController.getAssets);
router.get("/inventory", authenticate, gpController.getInventory);

// Announcement routes
router.post("/announcement", authenticate, gpController.createAnnouncement);
router.put("/announcement/:id", authenticate, gpController.updateAnnouncement);

router.delete("/announcement/:id", authenticate, gpController.deleteAnnouncement);
router.get("/announcements", authenticate, gpController.getGpAnnouncements);

// Fund request routes
router.post("/fund/request", authenticate, gpController.createFundRequest);
router.get("/fund/requests", authenticate, gpController.getGpFundRequests);

// Income and Expenditure routes
router.post("/income", authenticate, gpController.createIncome);
router.post("/expenditure", authenticate, gpController.createExpenditure);
router.get("/income-expenditure", authenticate, gpController.getIncomeExpenditureList);

// Notification routes
router.get("/notifications", authenticate, gpController.getGpNotifications);

// GP complaint routes
router.post("/gp-complaint", authenticate, gpController.createGpComplaint);
router.put("/gp-complaint/edit/:complaintId", authenticate, gpController.editGpComplaint);
router.delete("/gp-complaint/delete/:complaintId", authenticate, gpController.deleteGpComplaint);

module.exports = router;
