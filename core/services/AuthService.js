const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = {

  OPERATOR_ATTRIBUTES_FOR_JWT: ["id", "email", "rights", "isAdministrator"],

  encryptPassword: password => bcrypt.hashSync(password, config.get("bcryptSaltRounds")),

  checkPassword: (password, passwordHash) => bcrypt.compareSync(password, passwordHash),

  getOperatorByCredentials: async (email, password) => {
    const operator = await yaxys.db.findOne("operator", {email}, {});
    if (operator && AuthService.checkPassword(password, operator.passwordHash)) {
      return operator;
    }
    throw new Error("No such operator or wrong password provided");
  },

  generateToken: operator => jwt.sign(
    _.pick(operator, ...AuthService.OPERATOR_ATTRIBUTES_FOR_JWT),
    config.get("jwt.secret"),
    {expiresIn: config.get("jwt.lifetime")}
  ),

  checkAndDecodeToken: (token) => {
    const result = jwt.verify(token, config.get("jwt.secret"));
    return _.omit(result, "iat");
  },

  checkRight: (operator, modelKey, right) =>
    !!(operator.isAdministrator || (operator.rights && operator.rights[modelKey.toLowerCase()] && operator.rights[modelKey.toLowerCase()].includes(right.toLowerCase())))
};
