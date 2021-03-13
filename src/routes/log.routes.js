const Logs = require('../controllers/logs.controller');

module.exports = (app) => {

  app.get('/logs', Logs.getLog);

}