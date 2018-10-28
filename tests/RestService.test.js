const RestService = require("../core/services/RestService")
global._ = require("lodash")

describe("RestService", () => {
  let yaxysBuffer

  beforeAll(async () => {
    yaxysBuffer = global.yaxys

    const adapterMethodsToEmulate = ["find", "findOne", "insert", "update", "count"]
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
    }
  })

  class CTXEmulator {
    constructor(data) {
      Object.assign(this, data)
      this.body = null
      this.set = (...args) => {
        this.fakeHeader = [...args]
      }
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
        header: ["meta", `{"total":["count","${identity}",{}]}`],
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
        header: ["meta", `{"total":["count","${identity}",{"someAttribute":3}]}`],
        result: ["find", identity, { someAttribute: 3 }, { limit: 1, skip: 2 }],
      },
      {
        title: "Direct sort",
        ctx: new CTXEmulator({
          query: {
            sort: "someAttribute",
          },
        }),
        header: ["meta", `{"total":["count","${identity}",{}]}`],
        result: ["find", identity, {}, { sort: { someAttribute: 1 } }],
      },
      {
        title: "Negative sort",
        ctx: new CTXEmulator({
          query: {
            sort: "-someAttribute",
          },
        }),
        header: ["meta", `{"total":["count","${identity}",{}]}`],
        result: ["find", identity, {}, { sort: { someAttribute: -1 } }],
      },
      {
        title: "Complicated sort",
        ctx: new CTXEmulator({
          query: {
            sort: '{"a": 1, "b":-1}',
          },
        }),
        header: ["meta", `{"total":["count","${identity}",{}]}`],
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
          if (setKey === "find")
          {
            expect(testCase.ctx.fakeHeader).toStrictEqual(testCase.header)
          }
          expect(testCase.ctx.body).toStrictEqual(testCase.result)
        })
      )
    })
  })

  afterAll(async () => {
    global.yaxys = yaxysBuffer
  })
})
