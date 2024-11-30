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
    console.log('req.body: ', req.body);

    if (!userType || (!id && !email) || !password) {
      return res.status(400).json({ message: "Missing required fields. Please check your input." });
    }

  

    if (!userModels[userType]) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const Model = userModels[userType];
    console.log('Model: ', Model);
    const user = await Model.findOne({ $or: [{ _id: id }, { email }] });

  

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the password
    // const isMatch = await bcrypt.compare(password, user.password);

    console.log('Plaintext password:', password);
    console.log('Hashed password from database:', user.password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Do passwords match?', isMatch);
    

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
          profilePicture: user.profilePicture,
          contact: user.contact,
        },
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
