const ZoneService = require("../core/services/ZoneService.js")
global._ = require("lodash")

describe("ZoneService", () => {
  describe("checkDoorAccessPointsCount", () => {
    const testCases = [
      {
        title: "less than 2",
        count: 1,
      },
      {
        title: "exactly 2",
        count: 2,
      },
      {
        title: "more than two",
        count: 3,
        error: "ZoneService.TOO_MUCH_APS",
      },
    ]

    let yaxysBuffer
    beforeAll(() => yaxysBuffer = global.yaxys)
    afterAll(() => global.yaxys = yaxysBuffer)

    testCases.forEach(testCase => it(testCase.title, async () => {
      global.yaxys = {
        db: {
          count: () => testCase.count,
        },
      }
      const promise = ZoneService.checkDoorAccessPointsCount(1)
      if (testCase.error) {
        await expect(promise).rejects.toThrow(testCase.error)
      } else {
        await expect(promise).resolves.toEqual(undefined)
      }
    }))
  })
})
