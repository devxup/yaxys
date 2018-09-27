const config = require("config");
const App = require(__dirname + "/core/classes/App");
const minimist = require("minimist");

global.yaxys = new App();
yaxys.init()
  .then(async () => {
    const argv = minimist(process.argv.slice(2));
    const commandsHash = {
      async init_db() {
        ModelService.createTableForAllModels();
      },
      get_sql() {
          ModelService.getSQLForAllModels();
      },
      create_operator() {
        yaxys.logger.error("Not implemented yet");
      }
    };

    const command = argv._[0];
    if (!command || command === "help") {
      return yaxys.logger.info(`Possible commands are: ${Object.keys(commandsHash).join(", ")}`);
    }

    if (!commandsHash[command]) {
      return yaxys.logger.error(`Command ${command} not found. Run with --help option to see the list of available commands.`);
    }
    await commandsHash[command]();
  })
  .then(() => {
    process.exit();
  })
  .catch((err) => {
    yaxys.logger.error("An error occured!", err);
    process.exit();
  });
