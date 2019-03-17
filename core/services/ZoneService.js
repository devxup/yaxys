module.exports = {
  async checkDoorAccessPointsCount(trx, doorId) {
    const amount = await yaxys.db.count(trx, "accesspoint", {
      door: doorId,
    }, trx)
    if (amount >= 2) { throw new Error("zoneService.TOO_MUCH_APS") }
  },
}
