/*_getSQLForProperty () {}

_getSQLForSchema () {

}*/

module.exports = {

    getSQLForAllModels () {

    },

    async createTableForSchema (identity, jsonSchema) {
        await yaxys.db.createTable(identity, jsonSchema);
    },

    async createTableForAllModels () {
        for (let model in yaxys.models) {
            await createTableForSchema (model, yaxys.models[model]);
        }
    }
}