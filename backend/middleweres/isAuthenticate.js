const jwt = require('jsonwebtoken');

const protectRoute = (req, res, next) => {
  try {
    // Get token from headers
    // const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    const token  = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'User not authenticated. Authorization denied.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    req.user = decoded;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error in token verification:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = {
  protectRoute,
};
