const Misc = require('../controllers/misc.controller');
const Cookie = require('../controllers/cookies.controller');

module.exports = (app) => {

  app.get('/download', Misc.download)

  // app.get('/assets', Misc.assets)

  app.get('/clearCookie', Cookie.clearCookie)

  app.get('/preview', Misc.preview)

  app.post('/changeView', Misc.changeView)

  app.post('/changePreview', Misc.changePreview)

}