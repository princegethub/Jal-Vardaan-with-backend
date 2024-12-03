const {
  Grampanchayat,
  GpAnnouncement,
  FundRequest,
  Income,
  Expenditure,
  GpComplaint,
} = require("../model/gpModel");
const { User } = require("../model/userModel");
const { Phed } = require("../model/phedModel"); // PHED model
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require("uuid");

// Add User
exports.addUser = async (req, res) => {
  try {
    const gpId = req.user.id; // Authenticated GP's ID

    const { consumerName, address, aadhar, contact} = req.body;

    // Validate required fields
    if (!consumerName || !address || !aadhar || !contact) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the contact is already in use
    const existingUser = await User.findOne({ contact });
    if (existingUser) {
      return res.status(400).json({ message: "Contact number already exists." });
    }

    // Create a unique consumerId
    const datePart =
      new Date().getFullYear().toString().slice(-2) +
      ("0" + (new Date().getMonth() + 1)).slice(-2) +
      ("0" + new Date().getDate()).slice(-2);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const consumerId = `CU${datePart}${randomPart}`;

    const password = await bcrypt.hash("test@123", 10);

    // Create the user
    const newUser = new User({
      consumerId,
      consumerName,
      address,
      aadhar,
      password,
      role: "USER",
      contact,
    });

    // Add user to GP's userList
    const gp = await Grampanchayat.findByIdAndUpdate(
      { _id: gpId },
      { $push: { userList: newUser._id } },
      { new: true }
    );

    // Save the new user to the databas e
    await newUser.save();
    res.status(201).json({ message: "User added successfully!", newUser, gp });
  } catch (err) {
    res.status(500).json({ message: "Error adding user.", error: err.message });
  }
};

// Edit User
exports.editUser = async (req, res) => {
  try {
    const gpId = req.user.id;
    const { userId } = req.params;
    console.log('userId: ', userId);
    const { consumerName, address, aadhar, contact } = req.body;

    // Update user details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { consumerName, address, aadhar, contact },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({ message: "User updated successfully!", updatedUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user.", error: err.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const gpId = req.user.id;
    const { userId } = req.params;

    // Remove user from GP's userList and add to inactiveUserList
    const gp = await Grampanchayat.findByIdAndUpdate(
      gpId,
      {
        $pull: { userList: userId },
        $push: { inactiveUserList: userId },
      },
      { new: true }
    );

    if (!gp) {
      return res.status(404).json({ message: "GP not found." });
    }

    res.status(200).json({ message: "User deleted successfully!", gp });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user.", error: err.message });
  }
};

// Get Active Users
exports.getActiveUsers = async (req, res) => {
  try {
    const gpId = req.user.id;

    // Fetch GP and populate active userList
    const gp = await Grampanchayat.findById(gpId).populate("userList" , "-password");
    if (!gp) {
      return res.status(404).json({ message: "GP not found." });
    }

    res.status(200).json({ activeUsers: gp.userList });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching active users.", error: err.message });
  }
};

// Get Inactive Users
exports.getInactiveUsers = async (req, res) => {
  try {
    const gpId = req.user.id;

    // Fetch GP and return inactive users
    const gp = await Grampanchayat.findById(gpId).populate("inactiveUserList", '-password');
    if (!gp) {
      return res.status(404).json({ message: "GP not found." });
    }

    res.status(200).json({ inactiveUsers: gp.inactiveUserList });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching inactive users.", error: err.message });
  }
};

// Get User Details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user details by ID
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user details.", error: err.message });
  }
};

// Get GP's Assets with populated data
exports.getAssets = async (req, res) => {
  try {
    const gpId = req.user.id; // Authenticated GP ID

    // Fetch GP data and populate assets
    const gp = await Grampanchayat.findById(gpId)
      .populate("assets")
      .select("assets");
    if (!gp) {
      return res.status(404).json({ message: "GP not found." });
    }

    res.status(200).json({ assets: gp.assets });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching assets.", error: err.message });
  }
};

// Get GP's Inventory with populated data
exports.getInventory = async (req, res) => {
  try {
    const gpId = req.user.id; // Authenticated GP ID

    // Fetch GP data and populate inventory
    const gp = await Grampanchayat.findById(gpId)
      .populate("inventory")
      .select("inventory");
    if (!gp) {
      return res.status(404).json({ message: "GP not found." });
    }

    res.status(200).json({ inventory: gp.inventory });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching inventory.", error: err.message });
  }
};

