let express = require('express');

let router = express.Router();

let controller = require('../app/controller');

let userController = require('../app/user_controller')

router.use((req, res, next) => {
    if(!req.user) {
        const authToken = req.cookies['AuthToken'];
        req.user = userController.authTokens[authToken];
    }
    next();
});

router.get('/login', userController.getLoginForm);

router.get('/registration', userController.getRegistrationForm);

router.get('*', (req, res, next) => {
    if(!req.user)
        res.redirect('/login');
    else
        next();
});


router.post('/login', userController.logIn);

router.get('/home', controller.getHomePage);

router.post('/registration', userController.registerUser);

router.get('/book/:id', controller.getBook);

router.get('/author/:id', controller.getAuthor);

router.get('/genre/:id', controller.getGenre);

router.get('/genres', controller.getGenres);

// router.post('/addEmail', controller.addEmail);
//
// //used in order to delete item
// router.get('/deleteEmail/:id', controller.deleteEmail);
//
// router.post('/updateEmail/:id', controller.updateEmail);
//
// router.post('/sendEmail', controller.sendEmail);

module.exports.router = router;