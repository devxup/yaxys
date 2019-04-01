const SyncService = require("../core/services/SyncService.js")
global.config = require("config")
global._ = require("lodash")

describe("SyncService", () => {
  describe("_getURL", () => {
    const testCases = [
      {
        title: "Simple case",
        webhookConfig: {
          "url": "https://somewhere.com",
          "additionalGetParameters": { "a": 1 },
        },
        args: ["create", "user", 1],
        result: "https://somewhere.com/?a=1&verb=create&entity=user&id=1",
      },
      {
        title: "GET-parameters override with option",
        webhookConfig: {
          "url": "https://somewhere.com",
          "additionalGetParameters": { a: 1, "entity": "abc" },
        },
        args: ["update", "user", 1],
        result: "https://somewhere.com/?a=1&entity=user&verb=update&id=1",
      },
      {
        title: "GET-parameters override with URL",
        webhookConfig: {
          "url": "https://somewhere.com?a=2&verb=delete",
          "additionalGetParameters": { a: 1, "entity": "abc" },
        },
        args: ["update", "user", 1],
        result: "https://somewhere.com/?a=1&verb=update&entity=user&id=1",
      },
    ]

    let configBuffer
    beforeAll(() => configBuffer = global.config.get)
    afterAll(() => global.config.get = configBuffer)

    testCases.forEach(testCase => it(testCase.title, async () => {
      global.config.get = () => testCase.webhookConfig

      expect(SyncService._getURL.apply(SyncService, testCase.args)).toStrictEqual(testCase.result)
    }))
  })
})
