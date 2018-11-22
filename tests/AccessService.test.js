const AccessService = require("../core/services/AccessService.js")
global._ = require("lodash")

describe("AccessService", () => {
  describe("checkAccessRightIntegrity", () => {
    const testCases = [
      {
        title: "Correct case",
        accessRight: {
          userProfile: 1,
          door: 1,
        },
      },
      {
        title: "Both user and userProfile",
        accessRight: {
          user: 1,
          userProfile: 1,
        },
        error: "AccessRight should not have user and userProfile simultaneously",
      },
      {
        title: "No user and userProfile",
        accessRight: {
          zoneTo: 1,
        },
        error: "AccessRight should have user or userProfile",
      },
      {
        title: "No accessPoint, zoneTo and door",
        accessRight: {
          user: 1,
        },
        error: "AccessRight should have accessPoint, zoneTo or door property",
      },
      {
        title: "door and zoneTo",
        accessRight: {
          user: 1,
          door: 1,
          zoneTo: 1,
        },
        error: "AccessRight should not have zoneTo and door simultaneously",
      },
      {
        title: "accessPoint and zoneTo",
        accessRight: {
          user: 1,
          accessPoint: 1,
          zoneTo: 1,
        },
        error: "AccessRight should not have accessPoint and zoneTo simultaneously",
      },
      {
        title: "accessPoint and door",
        accessRight: {
          user: 1,
          accessPoint: 1,
          door: 1,
        },
        error: "AccessRight should not have accessPoint and door simultaneously",
      },
    ]

    testCases.forEach(testCase =>
      it(testCase.title, async () => {
        const tester = () => {
          AccessService.checkAccessRightIntegrity(testCase.accessRight)
        }
        if (testCase.error) {
          expect(tester).toThrow(testCase.error)
        } else {
          tester()
        }
      })
    )
  })
})
