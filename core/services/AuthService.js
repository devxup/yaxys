const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
  encryptPassword (password) {
    return bcrypt.hashSync(String(password), saltRounds);
  },

  checkPassword (password, passwordHash) {
    return bcrypt.compareSync(String(password), String(passwordHash));
  }
}