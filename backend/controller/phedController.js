const { Phed, PhedAnnouncement } = require("../model/phedModel");
const { Grampanchayat , Asset  , Inventory , GpComplaint} = require("../model/gpModel");

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

    const hashPassword= await bcrypt.hash(password, 10);

    // Create new PHED user
    const newPhed = new Phed({
      name,
      contact,
      email,
      phedId,
      password : hashPassword,
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
    const { phedId } = req.params; // Extract phedId from the route parameter
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
      console.log('emailExists: ', emailExists);
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use by another user." });
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
  

    // Find the PHED user and populate the gpList
    const phed = await Phed.findOne({ _id: id }).populate("gpList");

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
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};




const getGpListWithAssets = async (req, res) => {
  try {
    // Assuming you have a way to identify the logged-in PHED user
    const phedId = req.user.id; // Example: Assuming user data is attached to req.user


    // Find the PHED user and populate the gpList with assets
    const phed = await Phed.findOne({ _id: phedId })
    .populate({
      path: 'gpList',
      populate: {
        path: 'assets',
        model: 'Asset',
      }
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
  const phedId = req.user.id;// Example: Assuming user data is attached to req.user
    
    // Find the PHED user and populate the gpList with assets and inventory
    const phed = await Phed.findOne({ _id: phedId })
      .populate({
        path: 'gpList',
        populate: [
          {
            path: 'assets',
            model: 'Asset',
          },
          {
            path: 'inventory',
            model: 'Inventory',
          }
        ]
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
  const phedId = req.user.id;// Get the logged-in PHED user ID

    // Find the PHED user and populate the gpList with their inventory
    const phed = await Phed.findOne({ _id: phedId })
      .populate({
        path: 'gpList',
        populate: {
          path: 'inventory',
          model: 'Inventory',
        }
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



// Ek specific GP ke alerts ko fetch karne ka function
const getAllAlertsForPhed = async (req, res) => {
  try {
  const phedId = req.user.id;// Assuming PHED ID is stored in `req.user`

    // Find PHED and populate GP complaints (alerts)
    const phed = await Phed.findOne({ _id: phedId }).populate({
      path: "gpList",
      populate: {
        path: "complaint", 
        model: "GpComplaint",
      },
    });

    if (!phed) {
      return res.status(404).json({ message: "PHED not found" });
    }

    // Extract complaints (alerts) from all GPs
    const allAlerts = phed.gpList.flatMap((gp) => gp.complaint);

    res.status(200).json({
      success: true,
      data: allAlerts, // All complaints (alerts) from all GPs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};







// Create a new announcement
const createPhedAnnouncement = async (req, res) => {
  try {
  const phedId = req.user.id;// Assuming phedId comes from logged-in PHED user
    const { gpId, message } = req.body;

    if (!gpId || !message) {
      return res.status(400).json({ message: "GP ID and message are required" });
    }

    // Create a new announcement
    const newAnnouncement = await PhedAnnouncement.create({
      gpId,
      message,
    });

    // Add the announcement reference to the PHED's announcement array
    const phed = await Phed.findOneAndUpdate(
      { _id: phedId },
      { $push: { announcement: newAnnouncement._id } },
      { new: true }
    );

    if (!phed) {
      return res.status(404).json({ message: "PHED not found" });
    }

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: newAnnouncement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all announcements for a PHED
const getPhedAnnouncements = async (req, res) => {
  try {
  const phedId = req.user.id;// Assuming phedId comes from logged-in PHED user

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
    res.status(500).json({ message: "Internal Server Error", error: error.message });
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
    const deletedAnnouncement = await PhedAnnouncement.findByIdAndDelete(
      announcementId
    );

    if (!deletedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Remove the announcement reference from the PHED
    await Phed.findOneAndUpdate(
      { announcement: announcementId },
      { $pull: { announcement: announcementId } }
    );

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const getFinanceOverview = async (req, res) => {
  try {
  const phedId = req.user.id;// Assuming logged-in PHED's ID
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
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const addGp = async (req, res) => {
  try {
    const { phedId } = req.user; // Ensure the request is from a PHED user
    const { state, district, villageName, lgdCode, name, aadhar, contact, email, password } = req.body;

    if (!phedId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Validate required fields
    if (!state || !district || !villageName || !lgdCode || !name || !aadhar || !contact || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if GP with the same LGD Code or Aadhar exists
    const existingGp = await Grampanchayat.findOne({ $or: [{ lgdCode }, { aadhar }] });
    if (existingGp) {
      return res.status(400).json({ message: "GP with this LGD Code or Aadhar already exists." });
    }

    // Create new GP
    const newGp = new Grampanchayat({
      state,
      district,
      villageName,
      lgdCode,
      name,
      aadhar,
      contact,
      email,
      password,
      createdBy: phedId, // Track which PHED user created this GP
    });

    await newGp.save();
    res.status(201).json({ message: "GP added successfully", gp: newGp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};




const updateGp = async (req, res) => {
  try {
    const { phedId } = req.user; // Ensure the request is from a PHED user
    const { gpId } = req.params;
    const { villageName, name, contact, lgdCode, aadhar } = req.body;

    if (!phedId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // if (!villageName || !name || !contact || !lgdCode || !aadhar) {
    //   return res.status(400).json({ message: "All fields are required for updating." });
    // }

    // Find and update GP
    const updatedGp = await Grampanchayat.findByIdAndUpdate(
      gpId,
      { villageName, name, contact, lgdCode, aadhar },
      { new: true }
    );

    if (!updatedGp) {
      return res.status(404).json({ message: "GP not found." });
    }

    res.status(200).json({ message: "GP updated successfully", gp: updatedGp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const deleteGp = async (req, res) => {
  try {
    const { phedId } = req.user; // Ensure the request is from a PHED user
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
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const viewGpDetails = async (req, res) => {
  try {
    const { phedId } = req.user; // Ensure the request is from a PHED user

    if (!phedId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Fetch GP list
    const gps = await Grampanchayat.find().select("name lgdCode state district villageName contact");

    res.status(200).json({ message: "GPs fetched successfully", gps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const phedProfile = async (req, res) => {
  try {
    const  phedId  = req.user.id; // PHED user ID from the authenticated token


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




  


module.exports = {
  registerPhed,
  updatePhed, // Export the register controller function
  getGpList, // Export the getGpList controller function
  getGpListWithAssets,
  getGpListWithAssetsAndInventory,
  getGpInventoryList,
  getAllAlertsForPhed,
  createPhedAnnouncement,
  getPhedAnnouncements,
  deletePhedAnnouncement,
  getFinanceOverview,
  addGp,
  updateGp,
  deleteGp,
  viewGpDetails,
  phedProfile
};
