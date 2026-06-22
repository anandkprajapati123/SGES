const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode the token to extract the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sges_secret_key_2026');

      // Attach user ID and email to request
      req.user = {
        id: decoded.id,
        email: decoded.email
      };

      next();
    } catch (error) {
      console.error('Authentication Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
