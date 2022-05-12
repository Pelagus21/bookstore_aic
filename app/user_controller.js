const path = require('path');
const userRepo = require('../app/user_repository');
const crypto = require('crypto');

let failed = false;
let exists = false;
let userDTO = {};
let authTokens = {};
let adminTokens = {};
let updated = false;

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

exports.authTokens = authTokens;
exports.adminTokens = adminTokens;

exports.getLoginForm = function (req, res) {
    res.render(path.resolve(__dirname + '/../templates/login.twig'), {failed: failed});
    failed = false;
};

exports.logIn = function (req, res) {
    res.clearCookie('AuthToken');
    res.clearCookie('AdminToken');
    userRepo.findCustomerByCredentials(req.body.username, req.body.password)
    .then(
        (result) => {
            if (result.rows.length) {
                console.log("Authenticated");
                let token = generateAuthToken();
                authTokens[token] = result.rows[0];
                res.cookie('AuthToken', token);
                res.redirect('/home');
            } else {
                userRepo.findAdminByCredentials(req.body.username, req.body.password)
                .then(
                    (res2) => {
                        if(res2.rows.length) {
                            console.log("Admin authenticated");
                            let token = generateAuthToken();
                            adminTokens[token] = res2.rows[0];
                            res.cookie('AdminToken', token);
                            res.redirect('/adminBooks');
                        } else {
                            console.log("Authentication failed!");
                            failed = true;
                            res.redirect('/login');
                        }
                    }
                );
            }
        },
        (error) => {
            console.log(error);
            res.statusCode = 500;
            res.end("Error: Something went wrong");
        }
    );
}

exports.logOut = function (req, res) {
    let token = req.cookies['AuthToken'];
    delete authTokens[token];
    res.clearCookie('AuthToken');
    res.redirect('/login');
}

exports.admLogOut = function (req, res) {
    let token = req.cookies['AdminToken'];
    delete adminTokens[token];
    res.clearCookie('AdminToken');
    res.redirect('/login');
}

exports.getRegistrationForm = function (req, res) {
    res.render(path.resolve(__dirname + '/../templates/registration.twig'),
        {userExists: exists, userDTO: userDTO});
    exists = false;
    userDTO = {};
}

exports.registerUser = function (req, res) {
    userDTO.First_name = req.body.first_name;
    userDTO.Surname = req.body.surname;
    userDTO.Last_name = req.body.last_name;
    userDTO.Email = req.body.email;
    userDTO.Birth_date = req.body.birth_date;
    userDTO.Password = req.body.password;
    userRepo.addCustomer(req.body)
    .then(
        (result) => {
            console.log("User registered!");
            let token = generateAuthToken();
            authTokens[token] = {...userDTO};
            res.cookie('AuthToken', token);
            res.redirect('/home');
        },
        (error) => {
            console.log(error);
            exists = true;
            res.redirect('/registration');
        }
    );
}

exports.getProfilePage = function (req, res) {
    let usr = {...req.user};
    if(typeof usr.Birth_date == 'object') {
        let d = new Date(req.user.Birth_date);
        let mon = d.getMonth() + 1;
        let date = d.getDate();
        usr['Birth_date'] = d.getFullYear() + '-' + (mon < 10 ? '0' + mon : mon) + '-' + (date < 10 ? '0' + date : date);
    }
    res.render(path.resolve(__dirname + '/../templates/customerProfile.twig'),
        {user : usr, updated : updated});
    updated = false;
}

exports.deleteCustomerAccount = function (req, res) {
    userRepo.deleteCustomer(req.user.Login)
    .then(
        (result) => {
            let token = req.cookies['AuthToken'];
            delete authTokens[token];
            res.clearCookie('AuthToken');
            req.user = undefined;
            console.log('Customer deleted!');
            res.redirect('/login');
        },
        (error) => {
            res.statusCode = 500;
            res.end("Error: Something went wrong");
        }
    );
}

exports.updateCustomerProfile = function (req, res) {
    let usr = {...req.user};
    let d = new Date(req.user.Birth_date);
    userRepo.updateCustomer(usr.Login, req.body)
    .then(
        (result) => {
            console.log("Customer updated!");
            updated = true;
            usr.First_name = req.body.first_name;
            usr.Surname = req.body.surname;
            usr.Last_name = req.body.last_name;
            usr.Password = req.body.password;
            usr.Birth_date = req.body.birth_date;
            authTokens[req.cookies['AuthToken']] = usr;
            req.user = undefined;
            res.redirect('/customerProfile');
        },
        (error) => {
            console.log(err);
            res.statusCode = 500;
            res.end("Error: Something went wrong");
        }
    );
}