// Create an announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const gpId = req.user.id; // Authenticated GP ID
    const { category, message } = req.body;

    // Create new announcement
    const newAnnouncement = new GpAnnouncement({ category, message });
    const savedAnnouncement = await newAnnouncement.save();

    // Update GP with the new announcement ID
    await Grampanchayat.findByIdAndUpdate(gpId, {
      $push: { announcement: savedAnnouncement._id },
    });

    res.status(201).json({
      message: "Announcement created successfully.",
      announcement: savedAnnouncement,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating announcement.", error: err.message });
  }
};

// Update an announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params; // Announcement ID
    const { category, message } = req.body;

    // Update announcement details
    const updatedAnnouncement = await GpAnnouncement.findByIdAndUpdate(
      id,
      { category, message },
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    res.status(200).json({
      message: "Announcement updated successfully.",
      announcement: updatedAnnouncement,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating announcement.", error: err.message });
  }
};

// Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params; // Announcement ID
    const gpId = req.user.id; // Authenticated GP ID

    // Delete announcement
    const deletedAnnouncement = await GpAnnouncement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    // Remove announcement ID from GP's announcement array
    await Grampanchayat.findByIdAndUpdate(gpId, {
      $pull: { announcement: id },
    });

    res.status(200).json({ message: "Announcement deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting announcement.", error: err.message });
  }
};

