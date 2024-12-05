const { Phed, PhedAnnouncement } = require("../model/phedModel");



const {
  Grampanchayat,
  Asset,
  Inventory,
  GpComplaint,
} = require("../model/gpModel");
const { v4: uuidv4 } = require("uuid");

const bcrypt = require("bcryptjs");

const registerPhed = async (req, res) => {
  try {
    const { name, contact, email, phedId, password, role = "PHED" } = req.body; // Default role is 'PHED'

    if (!name || !contact || !email || !phedId || !password) {
      return res.status(400).json({ msg: "Please fill in all fields." });
    }

    // Check if PHED ID, contact, or email already exists
    const existingPhed = await Phed.findOne({
      $or: [{ phedId }, { email }],
    });

    if (existingPhed) {
      return res.status(400).json({
        success: false,
        message: "PHED ID, contact number, or email already exists.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // Create new PHED user
    const newPhed = new Phed({
      name,
      contact,
      email,
      phedId,
      password: hashPassword,
      role, // Assign role from request body or default to 'PHED'
    });

    await newPhed.save();

    return res.status(201).json({
      success: true,
      message: "PHED user registered successfully.",
      data: {
        id: newPhed._id,
        name: newPhed.name,
        contact: newPhed.contact,
        email: newPhed.email,
        phedId: newPhed.phedId,
        role: newPhed.role,
      },
    });
  } catch (error) {
    console.error("Error in PHED Registration:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

const updatePhed = async (req, res) => {
  try {
    const phedId = req.user.id; // Extract phedId from the route parameter
    const { name, profilePicture, email, contact } = req.body; // Extract fields from the request body

    // Validate that at least one field is provided for update
    if (!name && !profilePicture && !email && !contact) {
      return res
        .status(400)
        .json({ message: "At least one field must be provided to update." });
    }

    // Find the Phed user by `_id`
    const existingPhed = await Phed.findById(phedId);

    if (!existingPhed) {
      return res.status(404).json({ message: "PHED user not found." });
    }

    // Check if the new email is already in use by another user
    if (email && email !== existingPhed.email) {
      const emailExists = await Phed.findOne({ email });
      console.log("emailExists: ", emailExists);
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "Email is already in use by another user." });
      }
    }

    // Update only provided fields
    if (name) existingPhed.name = name;
    if (profilePicture) existingPhed.profilePicture = profilePicture;
    if (email) existingPhed.email = email;
    if (contact) existingPhed.contact = contact;

    // Save the updated Phed user
    const updatedPhed = await existingPhed.save();

    return res.status(200).json({
      success: true,
      message: "PHED user updated successfully.",
      data: updatedPhed,
    });
  } catch (error) {
    console.error("Error in updating PHED user:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const getGpList = async (req, res) => {
  try {
    const { id } = req.user; // Extract `id` from the route parameter

    // Find the PHED user and populate the gpList, sorted by createdAt descending
    const phed = await Phed.findOne({ _id: id }).populate({
      path: "gpList",
      options: { sort: { createdAt: -1 } }, // Sort by createdAt in descending order
    });

    if (!phed) {
      return res.status(404).json({ message: "PHED user not found." });
    }

    return res.status(200).json({
      success: true,
      message: "GP list fetched successfully.",
      data: phed.gpList, // Return the populated list of GPs
    });
  } catch (error) {
    console.error("Error fetching GP list:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};


const getGpListWithAssets = async (req, res) => {
  try {
    // Assuming you have a way to identify the logged-in PHED user
    const phedId = req.user.id; // Example: Assuming user data is attached to req.user

    // Find the PHED user and populate the gpList with assets
    const phed = await Phed.findOne({ _id: phedId })
      .populate({
        path: "gpList",
        populate: {
          path: "assets",
          model: "Asset",
        },
      })
      .exec();

    if (!phed) {
      return res.status(404).json({ message: "PHED user not found" });
    }

    res.status(200).json({
      success: true,
      message: "GP list with assets retrieved successfully",
      data: phed.gpList,
    });
  } catch (error) {
    console.error("Error fetching GP list with assets:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getGpListWithAssetsAndInventory = async (req, res) => {
  try {
    // Assuming you have a way to identify the logged-in PHED user
    const phedId = req.user.id; // Example: Assuming user data is attached to req.user

    // Find the PHED user and populate the gpList with assets and inventory
    const phed = await Phed.findOne({ _id: phedId })
      .populate({
        path: "gpList",
        populate: [
          {
            path: "assets",
            model: "Asset",
          },
          {
            path: "inventory",
            model: "Inventory",
          },
        ],
      })
      .exec();

    if (!phed) {
      return res.status(404).json({ message: "PHED user not found" });
    }

    res.status(200).json({
      success: true,
      message: "GP list with assets and inventory retrieved successfully",
      data: phed.gpList,
    });
  } catch (error) {
    console.error("Error fetching GP list with assets and inventory:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getGpInventoryList = async (req, res) => {
  try {
    const phedId = req.user.id; // Get the logged-in PHED user ID

    // Find the PHED user and populate the gpList with their inventory
    const phed = await Phed.findOne({ _id: phedId })
      .populate({
        path: "gpList",
        populate: {
          path: "inventory",
          model: "Inventory",
        },
      })
      .exec();

    if (!phed) {
      return res.status(404).json({ message: "PHED user not found" });
    }

    res.status(200).json({
      success: true,
      message: "GP list with inventory data retrieved successfully",
      data: phed.gpList,
    });
  } catch (error) {
    console.error("Error fetching GP inventory data:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Create a new announcement


// Create a new PHED Announcement and notify GPs
const createPhedAnnouncement = async (req, res) => {
  try {
    const phedId = req.user.id; // Assuming phedId comes from logged-in PHED user
    const { category, message } = req.body;

    // Create the new announcement
    const newAnnouncement = new PhedAnnouncement({ category, message });
    const savedAnnouncement = await newAnnouncement.save();

    // Find the PHED to update and get its gpList
    const phed = await Phed.findById(phedId).select("gpList announcement");

    if (!phed) {
      return res.status(404).json({ message: "PHED not found" });
    }

    // Update the PHED's announcements array
    phed.announcement.push(savedAnnouncement._id);
    await phed.save();

    // Notify all GPs in the PHED's gpList
    await Grampanchayat.updateMany(
      { _id: { $in: phed.gpList } }, // Match all GPs in the PHED's gpList
      { $push: { notification: savedAnnouncement._id } } // Push the announcement ID to their alert array
    );

    res.status(201).json({
      success: true,
      message: "Announcement created and GPs notified",
      data: savedAnnouncement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// Get all announcements for a PHED
const getPhedAnnouncements = async (req, res) => {
  try {
    const phedId = req.user.id; // Assuming phedId comes from logged-in PHED user

    const phed = await Phed.findOne({ _id: phedId }).populate({
      path: "announcement",
      model: "PhedAnnouncement",
    });

    if (!phed) {
      return res.status(404).json({ message: "PHED not found" });
    }

    res.status(200).json({
      success: true,
      data: phed.announcement,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete an announcement
const deletePhedAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    if (!announcementId) {
      return res.status(400).json({ message: "Announcement ID is required" });
    }

    // Delete the announcement
    const deletedAnnouncement = await PhedAnnouncement.findByIdAndDelete(announcementId);

    if (!deletedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Remove the announcement reference from the PHED
    await Phed.findOneAndUpdate(
      { announcement: announcementId },
      { $pull: { announcement: announcementId } }
    );

    // Remove the announcement reference from all GPs' alert arrays
    await Grampanchayat.updateMany(
      { notification: announcementId },
      { $pull: { alert: announcementId } }
    );

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully and GPs updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getFinanceOverview = async (req, res) => {
  try {
    const phedId = req.user.id; // Assuming logged-in PHED's ID
    const { gpId } = req.params; // GP ID passed in params

    // Fetch GP details along with its income and expenditure
    const gpDetails = await Grampanchayat.findById(gpId)
      .populate("income") // Populate income references
      .populate("expenditure") // Populate expenditure references
      .exec();

    if (!gpDetails) {
      return res.status(404).json({ message: "GP not found" });
    }

    // Construct the finance overview data
    const financeOverviewData = {
      gpId: gpDetails._id,
      income: gpDetails.income, // Array of Income documents
      expenditure: gpDetails.expenditure, // Array of Expenditure documents
    };

    // Update the PHED's financeOverview field
    const updatedPhed = await Phed.findOneAndUpdate(
      { _id: phedId },
      {
        $push: { financeOverview: financeOverviewData },
      },
      { new: true }
    );

    if (!updatedPhed) {
      return res.status(404).json({ message: "PHED not found" });
    }

    res.status(200).json({
      success: true,
      message: "Finance Overview updated successfully",
      data: updatedPhed.financeOverview,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
const addGp = async (req, res) => {
  try {
    const phedId = req.user.id; // Ensure the request is from a PHED user


    const {
      state,
      district,
      villageName,
      lgdCode,
      name,
      aadhar,
      contact,
      email, // Added the email field

      userType = "GP",
    } = req.body;

    if (!phedId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Validate required fields
    if (
      !state &&
      !district &&
      !villageName &&
      !lgdCode &&
      !name &&
      !aadhar &&
      !contact 
    
    ) {
      return res.status(400).json({ message: "All fields are required except email." });
    }

    // Check if GP with the same LGD Code, Aadhar, or email exists
    const existingGp = await Grampanchayat.findOne({
      $or: [
        { lgdCode: lgdCode },
        { aadhar: aadhar },
        { email: email } // Check for email duplicates
      ],
    });
    if (existingGp) {
      const duplicateFields = [];
      if (existingGp.lgdCode === lgdCode) duplicateFields.push('LGD Code');
      if (existingGp.aadhar === aadhar) duplicateFields.push('Aadhar');
      if (existingGp.email === email) duplicateFields.push('Email');

      return res.status(400).json({
        message: `GP with the same ${duplicateFields.join(', ')} already exists.`,
      });
    }

    // Current date ko format karte hain (yyMMdd)
    const datePart =
      new Date().getFullYear().toString().slice(-2) +
      ("0" + (new Date().getMonth() + 1)).slice(-2) +
      ("0" + new Date().getDate()).slice(-2);

    // Random 4-digit number generate karte hain
    const randomPart = Math.floor(1000 + Math.random() * 9000);

    // Final GP ID banate hain
    const grampanchayatId = `GP${datePart}${randomPart}`;

    const password = await bcrypt.hash("test@123", 10);

    // Create new GP with a unique `grampanchayatId`
    const newGp = new Grampanchayat({
      state,
      district,
      villageName,
      lgdCode,
      name,
      aadhar,
      contact,
      grampanchayatId,
      email, // Added the email field
      password,
      createdBy: phedId, // Track which PHED user created this GP
    });

    // Save the new GP to the database
    await newGp.save();

    // Add the new GP's ID to the `phed` document
    const phed = await Phed.findOne({ _id: phedId });
    if (phed) {
      await phed.updateOne({ $push: { gpList: newGp._id } }); // Push the new GP's ID into the `gpList` array
    }

    res.status(201).json({ message: "GP added successfully", gp: newGp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const updateGp = async (req, res) => {
  try {
    const  phedId  = req.user.id; // Ensure the request is from a PHED user
    const { id } = req.params;
    const { villageName, name, contact, lgdCode, aadhar } = req.body;

    if (!phedId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // if (!villageName || !name || !contact || !lgdCode || !aadhar) {
    //   return res.status(400).json({ message: "All fields are required for updating." });
    // }

    // Find and update GP
    const updatedGp = await Grampanchayat.findByIdAndUpdate(
      {_id:id},
      { villageName, name, contact, lgdCode, aadhar },
      { new: true }
    );

    if (!updatedGp) {
      return res.status(404).json({ message: "GP not found." });
    }

    res.status(200).json({ message: "GP updated successfully", gp: updatedGp });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const deleteGp = async (req, res) => {
  try {
    const  phedId  = req.user.id; // Ensure the request is from a PHED user
    const { gpId } = req.params;

    if (!phedId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Find and delete GP
    const deletedGp = await Grampanchayat.findByIdAndDelete(gpId);

    if (!deletedGp) {
      return res.status(404).json({ message: "GP not found." });
    }

    res.status(200).json({ message: "GP deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const viewGpDetails = async (req, res) => {
  try {
    const  phedId  = req.user.id; // Ensure the request is from a PHED user

    if (!phedId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Fetch GP list
    const gps = await Grampanchayat.find().select(
      "name lgdCode state district aadhar villageName contact"
    );

    res.status(200).json({ message: "GPs fetched successfully", gps });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
const viewSingleGpDetails = async (req, res) => {
  try {

    const { gpId } = req.params;

    // Fetch GP list
    const gps = await Grampanchayat.findOne({_id: gpId}).select(
      "name lgdCode aadhar villageName contact"
    );
    console.log(gps);
    
    res.status(200).json({ message: "GPs fetched successfully", data:gps });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};



const phedProfile = async (req, res) => {
  try {
    const phedId = req.user.id; // PHED user ID from the authenticated token

    if (!phedId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Fetch PHED user details
    const phedProfile = await Phed.findById(phedId).select(
      "name email contact role profilePicture "
    );

    if (!phedProfile) {
      return res.status(404).json({ message: "PHED profile not found." });
    }

    res.status(200).json({
      message: "PHED profile fetched successfully.",
      profile: phedProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};







// Add Asset
const addAsset = async (req, res) => {
  try {
    const { gpLgdCode, assetName, assetCategory, AssetQuantity } = req.body;

    // Create new asset
    const newAsset = new Asset({
      gpLgdCode,
      assetName,
      assetCategory,
      AssetQuantity,
    });

    
    // Update PHED model
    await Phed.findByIdAndUpdate(req.user.id, {
      $push: { phedAssest: savedAsset._id },
    });
    
    // Update GP model
    const gp = await Grampanchayat.findOneAndUpdate(
      { lgdCode: gpLgdCode },
      { $push: { assets: savedAsset._id } },
      { new: true }
    );
    
    if (!gp) {
      return res.status(404).json({ message: "GP not found" });
    }
    const savedAsset = await newAsset.save();
    
    res.status(201).json({
      message: "Asset added successfully",
      asset: savedAsset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding asset", error });
  }
};

// Edit Asset
const updateAsset = async (req, res) => {
  try {
    const  id  = req.params.assetId;

    const { assetName, assetCategory, AssetQuantity } = req.body;

    const updatedAsset = await Asset.findByIdAndUpdate(
      id,
      { assetName, assetCategory, AssetQuantity },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json({
      message: "Asset updated successfully",
      asset: updatedAsset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating asset", error });
  }
};

// Delete Asset
const deleteAsset = async (req, res) => {
  try {
    const  id  = req.params.assetId;

    const asset = await Asset.findByIdAndDelete(id);

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Remove from PHED model
    await Phed.findByIdAndUpdate(req.user.id, {
      $pull: { phedAssest: asset._id },
    });

    // Remove from GP model
    await Grampanchayat.findOneAndUpdate(
      { lgdCode: asset.gpLgdCode },
      { $pull: { assets: asset._id } }
    );

    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting asset", error });
  }
};






// Add Inventory
const addInventory = async (req, res) => {
  try {
    const { gpLgdCode, inventoryName, inventoryCategory, inventoryQuantity } = req.body;

    // Create a new inventory entry
    const newInventory = await Inventory.create({
      gpLgdCode,
      inventoryName,
      inventoryCategory,
      inventoryQuantity,
    });

    // Add inventory to the respective GP
    const gp = await Grampanchayat.findOneAndUpdate(
      { lgdCode: gpLgdCode },
      { $push: { inventory: newInventory._id } },
      { new: true }
    );

    // Add inventory to the PHED inventory list
    const phed = await Phed.findByIdAndUpdate(
      req.user.id, // Assuming `req.user.id` contains the authenticated PHED's ID
      { $push: { phedInventory: newInventory._id } },
      { new: true }
    );

    if (!gp) return res.status(404).json({ message: "GP not found" });
    if (!phed) return res.status(404).json({ message: "PHED not found" });

    res.status(201).json({ message: "Inventory added successfully", inventory: newInventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding inventory", error: error.message });
  }
};

// Update Inventory
const updateInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { inventoryName, inventoryCategory, inventoryQuantity } = req.body;

    const updatedInventory = await Inventory.findByIdAndUpdate(
      inventoryId,
      { inventoryName, inventoryCategory, inventoryQuantity },
      { new: true }
    );

    if (!updatedInventory) return res.status(404).json({ message: "Inventory not found" });

    res.status(200).json({ message: "Inventory updated successfully", inventory: updatedInventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating inventory", error: error.message });
  }
};

// Delete Inventory
const deleteInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    // Remove inventory from the database
    const deletedInventory = await Inventory.findByIdAndDelete(inventoryId);
    if (!deletedInventory) return res.status(404).json({ message: "Inventory not found" });

    // Remove inventory reference from GP and PHED
    await Grampanchayat.updateOne({ inventory: inventoryId }, { $pull: { inventory: inventoryId } });
    await Phed.updateOne({ phedInventory: inventoryId }, { $pull: { phedInventory: inventoryId } });

    res.status(200).json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting inventory", error: error.message });
  }
};





const getPhedAssetOverview = async (req, res) => {
  try {
    const phed = await Phed.findById(req.user.id).populate("phedAssest");

    if (!phed) {
      return res.status(404).json({ message: "PHED not found" });
    }

    const grampanchayats = await Grampanchayat.find({}, "name grampanchayatId assets")
      .populate("assets", "assetName inventoryQuantity");

    let totalAssets = {};
    let gpDetails = [];

    grampanchayats.forEach((gp) => {
      let gpAssetSummary = {
        gpName: gp.name,
        grampanchayatId: gp.grampanchayatId,
        assets: [],
        totalQuantity: 0,
      };

      gp.assets.forEach((asset) => {
        const { assetName, inventoryQuantity } = asset;

        gpAssetSummary.assets.push({ assetName, quantity: inventoryQuantity });
        gpAssetSummary.totalQuantity += inventoryQuantity;

        if (!totalAssets[assetName]) {
          totalAssets[assetName] = { totalQuantity: 0 };
        }
        totalAssets[assetName].totalQuantity += inventoryQuantity;
      });

      gpDetails.push(gpAssetSummary);
    });

    res.status(200).json({
      phedName: phed.name,
      totalAssets,
      gpDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching PHED asset overview", error: error.message });
  }
};



const getPhedInventoryOverview = async (req, res) => {
  try {
    // Fetch PHED's inventory details
    const phed = await Phed.findById(req.user.id).populate("phedInventory");

    if (!phed) {
      return res.status(404).json({ message: "PHED not found" });
    }

    // Fetch all Grampanchayats with their inventory data
    const grampanchayats = await Grampanchayat.find({}, "name grampanchayatId inventory")
      .populate("inventory", "inventoryName inventoryQuantity");

    let totalInventories = {};
    let gpDetails = [];

    grampanchayats.forEach((gp) => {
      let gpInventorySummary = {
        gpName: gp.name,
        grampanchayatId: gp.grampanchayatId,
        inventories: [],
        totalQuantity: 0,
      };

      gp.inventory.forEach((inventory) => {
        const { inventoryName, inventoryQuantity } = inventory;

        // Add inventory details to the GP's summary
        gpInventorySummary.inventories.push({ inventoryName, quantity: inventoryQuantity });
        gpInventorySummary.totalQuantity += inventoryQuantity;

        // Update the totalInventories summary
        if (!totalInventories[inventoryName]) {
          totalInventories[inventoryName] = { totalQuantity: 0 };
        }
        totalInventories[inventoryName].totalQuantity += inventoryQuantity;
      });

      gpDetails.push(gpInventorySummary);
    });

    // Prepare the response
    res.status(200).json({
      phedName: phed.name,
      totalInventories,
      gpDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching PHED inventory overview", error: error.message });
  }
};

const getPhedFundRequests = async (req, res) => {
  try {
    const phed = await Phed.findOne().populate("requestFund");
    if (!phed) {
      return res.status(404).json({ message: "PHED not found." });
    }

    res.status(200).json({ fundRequests: phed.requestFund });
  } catch (error) {
    console.error("Error fetching PHED fund requests:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
// Get all alerts for the logged-in PHED
const getPhedAlerts = async (req, res) => {
  try {
    const phedId = req.user.id; // Assuming the PHED's ID comes from the authenticated user

    // Find the PHED and populate the alert field with the actual complaint data
    const phed = await Phed.findById(phedId).populate({
      path: "alert",
      model: "GpComplaint",
    });

    if (!phed) {
      return res.status(404).json({ message: "PHED not found" });
    }

    res.status(200).json({
      success: true,
      data: phed.alert,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


module.exports = {
  registerPhed,
  updatePhed, // Export the register controller function
  getGpList, // Export the getGpList controller function
  getGpListWithAssets,
  getGpListWithAssetsAndInventory,
  getGpInventoryList,
  
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
  addInventory, updateInventory, deleteInventory ,getPhedAssetOverview,getPhedInventoryOverview, getPhedFundRequests, getPhedAlerts,
  viewSingleGpDetails
};
