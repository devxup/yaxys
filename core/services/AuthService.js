const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = {
  encryptPassword: password => bcrypt.hashSync(password, config.get("bcryptSaltRounds")),

  checkPassword: (password, passwordHash) => bcrypt.compareSync(password, passwordHash),

  getOperatorByCredentials: async (email, password) => {
    let operator = await yaxys.db.findOne ("operator", {email: email}, {});
    if (operator && AuthService.checkPassword(password, operator.passwordHash)) {
      return operator;
    }
    throw new Error("No such operator or wrong password provided");
  },

  generateToken: (operator) => jwt.sign(operator, config.get("jwt.secret"), {expiresIn: config.get("jwt.lifetime")}),

  checkAndDecodeToken: (token) => {
    let result = jwt.verify(token, config.get("jwt.secret"));
    delete(result.iat);
    delete(result.exp);
    return result;
  }
};
