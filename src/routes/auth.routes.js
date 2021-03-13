const Auth = require('../controllers/auth.controller')
const Files = require('../controllers/files.controller')

module.exports = (app) => {

    if(process.argv.includes("reqLogin")) {
        app.get('/login', Auth.renderLogin)
        app.post('/login', Auth.login)
        app.get('/showMyFiles', Files.renderShowMyFiles)
        app.post('/showMyFiles', Files.showMyFiles)
    }

    if(process.argv.includes("signup")) {
        app.get('/signup', Auth.renderSignup)
        app.post('/signup', Auth.addUser)
    }

    app.get('/logout', Auth.logout)
}