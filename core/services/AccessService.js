module.exports = {

  /**
   * Return the array of <CredentialAccess> by Access Point id
   * @param {String} accessPointId - access point to get CredentialAccess[] for
   * @returns {Promise<CredentialAccess[]>} The list of CredentialAccess
   */
  async getCredentialAccessesByAccessPointId(accessPointId) {
    const accessSet = new AccessSet(AccessSet.MODE.EQUIPMENT, { accessPoint: Number(accessPointId) })
    const accessPoint = await yaxys.db.findOne(null, "accesspoint", { id: accessPointId })
    if (!accessPoint) { throw new Error(yaxys.t("AccessService.AP_NOT_FOUND")) }

    await accessSet.bulkAddAccessRights(
      await yaxys.db.find(null, "accessright", { accessPoint: accessPoint.id })
    )
    if (accessPoint.door) {
      await accessSet.bulkAddAccessRights(
        await yaxys.db.find(null, "accessright", { door: accessPoint.door })
      )
    }
    if (accessPoint.zoneTo) {
      await accessSet.bulkAddAccessRights(
        await yaxys.db.find(null, "accessright", { zoneTo: accessPoint.zoneTo })
      )
    }
    return await accessSet.getCredentialAccessList()
  },

  /**
   * Return the array of <CredentialAccess> by credential code
   * @param {String} credentialCode - credential code to get CredentialAccess[] for
   * @returns {Promise<CredentialAccess[]>} The list of CredentialAccess
   */
  async getCredentialAccessesByCredentialCode(credentialCode) {
    const credential = await yaxys.db.findOne(null, "credential", { code: credentialCode })
    if (!credential) { throw new Error(yaxys.t("AccessService.CREDENTIAL_NOT_FOUND")) }
    if (!credential.user) { throw new Error(yaxys.t("AccessService.CREDENTIAL_INVALID")) }

    const user = await yaxys.db.findOne(null, "user", { id: credential.user }, { populate: "profiles" })
    if (!user) { throw new Error(yaxys.t("AccessService.USER_NOT_FOUND")) }

    const accessSet = new AccessSet(AccessSet.MODE.USER, {
      credentialCode: credentialCode,
      credentialId: Number(credential.id),
    })

    await accessSet.bulkAddAccessRights(
      await yaxys.db.find(null, "accessright", { user: user.id })
    )
    if (user.profiles && user.profiles.length) {
      await accessSet.bulkAddAccessRights(
        await yaxys.db.find(null, "accessright", { userProfile: user.profiles.map(profile => profile.id) })
      )
    }

    return await accessSet.getCredentialAccessList()
  },

  /**
   * Ensure the given access right integrity at equipment side (access point, door, zoneTo)
   * and at user side (user, userProfile)
   * If something is wrong, throw an exception
   * @param {Object} accessRight The Access Right object to check
   */
  checkAccessRightIntegrity(accessRight) {
    if (!accessRight.user && !accessRight.userProfile) {
      throw new Error("AccessService.SHOULD_HAVE_USER_OR_PROFILE")
    }
    if (accessRight.user && accessRight.userProfile) {
      throw new Error("AccessService.SHOULD_NOT_HAVE_BOTH_USER_AND_PROFILE")
    }

    if (!accessRight.accessPoint && !accessRight.zoneTo && !accessRight.door) {
      throw new Error("AccessService.SHOULD_HAVE_AP_OR_ZONE_OR_DOOR")
    }

    let alreadyHas = null;
    ["accessPoint", "zoneTo", "door"].forEach(key => {
      const value = accessRight[key]
      if (value) {
        if (alreadyHas) {
          throw Object.assign(new Error("AccessService.SHOULD_NOT_HAVE_BOTH"), { i18nData: { alreadyHas, key } })
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
