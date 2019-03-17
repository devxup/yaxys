const ModelService = require("../core/services/ModelService.js")
global._ = require("lodash")

describe("ModelService", () => {
  describe("password protection", () => {
    const schema = {
      properties: {
        p1: { password: true },
        p2: {},
        p3: { password: true },
      },
    }
    describe("encryptPasswordProperties()", () => {
      let AuthServiceBuffer
      beforeAll(() => {
        AuthServiceBuffer = global.AuthService
        global.AuthService = {
          encryptPassword: password => `hash_of_${password}`,
        }
      })
      afterAll(() => (global.AuthService = AuthServiceBuffer))

      const testCases = [
        {
          title: "Both passwords",
          before: {
            p1: "A",
            p2: "B",
            p3: "C",
          },
          after: {
            p1: "hash_of_A",
            p2: "B",
            p3: "hash_of_C",
          },
        },
        {
          title: "Has empty",
          before: {
            p1: "A",
            p2: "B",
            p3: "",
          },
          after: {
            p1: "hash_of_A",
            p2: "B",
          },
        },
      ]

      testCases.forEach(testCase =>
        it(testCase.title, () => {
          ModelService.encryptPasswordProperties(testCase.before, schema)
          expect(testCase.before).toStrictEqual(testCase.after)
        })
      )
    })
    describe("removePasswordProperties()", () => {
      let AuthServiceBuffer
      beforeAll(() => {
        AuthServiceBuffer = global.AuthService
        global.AuthService = {
          encryptPassword: password => `hash_of_${password}`,
        }
      })
      afterAll(() => (global.AuthService = AuthServiceBuffer))

      const testCases = [
        {
          title: "Has both",
          before: {
            p1: "A",
            p2: "B",
            p3: "C",
          },
          after: {
            p2: "B",
          },
        },
        {
          title: "One is empty",
          before: {
            p1: "",
            p2: "B",
            p3: "",
          },
          after: {
            p2: "B",
          },
        },
      ]

      testCases.forEach(testCase =>
        it(testCase.title, () => {
          ModelService.removePasswordProperties(testCase.before, schema)
          expect(testCase.before).toStrictEqual(testCase.after)
        })
      )
    })
  })
  it("Remove read-only properties", () => {
    const schema = {
      properties: {
        p1: { readOnly: true },
        p2: {},
        p3: { readOnly: true },
        p4: { readOnly: true },
      },
    }
    let data = {
      p1: "invalid_data",
      p2: "valid_data",
      p3: null,
      p4: undefined,
    }
    const modifiedData = {
      p2: "valid_data",
    }
    ModelService.removeReadOnlyProperties(data, schema)
    expect(data).toStrictEqual(modifiedData)
  })
})
