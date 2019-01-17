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
        error: "accessService.SHOULD_NOT_HAVE_BOTH_USER_AND_PROFILE",
      },
      {
        title: "No user and userProfile",
        accessRight: {
          zoneTo: 1,
        },
        error: "accessService.SHOULD_HAVE_USER_OR_PROFILE",
      },
      {
        title: "No accessPoint, zoneTo and door",
        accessRight: {
          user: 1,
        },
        error: "accessService.SHOULD_HAVE_AP_OR_ZONE_OR_DOOR",
      },
      {
        title: "door and zoneTo",
        accessRight: {
          user: 1,
          door: 1,
          zoneTo: 1,
        },
        error: "accessService.SHOULD_NOT_HAVE_BOTH",
      },
      {
        title: "accessPoint and zoneTo",
        accessRight: {
          user: 1,
          accessPoint: 1,
          zoneTo: 1,
        },
        error: "accessService.SHOULD_NOT_HAVE_BOTH",
      },
      {
        title: "accessPoint and door",
        accessRight: {
          user: 1,
          accessPoint: 1,
          door: 1,
        },
        error: "accessService.SHOULD_NOT_HAVE_BOTH",
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
