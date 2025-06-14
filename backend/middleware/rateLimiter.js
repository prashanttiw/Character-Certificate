const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes duration
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: "Too many OTP requests from your IP. Try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  otpLimiter
};
