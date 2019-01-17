module.exports = {
  async checkDoorAccessPointsCount(doorId, trx) {
    const amount = await yaxys.db.count("accesspoint", {
      door: doorId,
    }, trx)
    if (amount >= 2) { throw new Error("zoneService.TOO_MUCH_APS") }
  },
}
