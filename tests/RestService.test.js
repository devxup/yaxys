global.RestService = require("../core/services/RestService")
global._ = require("lodash")

describe("RestService", () => {
  let yaxysBuffer

  beforeAll(async () => {
    yaxysBuffer = global.yaxys

    const adapterMethodsToEmulate = ["find", "findOne", "insert", "update"]
    global.yaxys = {
      db: _.reduce(
        adapterMethodsToEmulate,
        (memo, methodName) => {
          memo[methodName] = function() {
            return [methodName, ...arguments]
          }
          return memo
        },
        {}
      ),
      models: {
        operator: {},
      },
    }
  })

  afterAll(async () => {
    global.yaxys = yaxysBuffer
  })

  class CTXEmulator {
    constructor(data) {
      Object.assign(this, data)
      this.body = null
    }

    throw() {
      this.body = [...arguments]
      throw new Error("ctx exception")
    }
  }

  const identity = "operator"
  const testCaseSets = {
    findOne: [
      {
        title: "Simple case",
        ctx: new CTXEmulator({
          params: { id: 1 },
        }),
        result: ["findOne", identity, { id: 1 }],
      },
      {
        title: "No id",
        ctx: new CTXEmulator({
          params: {},
        }),
        error: true,
        result: [400, "id is required"],
      },
      {
        title: "Zero id",
        ctx: new CTXEmulator({
          params: { id: 0 },
        }),
        error: true,
        result: [400, "id is required"],
      },
      {
        title: "404",
        ctx: new CTXEmulator({
          params: { id: 1 },
        }),
        dbPatch: {
          findOne: () => null,
        },
        error: true,
        result: [404, `${identity} #1 not found`],
      },
    ],
    find: [
      {
        title: "Empty case",
        ctx: new CTXEmulator(),
        result: ["find", identity, {}, {}],
      },
      {
        title: "Mixed filter and reserved keywords",
        ctx: new CTXEmulator({
          query: {
            limit: 1,
            skip: 2,
            someAttribute: 3,
          },
        }),
        result: ["find", identity, { someAttribute: 3 }, { limit: 1, skip: 2 }],
      },
      {
        title: "Direct sort",
        ctx: new CTXEmulator({
          query: {
            sort: "someAttribute",
          },
        }),
        result: ["find", identity, {}, { sort: { someAttribute: 1 } }],
      },
      {
        title: "Negative sort",
        ctx: new CTXEmulator({
          query: {
            sort: "-someAttribute",
          },
        }),
        result: ["find", identity, {}, { sort: { someAttribute: -1 } }],
      },
      {
        title: "Complicated sort",
        ctx: new CTXEmulator({
          query: {
            sort: '{"a": 1, "b":-1}',
          },
        }),
        result: ["find", identity, {}, { sort: { a: 1, b: -1 } }],
      },
    ],
  }

  _.each(testCaseSets, (testCases, setKey) => {
    describe(setKey, () => {
      testCases.forEach(testCase =>
        it(testCase.title, async () => {
          const dbBuffer = yaxys.db
          if (testCase.dbPatch) {
            yaxys.db = Object.assign({}, yaxys.db, testCase.dbPatch)
          }

          const promise = RestService[setKey](identity)(testCase.ctx)
          if (testCase.error) {
            await expect(promise).rejects.toThrow("ctx exception")
          } else {
            await promise
          }

          if (testCase.dbPatch) {
            yaxys.db = dbBuffer
          }

          expect(testCase.ctx.body).toStrictEqual(testCase.result)
        })
      )
    })
  })

  describe("standard API builder", () => {
    describe("getMethodMiddleware", () => {
      let PolicyServiceBuffer, RestServiceBuffer
      beforeAll(async () => {
        PolicyServiceBuffer = global.PolicyService
        global.PolicyService = {
          checkAndInjectOperator: "checkAndInjectOperator",
          hasRight: (identity, method) => `hasRight(${identity}, ${method})`,
          removePasswordsFromResponse: (identity) => `removePasswordsFromResponse(${identity})`,
          sanitizeRequest: (identity) => `sanitizeRequest(${identity})`,
        }
        const restServicePatchedMethods = ["find", "findOne", "create", "update"]
        RestServiceBuffer = _.pick(RestService, restServicePatchedMethods)
        restServicePatchedMethods.forEach(method => {
          RestService[method] = identity => `${method}(${identity})`
        })
      })
      afterAll(async () => {
        global.PolicyService = PolicyServiceBuffer
        Object.assign(RestService, RestServiceBuffer)
      })

      const testCases = [
        {
          title: "Simple find",
          args: ["operator", "find"],
          expectedResult: [
            "checkAndInjectOperator",
            "hasRight(operator, find)",
            "find(operator)",
          ],
        },
        {
          title: "Сreate",
          args: ["operator", "create"],
          expectedResult: [
            "checkAndInjectOperator",
            "hasRight(operator, create)",
            "sanitizeRequest(operator)",
            "create(operator)",
          ],
        },
      ]
      testCases.forEach(testCase => {
        it(testCase.title, () => {
          expect(RestService.getMethodMiddleware.apply(null, testCase.args)).toStrictEqual(testCase.expectedResult)
        })
      })
    })
    describe("buildStandardAPI", () => {
      let RestServiceBuffer
      beforeAll(()=> {
        RestServiceBuffer = _.pick(RestService, "getMethodMiddleware")
      })
      afterAll(()=> {
        Object.assign(RestService, RestServiceBuffer)
      })
      const testCases = [
        {
          title: "Simple case",
          options: { op: 1 },
          expectedResult: {
            "operator/:id": "findOne",
            "operator": "find",
            "put operator/:id": "update",
            "post operator": "create",
          },
          expectedCalls: [
            ["operator", "findOne", { op: 1 }],
            ["operator", "find", { op: 1 }],
            ["operator", "update", { op: 1 }],
            ["operator", "create", { op: 1 }],
          ],
        },
        {
          title: "Exclude single",
          options: { exclude: "update" },
          expectedResult: {
            "operator/:id": "findOne",
            "operator": "find",
            "post operator": "create",
          },
          expectedCalls: [
            ["operator", "findOne", { exclude: "update" }],
            ["operator", "find", { exclude: "update" }],
            ["operator", "create", { exclude: "update" }],
          ],
        },
        {
          title: "Exclude list",
          options: { exclude: ["update", "create"] },
          expectedResult: {
            "operator/:id": "findOne",
            "operator": "find",
          },
          expectedCalls: [
            ["operator", "findOne", { exclude: ["update", "create"] }],
            ["operator", "find", { exclude: ["update", "create"] }],
          ],
        },
      ]
      testCases.forEach(testCase => {
        it(testCase.title, () => {
          RestService.getMethodMiddleware = jest.fn((identity, method) => method)
          expect(RestService.buildStandardAPI("operator", testCase.options)).toStrictEqual(testCase.expectedResult)
          expect(RestService.getMethodMiddleware.mock.calls).toStrictEqual(testCase.expectedCalls)
        })
      })
    })
  })
})
