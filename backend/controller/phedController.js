const {Phed }= require("../model/phedModel");
const bcrypt = require("bcryptjs");

const registerPhed = async (req, res) => {
  try {
    const { name, contact, email, phedId, password, role = "PHED" } = req.body; // Default role is 'PHED'

    if (!name || !contact || !email || !phedId || !password) {
      return res.status(400).json({ msg: "Please fill in all fields." });
    }

    // Check if PHED ID, contact, or email already exists
    const existingPhed = await Phed.findOne({
      $or: [{ phedId }, { contact }, { email }],
    });

    if (existingPhed) {
      return res.status(400).json({
        success: false,
        message: "PHED ID, contact number, or email already exists.",
      });
    }

    // Create new PHED user
    const newPhed = new Phed({
      name,
      contact,
      email,
      phedId,
      password,
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

module.exports = {
  registerPhed, // Export the register controller function
};
