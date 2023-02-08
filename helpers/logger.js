const logger = require("morgan");

function addMorgan(app) {
  app.use(logger("combined"));
}

module.exports = addMorgan;