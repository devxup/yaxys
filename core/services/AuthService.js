const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
  encryptPassword (password) {
    return bcrypt.hashSync(password, saltRounds);
  },

  checkPassword (password, passwordHash) {
    return bcrypt.compareSync(password, passwordHash);
  }
}