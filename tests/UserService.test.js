const UserService = require("../core/services/UserService.js")
global._ = require("lodash")

describe("UserService", () => {
  describe("singleCredentialUpdateMiddleware", () => {
    const testCases = [
      {
        title: "No credentialCode",
        ctx: {
          request: {
            body: {},
          },
        },
        updateCalls: [],
        insertCalls: [],
      },
      {
        title: "Update existing",
        ctx: {
          request: {
            body: { credentialCode: "123" },
          },
          params: {
            id: 1,
          },
        },
        findOneResult: { id: 12 },
        updateCalls: [[undefined, "credential", 12, { code: "123" }]],
        insertCalls: [],
      },
      {
        title: "Insert new",
        ctx: {
          request: {
            body: { credentialCode: "456" },
          },
          params: {
            id: 2,
          },
        },
        findOneResult: null,
        updateCalls: [],
        insertCalls: [[undefined, "credential", { user: 2, code: "456" }]],
      },
    ]

    let yaxysBuffer
    beforeAll(() => yaxysBuffer = global.yaxys)
    afterAll(() => global.yaxys = yaxysBuffer)

    testCases.forEach(testCase => it(testCase.title, async () => {
      global.yaxys = {
        db: {
          findOne: () => testCase.findOneResult,
          update: jest.fn(),
          insert: jest.fn(),
        },
      }

      await UserService.singleCredentialUpdateMiddleware(testCase.ctx, () => {})
      expect(global.yaxys.db.update.mock.calls).toStrictEqual(testCase.updateCalls)
      expect(global.yaxys.db.insert.mock.calls).toStrictEqual(testCase.insertCalls)
    }))
  })
  describe("singleCredentialFindOneMiddleware", () => {
    const testCases = [
      {
        title: "Credential not found",
        ctx: {
          request: {
            body: {},
          },
        },
        nextResult: { id: 1 },
        findOneResult: null,
        functionResult: { id: 1 },
      },
      {
        title: "Credential found",
        ctx: {
          request: {
            body: {},
          },
        },
        nextResult: { id: 2 },
        findOneResult: { code: "abc" },
        functionResult: { id: 2, credentialCode: "abc" },
      },
    ]

    let yaxysBuffer
    beforeAll(() => yaxysBuffer = global.yaxys)
    afterAll(() => global.yaxys = yaxysBuffer)

    testCases.forEach(testCase => it(testCase.title, async () => {
      global.yaxys = {
        db: {
          findOne: () => testCase.findOneResult,
        },
      }

      await UserService.singleCredentialFindOneMiddleware(
        testCase.ctx,
        () => {
          testCase.ctx.body = testCase.nextResult
        }
      )
      expect(testCase.ctx.body).toStrictEqual(testCase.functionResult)
    }))
  })
  describe("singleCredentialFindMiddleware", () => {
    const testCases = [
      {
        title: "Multiple creds for one user",
        ctx: {
          request: {
            body: {},
          },
        },
        nextResult: [
          { id: 1 },
          { id: 2 },
        ],
        findResult: [
          { user: 2, code: "abc" },
          { user: 2, code: "def" },
        ],
        functionResult: [
          { id: 1 },
          { id: 2, credentialCode: "abc" },
        ],
      },
    ]

    let yaxysBuffer
    beforeAll(() => yaxysBuffer = global.yaxys)
    afterAll(() => global.yaxys = yaxysBuffer)

    testCases.forEach(testCase => it(testCase.title, async () => {
      global.yaxys = {
        db: {
          find: () => testCase.findResult,
        },
      }

      await UserService.singleCredentialFindMiddleware(
        testCase.ctx,
        () => {
          testCase.ctx.body = testCase.nextResult
        }
      )
      expect(testCase.ctx.body).toStrictEqual(testCase.functionResult)
    }))
  })
})
