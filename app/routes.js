let express = require('express');

let router = express.Router();

let controller = require('../app/controller');

let userController = require('../app/user_controller');

let adminController = require('../app/admin_controller');

router.use((req, res, next) => {
    const admToken = req.cookies['AdminToken'];
    req.admin = userController.adminTokens[admToken];
    const authToken = req.cookies['AuthToken'];
    req.user = userController.authTokens[authToken];
    next();
});


router.get('/login', userController.getLoginForm);

router.get('/registration', userController.getRegistrationForm);

router.get('*', (req, res, next) => {
    if(req.path === '/' || req.path === '/home' || req.path.includes('/book/')
        || req.path.includes('/author/') || req.path.includes('/genre'))
        return next();
    if(req.admin && checkAdminPath(req.path))
        return next();
    if(!req.user)
        return res.redirect('/login');
    if(!checkAdminPath(req.path))
        return next();
    res.redirect('/login');
});

function checkAdminPath(path) {
    return path.includes('/admin') || path.includes('/editBook/') || path === '/admLogout'
        || path.includes('/deleteBook/') || path.includes('/updateBook/')
        || path === '/addBook' || path === '/addAuthor' || path === '/addGenre'
        || path === '/genresInAllOrders' || path.includes('/editGenre/')
        || path.includes('/updateGenre/') || path.includes('/editAuthor/')
        || path.includes('/updateAuthor/');
}

router.post('/login', userController.logIn);

router.get('/', (req, res) => {
    res.redirect('/home');
})

router.get('/home', controller.getHomePage);

router.post('/registration', userController.registerUser);

router.get('/book/:id', controller.getBook);

router.get('/author/:id', controller.getAuthor);

router.get('/genre/:id', controller.getGenre);

router.get('/genres', controller.getGenres);

router.get('/addToCart/:id', controller.addToCart);

router.get('/cart', controller.cart);

router.get('/order', controller.order);

router.get('/allUsersOrders', controller.allUsersOrders);

router.get('/customerProfile', userController.getProfilePage);

router.post('/deleteCustomerAccount', userController.deleteCustomerAccount);

router.post('/updateCustomerProfile', userController.updateCustomerProfile);

router.get('/adminBooks', adminController.getAdminBooksPage);

router.post('/deleteBook/:id', adminController.deleteBook);

router.get('/editBook/:id', adminController.getEditBookPage);

router.get('/addBook', adminController.getAddBookPage);

router.post('/addBook', adminController.addBook);

router.get('/editAuthor/:id', adminController.getEditAuthorPage);

router.get('/addAuthor', adminController.getAddAuthorPage);

router.post('/addAuthor', adminController.addAuthor);

router.post('/deleteGenre/:id', adminController.deleteGenre);

router.post('/deleteAuthor/:id', adminController.deleteAuthor);

router.post('/updateAuthor/:id', adminController.updateAuthor);

router.get('/editGenre/:id', adminController.getEditGenrePage);

router.post('/updateGenre/:id', adminController.updateGenre);

router.get('/addGenre', adminController.getAddGenrePage);

router.post('/addGenre', adminController.addGenre);

router.post('/createOrder', controller.createOrder);

router.post('/registration', userController.registerUser);

router.post('/updateBook/:id', adminController.updateBook);

router.get('/adminAuthors', adminController.getAdminAuthorsPage);

router.get('/adminGenres', adminController.getAdminGenresPage);

router.get('/genresInAllOrders', adminController.getGenresInAllOrders);

router.get('/possibleFriends', controller.possibleFriends);

router.get('/queries', controller.queries);

router.get('/deleteFromOrder/:id', controller.deleteFromOrder);

router.get('/myOrders', controller.allUsersOrders);

router.post('/search', controller.search);

router.get('/logout', userController.logOut);

router.get('/admLogout', userController.admLogOut);

router.post('/searchAdmin', adminController.getBooksBySearch);

module.exports.router = router;