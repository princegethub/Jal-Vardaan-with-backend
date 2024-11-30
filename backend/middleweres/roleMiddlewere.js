// roleMiddleware.js
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    // Assuming the JWT token is stored in a cookie called 'token'
    const token = req.cookies.token || req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check if the user's role is in the allowed roles array
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied. You do not have permission." });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
};

module.exports = roleCheck;
