const config = require("config");
const App = require(__dirname + "/core/classes/App");

global.yaxys = new App();
yaxys.listen(config.get("port"));

setImmediate(async () => {
  try {
    await yaxys.init();
    yaxys.logger.info("==========================================");
    yaxys.logger.info(`${config.get("title")} application started`);
    yaxys.logger.info(`Port: ${config.get("port")}`);
    yaxys.logger.info(`Environment: ${config.util.getEnv("NODE_ENV")}`);
    yaxys.logger.info("==========================================");
  } catch(err) {
    yaxys.logger.error("Failed to start");
    yaxys.logger.error(err);
  }
});
