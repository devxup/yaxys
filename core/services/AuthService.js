const bcrypt = require("bcrypt");
const config = require("config");

module.exports = {
  encryptPassword: password => bcrypt.hashSync(password, config.get("bcryptSaltRounds")),

  checkPassword: (password, passwordHash) => bcrypt.compareSync(password, passwordHash)
};
