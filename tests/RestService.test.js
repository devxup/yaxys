const RestService = require("../core/services/RestService");
global._ = require("lodash");

describe("RestService", () => {
  let yaxysBuffer;

  beforeAll(async() => {
    yaxysBuffer = global.yaxys;

    const adapterMethodsToEmulate = ["find", "findOne", "insert", "update"];
    global.yaxys = {
      db: _.reduce(adapterMethodsToEmulate, (memo, methodName) => {
        memo[methodName] = function() {
          return [methodName, ...arguments]
        };
        return memo;
      }, {})
    };
  });

  class CTXEmulator {
    constructor(data) {
      Object.assign(this, data);
      this.body = null;
    }

    throw() {
      this.body = [...arguments];
      throw new Error("ctx exception");
    }
  }

  const schemaKey = "operator";
  const testCaseSets = {
    findOne: [
      {
        title: "Simple case",
        ctx: new CTXEmulator({
          params: { id: 1 }
        }),
        result: ["findOne", schemaKey, { id: 1 }]
      },
      {
        title: "No id",
        ctx: new CTXEmulator({
          params: {}
        }),
        error: true,
        result: [400, "id is required"]
      },
      {
        title: "Zero id",
        ctx: new CTXEmulator({
          params: { id: 0 }
        }),
        error: true,
        result: [400, "id is required"]
      },
      {
        title: "404",
        ctx: new CTXEmulator({
          params: { id: 1 }
        }),
        dbPatch: {
          findOne: () => null
        },
        error: true,
        result: [404, `${schemaKey} #1 not found`]
      }
    ],
    find: [
      {
        title: "Empty case",
        ctx: new CTXEmulator(),
        result: ["find", schemaKey, {}, {}]
      },
      {
        title: "Mixed filter and reserved keywords",
        ctx: new CTXEmulator({
          query: {
            limit: 1,
            skip: 2,
            someAttribute: 3
          }
        }),
        result: ["find", schemaKey, { someAttribute: 3 }, { limit: 1, skip: 2 }]
      },
      {
        title: "Direct sort",
        ctx: new CTXEmulator({
          query: {
            sort: "someAttribute"
          }
        }),
        result: ["find", schemaKey, { }, { sort: { someAttribute: 1 }}]
      },
      {
        title: "Negative sort",
        ctx: new CTXEmulator({
          query: {
            sort: "-someAttribute"
          }
        }),
        result: ["find", schemaKey, { }, { sort: { someAttribute: -1 }}]
      },
      {
        title: "Complicated sort",
        ctx: new CTXEmulator({
          query: {
            sort: '{"a": 1, "b":-1}'
          }
        }),
        result: ["find", schemaKey, { }, { sort: { a: 1, b: -1 }}]
      }
    ]
  };

  _.each(testCaseSets, (testCases, setKey) => {
    describe(setKey, () => {
      testCases.forEach(testCase => it(testCase.title, async() => {
        const dbBuffer = yaxys.db;
        if (testCase.dbPatch) {
          yaxys.db = Object.assign({}, yaxys.db, testCase.dbPatch);
        }

        const promise = RestService[setKey](schemaKey)(testCase.ctx);
        if (testCase.error) {
          await expect(promise).rejects.toThrow("ctx exception");
        } else {
          await promise;
        }

        if (testCase.dbPatch) {
          yaxys.db = dbBuffer;
        }

        expect(testCase.ctx.body).toStrictEqual(testCase.result);
      }));
    });
  });

  afterAll(async() => {
    global.yaxys = yaxysBuffer;
  });
});
