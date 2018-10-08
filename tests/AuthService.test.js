global.AuthService = require ("../core/services/AuthService.js");
global._ = require("lodash");

describe ("AuthService", () => {
  it("Password encrypt and check", () => {
    const passwords = ["rrr", "fdgfdg", 1234, {a: "b"}];
    for (let password of passwords) {
      (typeof(password) === "string")
      ? expect(AuthService.checkPassword(password, AuthService.encryptPassword(password))).toBeTruthy()
      : expect(() => {AuthService.encryptPassword(password)}).toThrow();
    }
  });
  it("Token generate and check", () => {
    const operator = {
      id: 23,
      email: "example@gmail.com",
      passwordHash: AuthService.encryptPassword("heDK4src4w")
    };
    const token = AuthService.generateToken(operator);
    const decodedToken = AuthService.checkAndDecodeToken(token);
    expect(decodedToken.id).toBe(operator.id);
    expect(decodedToken.email).toBe(operator.email);
    expect(decodedToken.exp).toBeGreaterThan(Date.now()/1000);
  });
  describe("Get operator by credentials", () => {
    const testCases = [
      {
        title: "successful search",
        args: [
          "example@gmail.com",
          "heDK4src4w",
        ],
        dbResponse: {
          id: 23,
          email: "example@gmail.com",
          passwordHash: AuthService.encryptPassword("heDK4src4w")
        },
        error: false
      },
      {
        title: "searching for unexisting operator",
        args: [
          "example@gmail.com",
          "heDK4src4w",
        ],
        dbResponse: {},
        error: true
      },
      {
        title: "wrong password",
        args: [
          "example@gmail.com",
          "wrong_password",
        ],
        dbResponse: {
          id: 23,
          email: "example@gmail.com",
          passwordHash: AuthService.encryptPassword("heDK4src4w")
        },
        error: true
      }
    ];
    testCases.forEach(testCase => it(testCase.title, async () => {
      global.yaxys = {
        db: {
          findOne: () => {
            return testCase.dbResponse;
          }
        }
      };
      if (testCase.error) {
        expect(AuthService.getOperatorByCredentials(...testCase.args)).rejects.toThrow();
      } else {
        expect(AuthService.getOperatorByCredentials(...testCase.args)).resolves.toEqual(testCase.dbResponse);
      }
    }));
  });
});
