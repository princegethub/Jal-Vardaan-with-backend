const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    // Extract token from the Authorization header
    const authHeader = req.headers.authorization;

    // Ensure Authorization header is present
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization denied. Token missing or invalid.' });
    }

    // Extract the token (Remove "Bearer " from the header value)
    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    req.user = decoded;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error in token verification:', error);
    return res.status(401).json({ message: 'Token is not valid or expired' });
  }
};

module.exports = {
  authenticate,
};