// Create a new fund request
exports.createFundRequest = async (req, res) => {
  try {
    const gpId = req.user.id; // Authenticated GP ID
    const { category, amount, description } = req.body;

    // Input validation
    if (!category || !amount || !description) {
      return res.status(400).json({
        message: "All fields are required: category, amount, and description.",
      });
    }

    // Create a new fund request document
    const newRequest = new FundRequest({
      category,
      amount,
      description,
      createdAt: new Date(),
    });

    // Save the request to the database
    const savedRequest = await newRequest.save();

    // Update the GP model
    await Grampanchayat.findByIdAndUpdate(
      gpId,
      { $push: { requestFund: savedRequest._id } },
      { new: true }
    );

    // Update the PHED model
    const phed = await Phed.findOne(); // Assuming one PHED in your application
    if (phed) {
      await Phed.findByIdAndUpdate(
        phed._id,
        { $push: { requestFund: savedRequest._id } },
        { new: true }
      );
    }

    res.status(201).json({
      message: "Fund request created successfully.",
      fundRequest: savedRequest,
    });
  } catch (error) {
    console.error("Error creating fund request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getGpFundRequests = async (req, res) => {
  try {
    const gpId = req.user.id;

    const gp = await Grampanchayat.findById(gpId).populate("requestFund");
    if (!gp) {
      return res.status(404).json({ message: "GP not found." });
    }

    res.status(200).json({ fundRequests: gp.requestFund });
  } catch (error) {
    console.error("Error fetching GP fund requests:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Create Income and link to GP's income array
exports.createIncome = async (req, res) => {
  try {
    const { category, amount, description, document } = req.body;
    const newIncome = new Income({
      category,
      amount,
      description,
      document,
    });

    const savedIncome = await newIncome.save();

    // Find GP by the logged-in user ID and push the new income ID into the GP's income array
    await Grampanchayat.findByIdAndUpdate(
      req.user.id,
      { $push: { income: savedIncome._id } },
      { new: true }
    );

    res
      .status(201)
      .json({ message: "Income created successfully", data: savedIncome });
  } catch (error) {
    res.status(500).json({ message: "Error creating income", error });
  }
};

// Create Expenditure and link to GP's expenditure array
exports.createExpenditure = async (req, res) => {
  try {
    const { category, amount, description, document } = req.body;
    const newExpenditure = new Expenditure({
      category,
      amount,
      description,
      document,
    });

    const savedExpenditure = await newExpenditure.save();

    // Find GP by the logged-in user ID and push the new expenditure ID into the GP's expenditure array
    await Grampanchayat.findByIdAndUpdate(
      req.user.id,
      { $push: { expenditure: savedExpenditure._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Expenditure created successfully",
      data: savedExpenditure,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating expenditure", error });
  }
};

// Get a list of all incomes and expenditures for the logged-in GP
exports.getIncomeExpenditureList = async (req, res) => {
  try {
    const gp = await Grampanchayat.findById(req.user.id)
      .populate("income")
      .populate("expenditure")
      .select("income expenditure");

    if (!gp) {
      return res.status(404).json({ message: "GP not found" });
    }

    // Merge income and expenditure arrays and sort by creation date in descending order
    const combinedList = [
      ...gp.income.map((income) => ({ ...income.toObject(), type: "Income" })),
      ...gp.expenditure.map((expenditure) => ({
        ...expenditure.toObject(),
        type: "Expenditure",
      })),
    ];

    combinedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ data: combinedList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving income and expenditure list", error });
  }
};

// Get all notifications for the logged-in GP
exports.getGpNotifications = async (req, res) => {
  try {
    const gpId = req.user.id; // Assuming the authenticated GP ID comes from req.user

    // Find the GP and populate the notifications (alerts)
    const gp = await Grampanchayat.findById(gpId).populate({
      path: "alert",
      model: "PhedAnnouncement", // Ensure the alert references PhedAnnouncement
    });

    if (!gp) {
      return res.status(404).json({ success: false, message: "GP not found" });
    }

    res.status(200).json({
      success: true,
      data: gp.alert, // Return populated notifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Create an announcement for GP
exports.createGpAnnouncement = async (req, res) => {
  try {
    const gpId = req.user.id; // Assuming GP ID comes from authenticated user
    const { category, message } = req.body;

    if (!category || !message) {
      return res.status(400).json({
        success: false,
        message: "Category and message are required.",
      });
    }

    // Create a new announcement
    const newAnnouncement = new GpAnnouncement({
      category,
      message,
      createdAt: Date.now(),
    });

    await newAnnouncement.save();

    // Update the GP's announcement array with the new announcement's ID
    const gp = await Grampanchayat.findByIdAndUpdate(
      gpId,
      { $push: { announcement: newAnnouncement._id } },
      { new: true }
    );

    if (!gp) {
      return res
        .status(404)
        .json({ success: false, message: "Gram Panchayat not found." });
    }

    // Push the announcement ID to the notification array of all users in the GP's userList
    await User.updateMany(
      { _id: { $in: gp.userList } },
      { $push: { notification: newAnnouncement._id } }
    );

    res.status(201).json({
      success: true,
      message: "Announcement created successfully.",
      data: newAnnouncement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get sorted announcements for GP
exports.getGpAnnouncements = async (req, res) => {
  try {
    const gpId = req.user.id; // Get the GP ID from the authenticated user

    // Find GP and populate announcements
    const gp = await Grampanchayat.findById(gpId).populate({
      path: "announcement",
      model: "GpAnnouncement",
      options: { sort: { createdAt: -1 } }, // Sorting by newest first
    });

    if (!gp) {
      return res.status(404).json({ message: "GP not found" });
    }

    // Return announcements sorted by createdAt (newest first)
    res.status(200).json({
      success: true,
      data: gp.announcement,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete an announcement
exports.deleteGpAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const gpId = req.user.id; // Get the GP ID from the authenticated user

    if (!announcementId) {
      return res.status(400).json({ message: "Announcement ID is required" });
    }

    // Delete the announcement
    const deletedAnnouncement = await GpAnnouncement.findByIdAndDelete(
      announcementId
    );

    if (!deletedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Remove the announcement reference from the GP
    await Grampanchayat.findByIdAndUpdate(gpId, {
      $pull: { announcement: announcementId },
    });

    // Remove the announcement reference from all users in the GP's userList
    await User.updateMany(
      { _id: { $in: deletedAnnouncement.userList } },
      { $pull: { notification: announcementId } }
    );

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Create a GP Complaint
exports.createGpComplaint = async (req, res) => {
  try {
    const gpId = req.user.id; // Assuming the GP's ID comes from the authenticated user
    const { category, message } = req.body;

    // Create a new GP Complaint
    const newComplaint = new GpComplaint({
      category,
      message,
      status: false, // Default status is false (pending)
    });

    // Save the complaint to the database
    const savedComplaint = await newComplaint.save();

    // Update the GP's complaint array
    await Grampanchayat.findByIdAndUpdate(
      gpId,
      { $push: { complaint: savedComplaint._id } },
      { new: true }
    );

    // Find all PHEDs and push the complaint ID to their alerts array
    await Phed.updateMany(
      { gpList: gpId },
      { $push: { alert: savedComplaint._id } }
    );

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: savedComplaint,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Edit a GP Complaint
exports.editGpComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const updates = req.body;

    // Find and update the complaint
    const updatedComplaint = await GpComplaint.findByIdAndUpdate(
      complaintId,
      { $set: updates, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: updatedComplaint,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete a GP Complaint
exports.deleteGpComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Find and delete the complaint
    const deletedComplaint = await GpComplaint.findByIdAndDelete(complaintId);

    if (!deletedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Remove the complaint from the GP's complaint array
    await Grampanchayat.updateOne(
      { complaint: complaintId },
      { $pull: { complaint: complaintId } }
    );

    // Remove the complaint reference from all PHEDs' alert arrays
    await Phed.updateMany(
      { alert: complaintId },
      { $pull: { alert: complaintId } }
    );

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
