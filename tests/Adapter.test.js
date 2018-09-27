const Adapter = require("../core/classes/Adapter");
const config = require("config");
const Promise = require("bluebird");

describe("Adapter", () => {
  let gAdapter;

  const tableName = "fake_item";
  const dropQuery = `DROP TABLE IF EXISTS ${tableName}`;
  const createQuery = `CREATE TABLE ${tableName} (
    "id" serial not null,
    "a1" integer,
    "a2" text,
    "a3" json DEFAULT NULL,
    constraint "${tableName}_pkey" primary key ("id")
  );`;

  beforeAll(async () => {
    gAdapter = new Adapter(config.get("db"));
    await gAdapter.init();
    await gAdapter.knex.raw(dropQuery);
    await gAdapter.knex.raw(createQuery);

    gAdapter.registerSchema("fake_item", {
      properties: {
        a1: { type: "integer" },
        a2: { type: "string" },
        a3: { type: "json" }
      }
    })
  });

  describe("Simple queries", () => {
    const testCases = [
      {
        title: "simple insert",
        method: "insert",
        args: [tableName, {a1: 1, a2: "v1"}],
        result: {id: 1, a1: 1, a2: "v1", a3: null}
      },
      {
        title: "simple update",
        method: "update",
        args: [tableName, 1, {a1: 3, a3: {k: 1}}],
        result: {id: 1, a1: 3, a2: "v1", a3: {k: 1}}
      },
      {
        title: "update unexisting item",
        method: "update",
        args: [tableName, 1000, {a1: 2, a3: {k: 1}}],
        error: "Update failed – record with id 1000 not found"
      },
      {
        title: "insert another item",
        method: "insert",
        args: [tableName, {a1: 4}],
        result: {id: 2, a2: null, a1: 4, a3: null}
      },
      {
        title: "findOne with corrupted select",
        method: "findOne",
        args: [tableName, {a2: "v1"}, {limit: 2, sort: {id: 1}}],
        result: {id: 1, a1: 3, a2: "v1", a3: {k: 1}}
      },
      {
        title: "findOne with back sort",
        method: "findOne",
        args: [tableName, {}, {limit: 2, sort: {id: -1}}],
        result: {id: 2, a2: null, a1: 4, a3: null}
      },
      {
        title: "find with direct sort",
        method: "find",
        args: [tableName, {}, {sort: {id: 1}}],
        result: [
          {id: 1, a1: 3, a2: "v1", a3: {k: 1}},
          {id: 2, a2: null, a1: 4, a3: null}
        ]
      },
      {
        title: "find with back sort",
        method: "find",
        args: [tableName, {}, {sort: {id: -1}}],
        result: [
          {id: 2, a2: null, a1: 4, a3: null},
          {id: 1, a1: 3, a2: "v1", a3: {k: 1}}
        ]
      },
      {
        title: "find with back sort and limit",
        method: "find",
        args: [tableName, {}, {sort: {id: -1}, limit: 1}],
        result: [
          {id: 2, a2: null, a1: 4, a3: null}
        ]
      },
      {
        title: "find with filter",
        method: "find",
        args: [tableName, {a1: 3}, {sort: {id: -1}, limit: 1}],
        result: [
          {id: 1, a1: 3, a2: "v1", a3: {k: 1}}
        ]
      }
    ];

    testCases.forEach(testCase => it(testCase.title, async() => {
      const promise = gAdapter[testCase.method].apply(gAdapter, testCase.args);
      if (testCase.error) {
        await expect(promise).rejects.toThrow(testCase.error);
      } else {
        const result = await promise;
        expect(result).toStrictEqual(testCase.result);
      }
    }));
  });

  describe("transactions", () => {
    const testCases = [
      {
        title: "Rolled back transaction",
        operations: [
          {
            // inserting item under transaction
            method: "insert",
            args: [tableName, { a1: 10 }, "_trx_"],
            result: {id: 3, a1: 10, a2: null, a3: null }
          },
          {
            // finding item under transaction – should get result
            method: "findOne",
            args: [tableName, { a1: 10 }, null, "_trx_"],
            result: { id: 3, a1: 10, a2: null, a3: null }
          },
          {
            // finding item without transaction – should be empty
            method: "findOne",
            args: [tableName, { a1: 10 }],
            result: undefined
          },
          {
            // rolling back transaction
            method: "transactionRollback",
            args: ["_trx_"]
          },
          {
            // ensuring there is an error after transaction rollback
            method: "findOne",
            args: [tableName, { a1: 10 }, null, "_trx_"],
            error: "Transaction query already complete"
          },
          {
            // ensuring there is no item without transaction
            method: "findOne",
            args: [tableName, { a1: 10 }],
            result: undefined
          }
        ]
      },
      {
        title: "Committed transaction",
        operations: [
          {
            // inserting item under transaction
            // id is 4, since even rolled back transaction affects autoincrements
            method: "insert",
            args: [tableName, { a1: 10 }, "_trx_"],
            result: {id: 4, a1: 10, a2: null, a3: null }
          },
          {
            // finding item under transaction – should get result
            method: "findOne",
            args: [tableName, { a1: 10 }, null, "_trx_"],
            result: { id: 4, a1: 10, a2: null, a3: null }
          },
          {
            // finding item without transaction – should be empty
            method: "findOne",
            args: [tableName, { a1: 10 }],
            result: undefined
          },
          {
            // committing back transaction
            method: "transactionCommit",
            args: ["_trx_"]
          },
          {
            // ensuring there is an error after transaction commit
            method: "findOne",
            args: [tableName, { a1: 10 }, null, "_trx_"],
            error: "Transaction query already complete"
          },
          {
            // ensuring there is an item after transaction committed
            method: "findOne",
            args: [tableName, { a1: 10 }],
            result: { id: 4, a1: 10, a2: null, a3: null }
          }
        ]
      }
    ];
    testCases.forEach((testCase) => it(testCase.title, async() => {
      const trx = await gAdapter.transaction();
      await Promise.each(testCase.operations, async (operation) => {
        const patchedArgs = operation.args.map(arg => arg === "_trx_" ? trx : arg);
        const promise = gAdapter[operation.method].apply(gAdapter, patchedArgs);
        if (operation.error) {
          await expect(promise).rejects.toThrow(operation.error);
        } else {
          const result = await promise;
          if (operation.hasOwnProperty("result")) {
            expect(result).toStrictEqual(operation.result);
          }
        }
      });
    }));
  });

  afterAll(async () => {
    await gAdapter.shutdown();
  });
});
