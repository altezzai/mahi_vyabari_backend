const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json({
      status: "error",
      message: options.message,
      limit: options.max,
      retryAfter: Math.ceil(options.windowMs / 1000) + " seconds",
    });
  },
  message: "Too many attempts. Please try again later.",
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body?.phone || req.ip,
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json({
      status: "error",
      message: options.message,
      limit: options.max,
      retryAfter: Math.ceil(options.windowMs / 1000) + " seconds",
    });
  },
  message: "Too many OTP requests. Please wait 10 minutes.",
});

const couponRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json({
      status: "error",
      message: options.message,
      limit: options.max,
      retryAfter: Math.ceil(options.windowMs / 1000) + " seconds",
    });
  },
  message: "Too many coupon book requests for today.",
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json({
      status: "error",
      message: options.message,
      limit: options.max,
      retryAfter: Math.ceil(options.windowMs / 1000) + " seconds",
    });
  },
  message: "Too many failed login attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, otpLimiter, couponRequestLimiter, authLimiter };
