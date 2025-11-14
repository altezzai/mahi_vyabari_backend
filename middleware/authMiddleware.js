const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = process.env;

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (decodedToken) {
      req.user = {};
      req.user.id = decodedToken.id;
      req.user.role = decodedToken.role;
      req.user.email = decodedToken.email;
      req.user.userName = decodedToken.userName;
      if (decodedToken.shopId) {
        req.user.shopId = decodedToken.shopId;
      }
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized, Login Again" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = userAuth;
