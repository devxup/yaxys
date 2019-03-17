global.AuthService = require("../core/services/AuthService.js")
global._ = require("lodash")
const config = require("config")
const jwt = require("jsonwebtoken")

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

describe("AuthService", () => {
  let yaxysBuffer

  beforeAll(() => {
    yaxysBuffer = global.yaxys
  })

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
        error: "AuthService.WRONG_CREDENTIALS",
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
          await expect(AuthService.getOperatorByCredentials(...testCase.args)).rejects.toThrow(
            testCase.error
          )
        } else {
          await expect(AuthService.getOperatorByCredentials(...testCase.args)).resolves.toEqual(
            testCase.dbResponse
          )
        }
      })
    )
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
        dbResponse: [],
        expectedResult: true,
      },
      {
        title: "Operator with needed rights",
        operator: {
          id: 111,
          email: "test@test.test",
          passwordHash: "someHash",
          rights: {
            somemodel: {
              read: true,
              update:true,
              neededright: true,
            },
          },
        },
        modelKey: "someModel", //should be lowercase normally, but we are testing if the function still works
        right: "neededRight",
        dbResponse: [],
        expectedResult: true,
      },
      {
        title: "Operator without needed rights",
        operator: {
          id: 111,
          email: "test@test.test",
          passwordHash: "someHash",
          rights: {
            somemodel: {
              read: true,
              update: true,
            },
          },
        },
        modelKey: "someModel",
        right: "neededRight",
        dbResponse: [],
        expectedResult: false,
      },
      {
        title: "Operator without rights",
        operator: {
          id: 111,
          email: "test@test.test",
          passwordHash: "someHash",
        },
        modelKey: "someModel",
        right: "read",
        dbResponse: [],
        expectedResult: false,
      },
      {
        title: "Operator with profile containing needed rights",
        operator: {
          id: 111,
          email: "test@test.test",
          passwordHash: "someHash",
        },
        modelKey: "someModel",
        right: "read",
        dbResponse: [{
          operatorProfile: {
            id: 1,
            title: "someProfile",
            rights: {
              somemodel: {
                read: true,
              },
            },
          },
        }],
        expectedResult: true,
      },
      {
        title: "Operator with rights restriction overriding profile",
        operator: {
          id: 111,
          email: "test@test.test",
          passwordHash: "someHash",
          rights: {
            somemodel: {
              read: false,
            },
          },
        },
        modelKey: "someModel",
        right: "read",
        dbResponse: [{
          operatorProfile: {
            id: 1,
            title: "someProfile",
            rights: {
              somemodel: {
                read: true,
              },
            },
          },
        }],
        expectedResult: false,
      },
    ]

    testCases.forEach(testCase =>
      it(testCase.title, () => {
        global.yaxys = {
          db: {
            find: () => testCase.dbResponse,
          },
        }
        expect(AuthService.checkRight(testCase.operator, testCase.modelKey, testCase.right)).resolves.toBe(
          testCase.expectedResult
        )
      })
    )
  })
  describe("hasCustomRights", () => {
    const testCases = [
      {
        title: "No rights",
        instance: {
          rights: null,
        },
        patch: {
          rights: null,
        },
        expectedResult: false,
      },
      {
        title: "Prefer patch, result = true",
        instance: {
          rights: {},
        },
        patch: {
          rights: { operator: { create: false } },
        },
        expectedResult: true,
      },
      {
        title: "Prefer patch, result = false",
        instance: {
          rights: { operator: { create: false } },
        },
        patch: {
          rights: {},
        },
        expectedResult: false,
      },
      {
        title: "Count false as custom",
        instance: {
          rights: { operator: { rightName: false } },
        },
        expectedResult: true,
      },
      {
        title: "Count true as custom",
        instance: {
          rights: { operator: { rightName: true } },
        },
        expectedResult: true,
      },
      {
        title: "Count null as not custom",
        instance: {
          rights: { operator: { rightName: null } },
        },
        expectedResult: false,
      },
      {
        title: "Count undefined as not custom",
        instance: {
          rights: { operator: { rightName: undefined } },
        },
        expectedResult: false,
      },
      {
        title: "Some rights",
        instance: {
          rights: { operator: { rightName: undefined, anotherRight: false } },
        },
        expectedResult: true,
      },
      {
        title: "Some models",
        instance: {
          rights: { operator: { rightName: undefined }, operatorProfile: { anotherRight: false } },
        },
        expectedResult: true,
      },
    ]

    let yaxysBuffer
    beforeAll(() => {
      yaxysBuffer = global.yaxys
      global.yaxys = {
        models: { operator: {}, operatorProfile: {} },
      }
    })
    afterAll(() => {
      global.yaxys = yaxysBuffer
    })
    testCases.forEach(testCase => {
      it(testCase.title, () => {
        expect(AuthService.hasCustomRights(testCase.instance, testCase.patch)).toBe(
          testCase.expectedResult
        )
      })
      it(`${testCase.title}, string case`, () => {
        expect(AuthService.hasCustomRights(
          testCase.instance && { ...testCase.instance, rights: JSON.stringify(testCase.instance.rights) },
          testCase.patch && { ...testCase.patch, rights: JSON.stringify(testCase.patch.rights) },
        )).toBe(
          testCase.expectedResult
        )
      })
    })
  })

  afterAll(() => {
    global.yaxys = yaxysBuffer
  })
})
