module.exports = {
  async checkDoorAccessPointsCount(doorId, trx) {
    const amount = await yaxys.db.count("accesspoint", {
      door: doorId,
    }, trx)
    if (amount > 2) { throw new Error("Integrity violation: amount of accessPoints should not be more than 2") }
  },
}
