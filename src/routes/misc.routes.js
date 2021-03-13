const Misc = require('../controllers/misc.controller');

module.exports = (app) => {

  app.post('/getSubDir', Misc.getSubDir);

}