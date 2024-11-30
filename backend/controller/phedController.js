const { Phed } = require("../model/phedModel");
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
    const phedId = req.user.phedId; // Example: Assuming user data is attached to req.user

    // Find the PHED user and populate the gpList with assets
    const phed = await Phed.findOne({ phedId })
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
    const phedId = req.user.phedId; // Example: Assuming user data is attached to req.user

    // Find the PHED user and populate the gpList with assets and inventory
    const phed = await Phed.findOne({ phedId })
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
    const phedId = req.user.phedId; // Get the logged-in PHED user ID

    // Find the PHED user and populate the gpList with their inventory
    const phed = await Phed.findOne({ phedId })
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
const getAlertsForGp = async (req, res) => {
  try {
    const gpId = req.params.gpId;

    // GP ko find karke uske alerts ko populate karte hain
    const gp = await Grampanchayat.findById(gpId).populate({
      path: 'alert',
      model: 'GpComplaint',
    });

    if (!gp) {
      return res.status(404).json({ message: 'GP nahi mila' });
    }

    // Response bhejte hain alerts ke data ke sath
    res.status(200).json({
      success: true,
      data: gp.alert, // Ye GP ke saare alerts ki details hogi
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};






module.exports = {
  registerPhed,
  updatePhed, // Export the register controller function
  getGpList, // Export the getGpList controller function
  getGpListWithAssets,
  getGpListWithAssetsAndInventory,
  getGpInventoryList,
  getAlertsForGp,
};
