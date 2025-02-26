const bcrypt = require("bcrypt");

module.exports = {
  hashPassword: async (plainPassword) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log("Hashed Password:", hashedPassword);
    return hashedPassword;
  },
};
