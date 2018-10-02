const _getSQLForSchema = function (identity, jsonSchema) {
  return yaxys.db.getSQLForCreateTable(identity, jsonSchema);
};

const _createTableForSchema = async function (identity, jsonSchema) {
  await yaxys.db.createTable(identity, jsonSchema);
};

module.exports = {
    getSQLForAllModels () {
        for (let model in yaxys.models) {
            yaxys.logger.info(_getSQLForSchema (model, yaxys.models[model].schema));
        }
    },

    async createTableForAllModels () {
      for (let model in yaxys.models) {
           await _createTableForSchema (model, yaxys.models[model].schema);
        }
    }
}