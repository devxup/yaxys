const AccessService = require("../../core/services/AccessService")
const ModelService = require("../../core/services/ModelService")
const App = require("../../core/classes/App")

let yaxysBuffer

beforeAll(async () => {
  yaxysBuffer = global.yaxys
  global.yaxys = global.yaxys = new App()
  await global.yaxys.init()
  try {
    await ModelService.dropAllTables()
  } catch(err) {
    // do nothing
  }
  await ModelService.createTablesForAllModels()
})

afterAll(async () => {
  global.yaxys.db.shutdown()
  global.yaxys = yaxysBuffer
})

const RELATED_SCHEMA_KEYS = [
  "accessPoint", "door", "zone", "user", "userProfile", "accessRight", "userProfileBinding", "credential",
]

describe("Access", () => {
  describe("getCredentialAccessesByAccessPointId", () => {
    beforeEach(async () => {
      await ModelService.clearAllTables()
    })
    const testCases = [
      {
        title: "Single ap",
        apId: 1,
        accessPoint: [
          { id: 1 },
          { id: 2 },
        ],
        user: [
          { id: 1, name: "a" },
          { id: 2, name: "b" },
        ],
        credential: [
          { id: 1, code: "12345678", user: 1 },
          { id: 2, code: "23456789", user: 2 },
        ],
        accessRight: [
          { id: 1, user: 1, accessPoint: 1 },
        ],
        result: [
          {
            "credentialId": 1,
            "credentialCode": "12345678",
            "accessPoint": 1,
            "accessRight": 1,
          },
        ],
      },
      {
        title: "Nothing is found (no accessRight)",
        apId: 1,
        accessPoint: [
          { id: 1 },
          { id: 2 },
        ],
        user: [
          { id: 1, name: "a" },
          { id: 2, name: "b" },
        ],
        credential: [
          { id: 1, code: "12345678", user: 1 },
          { id: 2, code: "23456789", user: 2 },
        ],
        result: [],
      },
      {
        title: "Works through the door",
        apId: 2,
        accessPoint: [
          { id: 1 },
          { id: 2, door: 7 },
        ],
        door: [
          { id: 7 },
        ],
        user: [
          { id: 1, name: "a" },
          { id: 2, name: "b" },
        ],
        credential: [
          { id: 1, code: "12345678", user: 1 },
          { id: 2, code: "23456789", user: 2 },
        ],
        accessRight: [
          { id: 10, user: 2, door: 7 },
        ],
        result: [
          {
            "credentialId": 2,
            "credentialCode": "23456789",
            "accessPoint": 2,
            "accessRight": 10,
          },
        ],
      },
      {
        title: "Works through the user profile and zone",
        apId: 2,
        accessPoint: [
          { id: 1 },
          { id: 2, zoneTo: 8 },
        ],
        zone: [
          { id: 8 },
        ],
        user: [
          { id: 1, name: "a" },
          { id: 2, name: "b" },
        ],
        userProfile: [
          { id: 100, name: "up1" },
        ],
        userProfileBinding: [
          { id: 1, user: 2, userProfile: 100 },
        ],
        credential: [
          { id: 1, code: "12345678", user: 1 },
          { id: 2, code: "23456789", user: 2 },
        ],
        accessRight: [
          { id: 11, userProfile: 100, zoneTo: 8 },
        ],
        result: [
          {
            "credentialId": 2,
            "credentialCode": "23456789",
            "accessPoint": 2,
            "accessRight": 11,
          },
        ],
      },
    ]

    testCases.forEach(testCase =>
      it(testCase.title, async () => {
        for (const schemaKey of RELATED_SCHEMA_KEYS) {
          for (const item of testCase[schemaKey] || []) {
            await yaxys.db.insert(null, schemaKey.toLowerCase(), item)
          }
        }

        const result = await AccessService.getCredentialAccessesByAccessPointId(testCase.apId)
        expect(result).toStrictEqual(testCase.result)
      })
    )
  })
  describe("getCredentialAccessesByCredentialCode", () => {
    beforeEach(async () => {
      await ModelService.clearAllTables()
    })
    const testCases = [
      {
        title: "Works through the door",
        credentialCode: "23456789",
        accessPoint: [
          { id: 1 },
          { id: 2, door: 7 },
          { id: 3 },
        ],
        door: [
          { id: 7 },
        ],
        user: [
          { id: 1, name: "a" },
          { id: 2, name: "b" },
        ],
        credential: [
          { id: 1, code: "12345678", user: 1 },
          { id: 2, code: "23456789", user: 2 },
        ],
        accessRight: [
          { id: 10, user: 2, door: 7 },
          { id: 11, user: 2, accessPoint: 3 },
        ],
        result: [
          {
            "credentialId": 2,
            "credentialCode": "23456789",
            "accessPoint": 2,
            "accessRight": 10,
          },
          {
            "credentialId": 2,
            "credentialCode": "23456789",
            "accessPoint": 3,
            "accessRight": 11,
          },
        ],
      },
      {
        title: "Works through the user profile and zone",
        credentialCode: "23456789",
        accessPoint: [
          { id: 1 },
          { id: 2, zoneTo: 8 },
          { id: 3 },
        ],
        zone: [
          { id: 8 },
        ],
        user: [
          { id: 1, name: "a" },
          { id: 2, name: "b" },
        ],
        userProfile: [
          { id: 100, name: "up1" },
        ],
        userProfileBinding: [
          { id: 1, user: 2, userProfile: 100 },
        ],
        credential: [
          { id: 1, code: "12345678", user: 1 },
          { id: 2, code: "23456789", user: 2 },
        ],
        accessRight: [
          { id: 11, userProfile: 100, zoneTo: 8 },
          { id: 121, user: 2, accessPoint: 3 },
          { id: 122, user: 1, accessPoint: 1 },
        ],
        result: [
          {
            "credentialId": 2,
            "credentialCode": "23456789",
            "accessPoint": 3,
            "accessRight": 121,
          },
          {
            "credentialId": 2,
            "credentialCode": "23456789",
            "accessPoint": 2,
            "accessRight": 11,
          },
        ],
      },
    ]

    testCases.forEach(testCase =>
      it(testCase.title, async () => {
        for (const schemaKey of RELATED_SCHEMA_KEYS) {
          for (const item of testCase[schemaKey] || []) {
            await yaxys.db.insert(null, schemaKey.toLowerCase(), item)
          }
        }

        const result = await AccessService.getCredentialAccessesByCredentialCode(testCase.credentialCode)
        expect(result).toStrictEqual(testCase.result)
      })
    )
  })
})
