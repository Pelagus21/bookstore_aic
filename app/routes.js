let express = require('express');

let router = express.Router();

let controller = require('../app/controller');

let userController = require('../app/user_controller');

let adminController = require('../app/admin_controller');

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

router.get('/addToCart/:id', controller.addToCart);

router.get('/cart', controller.cart);

router.get('/order', controller.order);

router.get('/customerProfile', userController.getProfilePage);

router.post('/deleteCustomerAccount', userController.deleteCustomerAccount);

router.post('/updateCustomerProfile', userController.updateCustomerProfile);

router.get('/adminHome', controller.getAdminHomePage);

router.get('/adminBooks', adminController.getAdminBooksPage);

router.post('/deleteBook/:id', adminController.deleteBook);

router.get('/editBook/:id', adminController.getEditBookPage);

router.put('/createOrder', controller.createOrder);

router.post('/updateBook/:id', adminController.updateBook);

router.get('/adminAuthors', adminController.getAdminAuthorsPage);

router.get('/adminGenres', adminController.getAdminGenresPage);

router.get('/genresInAllOrders', adminController.getGenresInAllOrders);

module.exports.router = router;