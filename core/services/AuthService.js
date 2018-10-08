const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = {
  encryptPassword: password => bcrypt.hashSync(password, config.get("bcryptSaltRounds")),

  checkPassword: (password, passwordHash) => bcrypt.compareSync(password, passwordHash),

  getOperatorByCredentials: async (email, password) => {
    const operator = await yaxys.db.findOne("operator", {email}, {});
    if (operator && AuthService.checkPassword(password, operator.passwordHash)) {
      return operator;
    }
    throw new Error("No such operator or wrong password provided");
  },

  generateToken: operator => jwt.sign(_.pick(operator, "id", "email"), config.get("jwt.secret"), {expiresIn: config.get("jwt.lifetime")}),

  checkAndDecodeToken: (token) => {
    const result = jwt.verify(token, config.get("jwt.secret"));
    return _.omit(result, "iat");
  }
};
