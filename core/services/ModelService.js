const _getSQLForSchema = function (identity, jsonSchema) {
  return yaxys.db.getSQLForCreateTable(identity, jsonSchema);
};

const _createTableForSchema = async function (identity, jsonSchema) {
  await yaxys.db.createTable(identity, jsonSchema);
};

module.exports = {
  getSQLForAllModels () {
    let result = "";
    for (let model in yaxys.models) {
      result += _getSQLForSchema (model, yaxys.models[model].schema);
    }
    return result;
  },

  async createTablesForAllModels () {
    for (let model in yaxys.models) {
      await _createTableForSchema (model, yaxys.models[model].schema);
    }
  }
}