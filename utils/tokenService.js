const jwt = require("jsonwebtoken");

const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} = process.env;
const generateAccessToken = async (
  tokenData,
  tokenKey = ACCESS_TOKEN_SECRET,
  expiresIn = ACCESS_TOKEN_EXPIRY
) => {
  try {
    const accessToken = await jwt.sign(tokenData, tokenKey, { expiresIn });
    console.log(accessToken);
    return accessToken;
  } catch (error) {
    throw error;
  }
};

const generateRefreshToken = async (
  userId,
  tokenVersion,
  tokenKey = REFRESH_TOKEN_SECRET,
  expiresIn = REFRESH_TOKEN_EXPIRY
) => {
  try {
    const refreshToken = jwt.sign({ id: userId, tokenVersion }, tokenKey, {
      expiresIn,
    });
    return refreshToken;
  } catch (error) {
    throw error;
  }
};

module.exports = { generateAccessToken, generateRefreshToken };
