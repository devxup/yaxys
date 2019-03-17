const PolicyService = require("../core/services/PolicyService.js")
global.AuthService = require("../core/services/AuthService.js")
global._ = require("lodash")
const config = require("config")
const jwt = require("jsonwebtoken")

describe("PolicyService", () => {
  describe("check and inject operator", () => {
    const testCases = [
      {
        title: "Correct token",
        operator: {
          id: 55,
          email: "test@email.com",
        },
        token: AuthService.generateToken({ id: 55, email: "test@email.com" }),
        error: false,
      },
      {
        title: "Incorrect token",
        operator: {
          id: 55,
          email: "test@email.com",
        },
        token: "some_wrong_token",
        error: true,
      },
    ]

    let yaxysBuffer
    beforeAll(() => (yaxysBuffer = global.yaxys))
    afterAll(() => (global.yaxys = yaxysBuffer))
    testCases.forEach(testCase =>
      it(testCase.title, async () => {
        global.yaxys = {
          db: {
            findOne: () => testCase.operator,
          },
        }
        const mockThrow = jest.fn()
        const mockNext = jest.fn()
        let mockCtx = {
          cookies: {
            get: () => testCase.token,
          },
          throw: mockThrow,
          operator: null,
        }
        await PolicyService.checkAndInjectOperator(mockCtx, mockNext)
        if (testCase.error) {
          expect(mockThrow.mock.calls).toStrictEqual([[401, "policyService.UNAUTHORIZED"]])
          expect(mockCtx.operator).toBeNull()
        } else {
          expect(mockNext.mock.calls).toStrictEqual([[]])
          expect(mockThrow.mock.calls).toStrictEqual([])
          expect(mockCtx.operator).toStrictEqual({
            id: testCase.operator.id,
            email: testCase.operator.email,
            exp:
              jwt.verify(testCase.token, config.get("jwt.secret")).iat + config.get("jwt.lifetime"),
          })
        }
      })
    )
  })

  describe("Has right", () => {
    let yaxysBuffer

    beforeAll(() => {
      yaxysBuffer = global.yaxys
    })

    const testCases = [
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
        modelKey: "somemodel",
        right: "neededRight",
        dbResponse: { operatorProfile: [] },
        error: false,
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
              update:true,
            },
          },
        },
        modelKey: "someModel",
        right: "neededRight",
        dbResponse: { operatorProfile: [] },
        error: true,
      },
    ]
    testCases.forEach(testCase =>
      it(testCase.title, async () => {
        global.yaxys = {
          db: {
            findOne: () => testCase.dbResponse,
            find: () => [],
          },
        }
        const mockThrow = jest.fn()
        const mockNext = jest.fn()
        let mockCtx = {
          throw: mockThrow,
          operator: testCase.operator,
        }
        await PolicyService.hasRight(testCase.modelKey, testCase.right)(mockCtx, mockNext)
        if (testCase.error) {
          expect(mockThrow.mock.calls).toStrictEqual([
            [403, "policyService.NO_RIGHTS"],
          ])
          expect(mockNext.mock.calls).toStrictEqual([])
        } else {
          expect(mockNext.mock.calls).toStrictEqual([[]])
          expect(mockThrow.mock.calls).toStrictEqual([])
        }
      })
    )

    afterAll(() => {
      global.yaxys = yaxysBuffer
    })
  })
})
