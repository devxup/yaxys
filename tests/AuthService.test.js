global.AuthService = require("../core/services/AuthService.js")
global._ = require("lodash")
const config = require("config")
const jwt = require("jsonwebtoken")

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

describe("AuthService", () => {
  it("Password encrypt and check", () => {
    const passwords = ["rrr", "fdgfdg", 1234, { a: "b" }]
    for (let password of passwords) {
      typeof password === "string"
        ? expect(
            AuthService.checkPassword(password, AuthService.encryptPassword(password))
          ).toBeTruthy()
        : expect(() => {
            AuthService.encryptPassword(password)
          }).toThrow()
    }
  })

  it("Token generate and check", async () => {
    const operator = {
      id: 23,
      email: "example@gmail.com",
      passwordHash: AuthService.encryptPassword("heDK4src4w"),
    }
    const token = AuthService.generateToken(operator)
    const expectedOutput = Object.assign(
      _.pick(operator, ...AuthService.OPERATOR_ATTRIBUTES_FOR_JWT),
      { exp: jwt.verify(token, config.get("jwt.secret")).iat + config.get("jwt.lifetime") }
    )
    const decodedToken = AuthService.checkAndDecodeToken(token)
    expect(decodedToken).toStrictEqual(expectedOutput)
    await delay(config.get("jwt.lifetime") * 1000 + 100)
    expect(() => {
      AuthService.checkAndDecodeToken(token)
    }).toThrow("jwt expired")
  })

  describe("Get operator by credentials", () => {
    let yaxysBuffer

    beforeAll(() => {
      yaxysBuffer = global.yaxys
    })

    const testCases = [
      {
        title: "successful search",
        args: ["example@gmail.com", "heDK4src4w"],
        dbResponse: {
          id: 23,
          email: "example@gmail.com",
          passwordHash: AuthService.encryptPassword("heDK4src4w"),
        },
        error: false,
      },
      {
        title: "searching for unexisting operator",
        args: ["example@gmail.com", "heDK4src4w"],
        dbResponse: {},
        error: "data and hash arguments required",
      },
      {
        title: "wrong password",
        args: ["example@gmail.com", "wrong_password"],
        dbResponse: {
          id: 23,
          email: "example@gmail.com",
          passwordHash: AuthService.encryptPassword("heDK4src4w"),
        },
        error: "No such operator or wrong password provided",
      },
    ]

    testCases.forEach(testCase =>
      it(testCase.title, async () => {
        global.yaxys = {
          db: {
            findOne: () => testCase.dbResponse,
          },
        }
        if (testCase.error) {
          expect(AuthService.getOperatorByCredentials(...testCase.args)).rejects.toThrow(
            testCase.error
          )
        } else {
          expect(AuthService.getOperatorByCredentials(...testCase.args)).resolves.toEqual(
            testCase.dbResponse
          )
        }
      })
    )

    afterAll(() => {
      global.yaxys = yaxysBuffer
    })
  })

  describe("Check rights", () => {
    const testCases = [
      {
        title: "Operator with admin rights",
        operator: {
          id: 111,
          email: "test@test.test",
          passwordHash: "someHash",
          rights: {},
          isAdministrator: true,
        },
        modelKey: "someModel",
        right: "anyRight",
        expectedResult: true,
      },
      {
        title: "Operator with needed rights",
        operator: {
          id: 111,
          email: "test@test.test",
          passwordHash: "someHash",
          rights: {
            somemodel: { read: true, update: true, neededright: true },
          },
        },
        modelKey: "someModel", //should be lowercase normally, but we are testing if the function still works
        right: "neededRight",
        expectedResult: true,
      },
      {
        title: "Operator without needed rights",
        operator: {
          id: 111,
          email: "test@test.test",
          passwordHash: "someHash",
          rights: {
            somemodel: { read: true, update: true },
          },
        },
        modelKey: "someModel",
        right: "neededRight",
        expectedResult: false,
      },
      {
        title: "Operator without rights for this model",
        operator: {
          id: 111,
          email: "test@test.test",
          passwordHash: "someHash",
          rights: {
            anothermodel: { read: true, update: true },
          },
        },
        modelKey: "someModel",
        right: "read",
        expectedResult: false,
      },
    ]

    testCases.forEach(testCase =>
      it(testCase.title, () => {
        expect(AuthService.checkRight(testCase.operator, testCase.modelKey, testCase.right)).toBe(
          testCase.expectedResult
        )
      })
    )
  })
})
