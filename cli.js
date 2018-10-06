const config = require("config");
const App = require(__dirname + "/core/classes/App");
const minimist = require("minimist");

global.yaxys = new App();
yaxys.init()
  .then(async () => {
    const argv = minimist(process.argv.slice(2));
    const commandsHash = {
      async init_db() {
        await ModelService.createTablesForAllModels();
        yaxys.logger.info("done");
      },
      get_sql() {
        console.log(ModelService.getSQLForAllModels());
      },
      async create_operator() {
        if (!argv.email) {
          yaxys.logger.error("Email is required!");
          return;
        }
        if (!argv.pwd) {
          yaxys.logger.error("Password is required!");
          return;
        }
        await yaxys.db.insert("operator", { email: argv.email, passwordHash: AuthService.encryptPassword(String(argv.pwd)) });
        yaxys.logger.info("done");
      },
      encrypt_password() {
        console.log(AuthService.encryptPassword(String(argv._[1])));
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
