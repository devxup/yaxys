/* eslint-disable no-console */

const App = require(__dirname + "/core/classes/App")
const minimist = require("minimist")

global.yaxys = new App()
yaxys
  .init()
  .then(async () => {
    const argv = minimist(process.argv.slice(2))
    const commandsHash = {
      async init_db() {
        await ModelService.createTablesForAllModels()
        yaxys.logger.info(yaxys.t("cli.INIT_DB_SUCCESS"))
      },
      get_sql() {
        console.log(ModelService.getSQLForAllModels())
      },
      async create_operator() {
        if (!argv.email && !argv.login) {
          yaxys.logger.error(yaxys.t("cli.EMAIL_OR_LOGIN_REQUIRED"))
          return
        }
        if (!argv.pwd) {
          yaxys.logger.error(yaxys.t("cli.PASSWORD_REQUIRED"))
          return
        }
        await yaxys.db.insert(null, "operator", {
          ...(argv.email ? { email: argv.email } : {}),
          ...(argv.login ? { login: argv.login } : {}),
          passwordHash: AuthService.encryptPassword(String(argv.pwd)),
          rights: {},
          isAdministrator: true,
        })
        yaxys.logger.info(yaxys.t("cli.CREATE_OPERATOR_SUCCESS"))
      },
      encrypt_password() {
        console.log(AuthService.encryptPassword(String(argv._[1])))
      },
    }

    const command = argv._[0]
    if (!command || command === "help") {
      yaxys.logger.info(`${yaxys.t("cli.POSSIBLE_COMMANDS")} ${Object.keys(commandsHash).join(", ")}`)
      await yaxys.db.shutdown()
      process.exit(0)
    }

    if (!commandsHash[command]) {
      yaxys.logger.error(yaxys.t("cli.COMMAND_NOT_FOUND", { command }))
      await yaxys.db.shutdown()
      process.exit(1)
    }
    await commandsHash[command]()
    await yaxys.db.shutdown()

    process.exit(0)
  })
  .catch(err => {
    yaxys.logger.error(yaxys.t("cli.ERROR"), err)
    process.exit()
  })
