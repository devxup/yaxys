const RestService = require("../core/services/RestService")
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
    }
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
          query: {},
        }),
        result: ["findOne", identity, { id: 1 }, null, null, [], []],
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
        result: ["findOne", identity, { id: 1 }, null, null, ["someModel", "anotherModel"], []],
      },
      {
        title: "Query with m:m populate",
        ctx: new CTXEmulator({
          params: { id: 1 },
          query: {
            populate: "someModel:anotherModel:oneMoreModel",
          },
        }),
        result: ["findOne", identity, { id: 1 }, null, null, [], [{
          linkerModel: "someModel",
          initialModel: "anotherModel",
          modelToLink: "oneMoreModel",
        }]],
      },
      {
        title: "Bad populate query",
        ctx: new CTXEmulator({
          params: { id: 1 },
          query: {
            populate: "someModel:anotherModel",
          },
        }),
        error: true,
        result: [400, "Bad request"],
      },
    ],
    find: [
      {
        title: "Empty case",
        ctx: new CTXEmulator({
          query: {},
        }),
        result: ["find", identity, {}, {}, null, [], []],
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
        result: ["find", identity, { someAttribute: 3 }, { limit: 1, skip: 2 }, null, [], []],
      },
      {
        title: "Direct sort",
        ctx: new CTXEmulator({
          query: {
            sort: "someAttribute",
          },
        }),
        result: ["find", identity, {}, { sort: { someAttribute: 1 } }, null, [], []],
      },
      {
        title: "Negative sort",
        ctx: new CTXEmulator({
          query: {
            sort: "-someAttribute",
          },
        }),
        result: ["find", identity, {}, { sort: { someAttribute: -1 } }, null, [], []],
      },
      {
        title: "Complicated sort",
        ctx: new CTXEmulator({
          query: {
            sort: '{"a": 1, "b":-1}',
          },
        }),
        result: ["find", identity, {}, { sort: { a: 1, b: -1 } }, null, [], []],
      },
      {
        title: "Query with 1:m populate",
        ctx: new CTXEmulator({
          query: {
            populate: "someModel,anotherModel",
          },
        }),
        result: ["find", identity, {}, {}, null, ["someModel", "anotherModel"], []],
      },
      {
        title: "Query with m:m populate",
        ctx: new CTXEmulator({
          query: {
            populate: "someModel:anotherModel:oneMoreModel",
          },
        }),
        result: ["find", identity, {}, {}, null, [], [{
          linkerModel: "someModel",
          initialModel: "anotherModel",
          modelToLink: "oneMoreModel",
        }]],
      },
      {
        title: "Bad populate query",
        ctx: new CTXEmulator({
          query: {
            populate: "someModel:anotherModel",
          },
        }),
        error: true,
        result: [400, "Bad request"],
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

  afterAll(async () => {
    global.yaxys = yaxysBuffer
  })
})
