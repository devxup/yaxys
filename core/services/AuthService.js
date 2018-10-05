const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
  encryptPassword (password) {
    /*(typeof (password) === "string")
    ? pass = password
    : */pass = toString(password);
    return bcrypt.hashSync(pass, saltRounds);
  },

  checkPassword (password, passwordHash) {
    /*(typeof (password) === "string")
      ? pass = password
      :*/ pass = toString(password);
    return bcrypt.compareSync(pass, passwordHash);
  }
}