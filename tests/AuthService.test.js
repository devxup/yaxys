const AuthService = require ("../core/services/AuthService.js");

describe ("AuthService", () => {
  it ("Password encrypt and check", () =>{
    const passwords = ["rrr", "fdgfdg", 1234, {a: "b"}];
    for (let password of passwords) {
      (typeof(password) === "string")
      ? expect(AuthService.checkPassword(password, AuthService.encryptPassword(password))).toBeTruthy()
      : expect(() => {AuthService.encryptPassword(password)}).toThrow();
    }
  })
});
