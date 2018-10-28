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
        m1: {},
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

  const identity = "m1"
  const testCaseSets = {
    findOne: [
      {
        title: "Simple case",
        ctx: new CTXEmulator({
          params: { id: 1 },
          query: {},
        }),
        result: ["findOne", identity, { id: 1 }, { populate: undefined }],
      },
      {
        title: "No id",
        ctx: new CTXEmulator({
          params: {},
          query: {},
        }),
        error: true,
        result: [400, "id is required"],
      },
      {
        title: "Zero id",
        ctx: new CTXEmulator({
          params: { id: 0 },
          query: {},
        }),
        error: true,
        result: [400, "id is required"],
      },
      {
        title: "404",
        ctx: new CTXEmulator({
          params: { id: 1 },
          query: {},
        }),
        dbPatch: {
          findOne: () => null,
        },
        error: true,
        result: [404, `${identity} #1 not found`],
      },
      {
        title: "Query with 1:m populate",
        ctx: new CTXEmulator({
          params: { id: 1 },
          query: {
            populate: "someModel,anotherModel",
          },
        }),
        result: ["findOne", identity, { id: 1 }, { populate: ["someModel", "anotherModel"] }],
      },
      {
        title: "Query with m:m populate",
        ctx: new CTXEmulator({
          params: { id: 1 },
          query: {
            populate: "someModel:anotherModel:oneMoreModel",
          },
        }),
        result: ["findOne", identity, { id: 1 }, { populate: ["someModel:anotherModel:oneMoreModel"] }],
      },
    ],
    find: [
      {
        title: "Empty case",
        ctx: new CTXEmulator({
          query: {},
        }),
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
      {
        title: "Query with 1:m populate",
        ctx: new CTXEmulator({
          query: {
            populate: "someModel,anotherModel",
          },
        }),
        result: ["find", identity, {}, { populate: ["someModel", "anotherModel"] }],
      },
      {
        title: "Query with m:m populate",
        ctx: new CTXEmulator({
          query: {
            populate: "someModel:anotherModel:oneMoreModel",
          },
        }),
        result: ["find", identity, {}, { populate: ["someModel:anotherModel:oneMoreModel"] }],
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
          args: ["m1", "find"],
          expectedResult: [
            "checkAndInjectOperator",
            "hasRight(m1, read)",
            "find(m1)",
          ],
        },
        {
          title: "Сreate",
          args: ["m1", "create"],
          expectedResult: [
            "checkAndInjectOperator",
            "hasRight(m1, create)",
            "sanitizeRequest(m1)",
            "create(m1)",
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
            "m1/:id": "findOne",
            "m1": "find",
            "put m1/:id": "update",
            "post m1": "create",
            "delete m1/:id": "delete",
          },
          expectedCalls: [
            ["m1", "findOne", { op: 1 }],
            ["m1", "find", { op: 1 }],
            ["m1", "update", { op: 1 }],
            ["m1", "create", { op: 1 }],
            ["m1", "delete", { op: 1 }],
          ],
        },
        {
          title: "Exclude single",
          options: { exclude: "update" },
          expectedResult: {
            "m1/:id": "findOne",
            "m1": "find",
            "post m1": "create",
            "delete m1/:id": "delete",
          },
          expectedCalls: [
            ["m1", "findOne", { exclude: "update" }],
            ["m1", "find", { exclude: "update" }],
            ["m1", "create", { exclude: "update" }],
            ["m1", "delete", { exclude: "update" }],
          ],
        },
        {
          title: "Exclude list",
          options: { exclude: ["update", "create"] },
          expectedResult: {
            "m1/:id": "findOne",
            "m1": "find",
            "delete m1/:id": "delete",
          },
          expectedCalls: [
            ["m1", "findOne", { exclude: ["update", "create"] }],
            ["m1", "find", { exclude: ["update", "create"] }],
            ["m1", "delete", { exclude: ["update", "create"] }],
          ],
        },
      ]
      testCases.forEach(testCase => {
        it(testCase.title, () => {
          RestService.getMethodMiddleware = jest.fn((identity, method) => method)
          expect(RestService.buildStandardAPI("m1", testCase.options)).toStrictEqual(testCase.expectedResult)
          expect(RestService.getMethodMiddleware.mock.calls).toStrictEqual(testCase.expectedCalls)
        })
      })
    })
  })
})
