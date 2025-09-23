import jwt from 'jsonwebtoken';

export const generateToken = (req, res, userId) => {
  // Re-enable user-controlled remember flag (as requested)
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: req.body.remember ? 365 * 24 + 'h' : '24h'
  });

  // Restore cookie maxAge based on remember flag
  res.cookie('jwt', token, {
    httpOnly: true,
    // For cross-site cookies (frontend on different origin), set sameSite to 'none' and secure true
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.CROSS_SITE_COOKIES === 'true' ? 'none' : 'strict',
    maxAge: req.body.remember ? 365 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  });
};
