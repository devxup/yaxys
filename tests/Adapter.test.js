const Adapter = require("../core/classes/Adapter")
const config = require("config")
const _ = require("lodash")

let yaxysBuffer

beforeAll(() => {
  yaxysBuffer = global.yaxys
  global.yaxys = {
    t: key => key,
  }
})

afterAll(() => {
  global.yaxys = yaxysBuffer
})

describe("Adapter", () => {
  let gAdapter

  const tableNames = ["fake_item", "fake_linker", "fake_initial", "fake_to_link"]
  const getDropQueryForTable = tableName => `DROP TABLE IF EXISTS ${tableName}`
  const createQueries = [
    `CREATE TABLE ${tableNames[0]} (
      "id" serial not null,
      "a1" integer,
      "a2" text,
      "a3" json DEFAULT NULL,
      constraint "${tableNames[0]}_pkey" primary key ("id")
    );`,
    `CREATE TABLE ${tableNames[1]} (
      "id" serial not null,
      "fake_initial_field" integer,
      "fake_to_link_field" integer,
      constraint "${tableNames[1]}_pkey" primary key ("id")
    );`,
    `CREATE TABLE ${tableNames[2]} (
      "id" serial not null,
      "x1" text,
      "x2" text,
      constraint "${tableNames[2]}_pkey" primary key ("id")
    );`,
    `CREATE TABLE ${tableNames[3]} (
      "id" serial not null,
      "y1" text,
      "y2" text,
      constraint "${tableNames[3]}_pkey" primary key ("id")
    );`,
  ]
  const insertQueries = [
    `INSERT INTO ${tableNames[1]} VALUES (1, 1, 1), (2, 2, 2), (3, 1, 2)`,
    `INSERT INTO ${tableNames[2]} VALUES (1, 'one', 'hey'), (2, 'two', 'ho'), (3, 'no', 'noooo')`,
    `INSERT INTO ${tableNames[3]} VALUES (1, 'three', 'lets'), (2, 'four', 'go')`,
  ]

  beforeAll(async () => {
    gAdapter = new Adapter(config.get("db"))
    await gAdapter.init()
    for (let tableName of tableNames) {
      await gAdapter.knex.raw(getDropQueryForTable(tableName))
    }
    for (let createQuery of createQueries) {
      await gAdapter.knex.raw(createQuery)
    }
    for (let insertQuery of insertQueries) {
      await gAdapter.knex.raw(insertQuery)
    }

    gAdapter.registerSchema(tableNames[0], {
      properties: {
        a1: { type: "integer" },
        a2: { type: "string" },
        a3: { type: "object" },
      },
    })
    gAdapter.registerSchema(tableNames[1], {
      properties: {
        fake_initial_field: {
          type: "integer",
          connection: {
            type: "m:1",
            relatedModel: "fake_initial",
          },
        },
        fake_to_link_field: {
          type: "integer",
          connection: {
            type: "m:1",
            relatedModel: "fake_to_link",
          },
        },
      },
    })
    gAdapter.registerSchema(tableNames[2], {
      properties: {
        x1: { type: "string" },
        x2: { type: "string" },
        relatedList: {
          type: "integer",
          virtual: true, connection: {
            type: "m:m",
            linkerModel: tableNames[1],
            linkerMyAttribute: "fake_initial_field",
            linkerRelatedAttribute: "fake_to_link_field",
          },
        },
      },
    })
    gAdapter.registerSchema(tableNames[3], {
      properties: {
        y1: { type: "string" },
        y2: { type: "string" },
      },
    })
  })

  describe("Simple queries", () => {
    const testCases = [
      {
        title: "simple insert",
        method: "insert",
        args: [null, tableNames[0], { a1: 1, a2: "v1" }],
        result: { id: 1, a1: 1, a2: "v1", a3: null },
      },
      {
        title: "simple update",
        method: "update",
        args: [null, tableNames[0], 1, { a1: 3, a3: { k: 1 } }],
        result: { id: 1, a1: 3, a2: "v1", a3: { k: 1 } },
      },
      {
        title: "update unexisting item",
        method: "update",
        args: [null, tableNames[0], 1000, { a1: 2, a3: { k: 1 } }],
        error: "Adapter.ID_NOT_FOUND",
      },
      {
        title: "insert another item",
        method: "insert",
        args: [null, tableNames[0], { a1: 4 }],
        result: { id: 2, a2: null, a1: 4, a3: null },
      },
      {
        title: "findOne with back sort",
        method: "findOne",
        args: [null, tableNames[0], {}, { limit: 2, sort: { id: -1 } }],
        result: { id: 2, a2: null, a1: 4, a3: null },
      },
      {
        title: "find with direct sort",
        method: "find",
        args: [null, tableNames[0], {}, { sort: { id: 1 } }],
        result: [{ id: 1, a1: 3, a2: "v1", a3: { k: 1 } }, { id: 2, a2: null, a1: 4, a3: null }],
      },
      {
        title: "find with back sort",
        method: "find",
        args: [null, tableNames[0], {}, { sort: { id: -1 } }],
        result: [{ id: 2, a2: null, a1: 4, a3: null }, { id: 1, a1: 3, a2: "v1", a3: { k: 1 } }],
      },
      {
        title: "find with back sort and limit",
        method: "find",
        args: [null, tableNames[0], {}, { sort: { id: -1 }, limit: 1 }],
        result: [{ id: 2, a2: null, a1: 4, a3: null }],
      },
      {
        title: "find with filter",
        method: "find",
        args: [null, tableNames[0], { a1: 3 }, { sort: { id: -1 }, limit: 1 }],
        result: [{ id: 1, a1: 3, a2: "v1", a3: { k: 1 } }],
      },
      {
        title: "find with 1:m populate",
        method: "find",
        args: [null, tableNames[1], {}, { populate: "fake_initial_field" }],
        result: [
          {
            id: 1,
            fake_initial_field: {
              id: 1,
              x1: "one",
              x2: "hey",
            },
            fake_to_link_field: 1,
          },
          {
            id: 2,
            fake_initial_field: {
              id: 2,
              x1: "two",
              x2: "ho",
            },
            fake_to_link_field: 2,
          },
          {
            id: 3,
            fake_initial_field: {
              id: 1,
              x1: "one",
              x2: "hey",
            },
            fake_to_link_field: 2,
          },
        ],
      },
      {
        title: "find with m:m populate",
        method: "find",
        args: [null, tableNames[2], {}, { populate: "relatedList" }],
        result: [
          {
            id: 1,
            x1: "one",
            x2: "hey",
            relatedList: [
              {
                id: 1,
                y1: "three",
                y2: "lets",
                _binding_id: 1,
              },
              {
                id: 2,
                y1: "four",
                y2: "go",
                _binding_id: 3,
              },
            ],
          },
          {
            id: 2,
            x1: "two",
            x2: "ho",
            relatedList: [
              {
                id: 2,
                y1: "four",
                y2: "go",
                _binding_id: 2,
              },
            ],
          },
          {
            id: 3,
            x1: "no",
            x2: "noooo",
            relatedList: [],
          },
        ],
      },
    ]

    testCases.forEach(testCase =>
      it(testCase.title, async () => {
        const promise = gAdapter[testCase.method].apply(gAdapter, testCase.args)
        if (testCase.error) {
          await expect(promise).rejects.toThrow(testCase.error)
        } else {
          const result = await promise
          expect(result).toStrictEqual(testCase.result)
        }
      })
    )
  })

  describe("Delete", () => {
    it("Insert and then delete", async () => {
      const inserted = await gAdapter.insert(null, tableNames[0], { "a1": 1, a2: "v1" })
      const found = await gAdapter.findOne(null, tableNames[0], { id: inserted.id })
      expect(found).toStrictEqual(inserted)
      const deleted = await gAdapter.delete(null, tableNames[0], inserted.id)
      expect(deleted).toStrictEqual(inserted)

      const foundItems = await gAdapter.find(null, tableNames[0], { id: inserted.id })
      expect(foundItems).toStrictEqual([])
    })
  })

  describe("getSQL", () => {
    const testCases = [
      {
        title: "get sql for create table with all possible data types and 1 virtual field",
        args: [
          "testtable",
          {
            properties: {
              p1: {
                type: "string",
                default: "defVal",
              },
              p2: {
                type: "boolean",
              },
              p3: {
                type: "bigInteger",
              },
              p4: {
                type: "text",
              },
              p5: {
                type: "float",
              },
              p6: {
                type: "decimal",
              },
              p7: {
                type: "date",
              },
              p8: {
                type: "dateTime",
              },
              p9: {
                type: "time",
              },
              p10: {
                type: "binary",
              },
              p11: {
                type: "json",
              },
              p12: {
                type: "jsonb",
              },
              p13: {
                type: "uuid",
              },
              p14: {
                type: "integer",
                default: 10,
              },
              p15: {
                type: "integer",
                virtual: true,
              },
            },
            required: ["p1", "p2"],
          },
        ],
        result:
          'create table "testtable" ("id" serial primary key, "p1" varchar(255) not null default \'defVal\', "p2" boolean not null, "p3" bigint, "p4" text, "p5" real, "p6" decimal(8, 2), "p7" date, "p8" timestamptz, "p9" time, "p10" bytea, "p11" json, "p12" jsonb, "p13" uuid, "p14" integer default \'10\')',
      },
      {
        title: "get sql for create table with incorrect data type",
        args: [
          "testtable1",
          {
            properties: {
              p1: {
                type: "integer",
              },
              p2: {
                type: "wrongtype",
              },
              required: ["p1"],
            },
          },
        ],
        error: "Adapter.INCORRECT_DATA_TYPE",
      },
      {
        title: "get sql for create table with id field and without required array",
        args: [
          "testtable2",
          {
            properties: {
              id: {
                type: "integer",
              },
              p1: {
                type: "integer",
              },
              p2: {
                type: "string",
              },
            },
          },
        ],
        result:
          'create table "testtable2" ("id" serial primary key, "p1" integer, "p2" varchar(255))',
      },
    ]
    testCases.forEach(testCase =>
      it(testCase.title, () => {
        if (testCase.error) {
          expect(() => {
            gAdapter.getSQLForCreateTable(...testCase.args)
          }).toThrow(testCase.error)
        } else {
          expect(gAdapter.getSQLForCreateTable(...testCase.args)).toStrictEqual(testCase.result)
        }
      })
    )
  })

  describe("createTable", () => {
    const testCases = [
      {
        title: "create table with all possible data types and 1 virtual field",
        args: [
          "testtable",
          {
            properties: {
              p1: {
                type: "string",
                default: "defVal",
              },
              p2: {
                type: "boolean",
              },
              p3: {
                type: "bigInteger",
              },
              p4: {
                type: "text",
              },
              p5: {
                type: "float",
              },
              p6: {
                type: "decimal",
              },
              p7: {
                type: "date",
              },
              p8: {
                type: "dateTime",
              },
              p9: {
                type: "time",
              },
              p10: {
                type: "binary",
              },
              p11: {
                type: "json",
              },
              p12: {
                type: "jsonb",
              },
              p13: {
                type: "uuid",
              },
              p14: {
                type: "integer",
                default: 10,
              },
              p15: {
                type: "integer",
                virtual: true,
              },
            },
            required: ["p1", "p2"],
          },
        ],
      },
      {
        title: "create table with incorrect data type",
        args: [
          "testtable1",
          {
            properties: {
              p1: {
                type: "integer",
              },
              p2: {
                type: "wrongtype",
              },
              required: ["p1"],
            },
          },
        ],
        error: "Adapter.INCORRECT_DATA_TYPE",
      },
      {
        title: "create table with id field, without required array and with uniqueKeys constraint",
        args: [
          "testtable2",
          {
            uniqueKeys: {
              someKeysSet: ["p1", "p3"],
            },
            properties: {
              id: {
                type: "integer",
              },
              p1: {
                type: "integer",
              },
              p2: {
                type: "string",
              },
              p3: {
                type: "integer",
              },
            },
          },
        ],
      },
    ]

    beforeAll(async () => {
      for (let testCase of testCases) {
        await gAdapter.knex.raw(getDropQueryForTable(testCase.args[0]))
      }
    })

    testCases.forEach(testCase =>
      it(testCase.title, async () => {
        if (testCase.error) {
          await expect(gAdapter.createTable(...testCase.args)).rejects.toThrow(testCase.error)
        } else {
          await gAdapter.createTable(...testCase.args)
          await gAdapter
            .knex(testCase.args[0])
            .columnInfo()
            .then(info => {
              expect(
                Object.keys(_.omit(info, "id")).length
              ).toStrictEqual(
                Object.keys(
                  _.omitBy(testCase.args[1].properties, (property, key) => property.virtual || key === "id")
                ).length
              )
              for (let property in testCase.args[1].properties) {
                switch (testCase.args[1].properties[property].type) {
                  case "string":
                    expect(info[property].type).toStrictEqual("character varying")
                    break
                  case "bigInteger":
                    expect(info[property].type).toStrictEqual("bigint")
                    break
                  case "float":
                    expect(info[property].type).toStrictEqual("real")
                    break
                  case "decimal":
                    expect(info[property].type).toStrictEqual("numeric")
                    break
                  case "dateTime":
                    expect(info[property].type).toStrictEqual("timestamp with time zone")
                    break
                  case "time":
                    expect(info[property].type).toStrictEqual("time without time zone")
                    break
                  case "binary":
                    expect(info[property].type).toStrictEqual("bytea")
                    break
                  default:
                    if (!testCase.args[1].properties[property].virtual) {
                      expect(
                        testCase.args[1].properties[property].type === info[property].type
                      ).toBeTruthy()
                    }
                }
                if (testCase.args[1].required && testCase.args[1].required.includes(property)) {
                  expect(info[property].nullable).toBeFalsy()
                }
                if (testCase.args[1].properties[property].hasOwnProperty("default")) {
                  expect(info[property].defaultValue)
                    .toEqual(expect.stringContaining(String(testCase.args[1].properties[property].default)))
                }
              }
            })
        }
      })
    )
  })

  afterAll(async () => {
    await gAdapter.shutdown()
  })
})
