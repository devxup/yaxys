const AuthService = require ("../core/services/AuthService.js");
const bcrypt = require("bcrypt");

describe ("AuthService", () => {
  it ("Password encrypt and check", () =>{
    let passwords = ["rrr", "fdgfdg", 1234, {a: "b"}];
    for (let password of passwords) {
      (typeof(password) === "string")
      ? expect (AuthService.checkPassword(password, AuthService.encryptPassword(password))).toBeTruthy()
      : expect ( () => {AuthService.encryptPassword(password)}).toThrow();
    }
  })
})