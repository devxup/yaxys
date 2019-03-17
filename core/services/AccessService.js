module.exports = {

  checkAccessRightIntegrity(accessRight) {
    if (!accessRight.user && !accessRight.userProfile) {
      throw new Error("accessService.SHOULD_HAVE_USER_OR_PROFILE")
    }
    if (accessRight.user && accessRight.userProfile) {
      throw new Error("accessService.SHOULD_NOT_HAVE_BOTH_USER_AND_PROFILE")
    }

    if (!accessRight.accessPoint && !accessRight.zoneTo && !accessRight.door) {
      throw new Error("accessService.SHOULD_HAVE_AP_OR_ZONE_OR_DOOR")
    }

    let alreadyHas = null;
    ["accessPoint", "zoneTo", "door"].forEach(key => {
      const value = accessRight[key]
      if (value) {
        if (alreadyHas) {
          throw Object.assign(new Error("accessService.SHOULD_NOT_HAVE_BOTH"), { i18nData: { alreadyHas, key } })
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
    const hasCustomRights = (await yaxys.db.count(trx, "accessright", { user: userId })) > 0

    await yaxys.db.update(trx, "user", userId, { hasCustomRights })
  },
}
