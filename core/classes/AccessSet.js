const MODE = {
  EQUIPMENT: "equipment",
  USER: "user",
}

/**
 * @typedef {Object} CredentialAccess
 * @property {Integer} accessPoint - the AccessPoint id
 * @property {Integer} credentialId - the Credential id
 * @property {String} credentialCode - the Credential code
 * @property {Integer} accessRight - the AccessRight id
 *
 * This structure contains information about given access
 * For now, it contains only credential and accessPoint properties
 * (and accessRight id to track where this rule come from))
 * Later we'll probably add schedule information into it
 */

/**
 * @typedef {Object} UserAccess
 * @property {Integer} accessPoint - the AccessPoint id
 * @property {String} user - the user id
 * @property {Integer} accessRight - the AccessRight id
 *
 * Auxilary structure to be converted into CredentialAccess
 */

module.exports = class AccessSet {
  /**
   * Construct the AccessSet
   * @param {integer} mode The AccessSet mode, one of MODE enum
   * @param {object} patch The object to patch each CredentialAccess structure
   */
  constructor(mode, patch) {
    this.list = []
    this.hash = {}

    this.mode = mode
    this.patch = patch
  }

  _getHashKey() {
    return this.mode === MODE.EQUIPMENT ? "user" : "accessPoint"
  }

  /**
   * Check should we add given UserAccess into list or not
   * Now it checks just for duplicates
   * Later it can analyze scheduling information also
   * @param {UserAccess} access The access to check
   * @returns {boolean} Should we add it or not
   * @private
   */
  _shouldAddUserAccess(access) {
    const key = this._getHashKey()
    return !this.hash[access[key]]
  }

  /**
   * Add given UserAccess into list if possible
   * @param {UserAccess} access The access to add
   * @private
   */
  _addUserAccess(access) {
    const key = this._getHashKey()
    if (!this._shouldAddUserAccess(access)) { return }
    this.list.push(access)
    this.hash[access[key]] = access
  }

  /**
   * Bulk add accessRights into the class instance
   * @param {Object[]} accessRights The list of accessRights to add
   */
  async bulkAddAccessRights(accessRights) {
    for (const accessRight of accessRights) {
      await this.addAccessRight(accessRight)
    }
  }

  /**
   * Analyze, populate and add into the list
   * all the related information about given accessRight
   * @param {Object} accessRight The accessRight to add
   */
  async addAccessRight(accessRight) {
    switch (this.mode) {
      case MODE.EQUIPMENT: {
        if (accessRight.user) {
          this._addUserAccess({
            ...this.patch,
            user: accessRight.user,
            accessRight: accessRight.id,
          })
        } else if (accessRight.userProfile) {
          const profile = await yaxys.db.findOne(null, "userprofile", { id: accessRight.userProfile }, { populate: "users" })
          for (const user of profile.users) {
            this._addUserAccess({
              ...this.patch,
              user: user.id,
              accessRight: accessRight.id,
            })
          }
        } else {
          throw new Error(yaxys.t("AccessSet.INVALID_ACCESS_RIGHT_FOUND", { id: accessRight.id }))
        }
        break
      }
      case MODE.USER: {
        if (accessRight.accessPoint) {
          this._addUserAccess({
            ...this.patch,
            accessPoint: accessRight.accessPoint,
            accessRight: accessRight.id,
          })
        } else if (accessRight.door) {
          const accessPoints = await yaxys.db.find(null, "accesspoint", { door: accessRight.door })
          for (const accessPoint of accessPoints) {
            this._addUserAccess({
              ...this.patch,
              accessPoint: accessPoint.id,
              accessRight: accessRight.id,
            })
          }
        } else if (accessRight.zoneTo) {
          const accessPoints = await yaxys.db.find(null, "accesspoint", { zoneTo: accessRight.zoneTo })
          for (const accessPoint of accessPoints) {
            this._addUserAccess({
              ...this.patch,
              accessPoint: accessPoint.id,
              accessRight: accessRight.id,
            })
          }
        } else {
          throw new Error(yaxys.t("AccessSet.INVALID_ACCESS_RIGHT_FOUND", { id: accessRight.id }))
        }
        break
      }
      default:
        throw new Error(yaxys.t("AccessSet.INVALID_MODE", { mode: this.mode }))
    }
  }

  /**
   * Converts <UserAccess> structures from this.list
   * into <CredentialAccess> by populating them, and return the result
   * @returns {Promise<CredentialAccess[]>} The list of CredentialAccess
   */
  async getCredentialAccessList() {

    switch (this.mode) {
      case MODE.EQUIPMENT: {
        const credentialList = []
        for (const userAccess of this.list) {
          const credentials = await yaxys.db.find(null, "credential", { user: userAccess.user }, { "select": ["id", "code"] })
          for (const credential of credentials) {
            credentialList.push({
              credentialId: credential.id,
              credentialCode: credential.code,
              ..._.omit(userAccess, "user"),
            })
          }
        }
        return credentialList
      }
      case MODE.USER: {
        return this.list.map(item => _.omit(item, "user"))
      }
      default:
        throw new Error(yaxys.t("AccessSet.INVALID_MODE", { mode: this.mode }))
    }
  }
}
module.exports.MODE = MODE
