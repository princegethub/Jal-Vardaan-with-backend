 const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Phed } = require("../model/phedModel");
const { Grampanchayat } = require("../model/gpModel");
const { User } = require("../model/userModel");


const userModels = {
  PHED: Phed,
  GP: Grampanchayat,
  USER: User,
};

const loginUser = async (req, res) => {
  try {
    const { userType, id, email, password } = req.body;

    // Check if all required fields are present
    if (!userType && !id && !email && !password) {
      return res.status(400).json({ message: "Missing required fields. Please check your input." });
    }

    if (!userModels[userType]) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const Model = userModels[userType];
    let query = {};

    // Build the query based on userType
    if (userType === "PHED") {
      query = { phedId: id };
    } else if (userType === "GP") {
      query = { lgdCode: id };
    } else if (userType === "USER") {
      query = { consumerId: id };
    }
  

    // Query the database based on the constructed query
    const user = await Model.findOne({ $or: [query, { email }] });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Prepare the ID to send in the response based on the role
    let responseId;
    if (user.role === "PHED") {
      responseId = user.phedId;
    } else if (user.role === "GP") {
      responseId = user.grampanchayatId;
    } else if (user.role === "USER") {
      responseId = user.consumerId;
    }

    // Send response with user data and token
    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.name}`,
      user: {
        id: responseId, // send the appropriate ID based on the role
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        contact: user.contact,
      },
      token: token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const logout = async (req, res) => {
  try {
    // Remove JWT token from the cookie
    res.clearCookie("token");
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginUser, logout
};
