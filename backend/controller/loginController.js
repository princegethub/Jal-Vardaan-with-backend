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

    if (!userType && (!id || !email) && !password) {
      return res.status(400).json({ message: "Missing required fields. Please check your input." });
    }

    // Check if the provided userType exists
    if (!userModels[userType]) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // Select the appropriate model based on userType
    const Model = userModels[userType];

    // Find user by either email or ID
    const user = await Model.findOne({ $or: [{ id }, { email }] });

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

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
      .json({
        success: true,
        message: `Welcome back ${user.name}`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          proifilePicture: user.profilePicture,
          contact: user.contact,
        },
      });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginUser,
};
