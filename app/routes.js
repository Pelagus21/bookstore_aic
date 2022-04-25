let express = require('express');

let router = express.Router();

let controller = require('../app/controller');

router.get('/login', controller.getLoginForm);

router.post('/login', controller.logIn);

router.get('/home', controller.getHomePage);

router.get('/registration', controller.getRegistrationForm);

router.post('/registration', controller.registerUser);
// router.post('/addEmail', controller.addEmail);
//
// //used in order to delete item
// router.get('/deleteEmail/:id', controller.deleteEmail);
//
// router.post('/updateEmail/:id', controller.updateEmail);
//
// router.post('/sendEmail', controller.sendEmail);

module.exports.router = router;