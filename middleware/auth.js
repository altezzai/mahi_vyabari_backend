const jwt = require("jsonwebtoken");
const { TOKEN_KEY } = process.env;

const userAuth = async (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.cookies.token;
  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "An authentication token is required" });
  }
  try {
    const decodedToken = await jwt.verify(token, TOKEN_KEY);
    if (decodedToken.userId) {
      req.body.userId = decodedToken.userId;
    } else {
      res
        .status(401)
        .json({ success: false, message: "Not Authorized, Login Again" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = userAuth;
