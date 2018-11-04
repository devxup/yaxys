module.exports = {

  checkAccessRightIntegrity(trx, accessRight) {
    if (!accessRight.user && !accessRight.userProfile) {
      throw new Error("AccessRight should have user or userProfile")
    }
    if (accessRight.user && accessRight.userProfile) {
      throw new Error("AccessRight should not have user and userProfile simultaneously")
    }

    if (!accessRight.accessPoint && !accessRight.zoneTo && !accessRight.door) {
      throw new Error("AccessRight should have accessPoint, zoneTo or door property")
    }

    let alreadyHas = null;
    ["accessPoint", "zoneTo", "door"].forEach(key => {
      const value = accessRight[key]
      if (value) {
        if (alreadyHas) {
          throw new Error(`AccessRight should not have ${alreadyHas} and ${key} simultaneously`)
        }
        alreadyHas = key
      }
    })
  },

  /**
   * Update user.hasCustomRights value basing on amount of attached accessRights
   * @param {Object} trx The transaction context
   * @param {Integer} userId The user's id
   * @returns {Promise<boolean>} hasCustomRights value
   */
  async updateUserHasCustomRights(trx, userId) {
    const hasCustomRights = (await yaxys.db.count("accessright", { user: userId }, trx)) > 0
    await yaxys.db.update("user", userId, { hasCustomRights }, trx)
  },
}
