const AuthService = require ("../core/services/AuthService.js");
const bcrypt = require("bcrypt");

describe ("AuthService", () => {
  it ("Password encrypt and check", () =>{
    let passwords = ["rrr", "fdgfdg", 1234];
    for (let password of passwords) {
      let hash = AuthService.encryptPassword(password);
      expect (AuthService.checkPassword(password, hash)).toBeTruthy();
    }
  })
})