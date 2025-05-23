const bcrypt = require("bcrypt");

module.exports = {
  hashData: async (plainData) => {
    const saltRounds = 10;
    const hashedData = await bcrypt.hash(plainData, saltRounds);
    return hashedData;
  },
};
