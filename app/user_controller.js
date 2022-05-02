const path = require('path');
const db = require('../app/db_connection');
const crypto = require('crypto');

let failed = false;
let exists = false;
let userDTO = {};
let authTokens = {};

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

exports.authTokens = authTokens;

exports.getLoginForm = function (req, res) {
    res.render(path.resolve(__dirname + '/../templates/login.twig'), {failed: failed});
    failed = false;
};

exports.logIn = function (req, res) {
    let queryStr = 'SELECT * FROM "Customers" ' +
        'WHERE "Login" = \'' + req.body.username +
        '\' AND "Password" = \'' + req.body.password + '\';';
    db.query(queryStr, (err, result) => {
        if (!err) {
            if (result.rows.length) {
                console.log("Authenticated");
                //console.log(result.rows);
                let token = generateAuthToken();
                authTokens[token] = result.rows[0];
                res.cookie('AuthToken', token);
                return res.redirect('/home');
            } else {
                console.log("Authentication failed!");
                failed = true;
                return res.redirect('/login');
            }
        }
        console.log(err);
        res.statusCode = 500;
        res.end("Unknown Error");
    });
}

exports.getRegistrationForm = function (req, res) {
    res.render(path.resolve(__dirname + '/../templates/registration.twig'), {userExists: exists, userDTO: userDTO});
    exists = false;
    userDTO = {};
}

exports.registerUser = function (req, res) {
    let queryStr = 'INSERT INTO "Customers" ("Login", "Password", "Birth_date", "Email"';
    if (req.body.first_name != "")
        queryStr += ', "First_name"';
    if (req.body.surname != "")
        queryStr += ', "Surname"';
    if (req.body.last_name != "")
        queryStr += ', "Last_name"';
    queryStr += ') values (\'' + req.body.username + '\', \'' + req.body.password + '\', \'' +
        req.body.birth_date + '\', \'' + req.body.email + '\'';
    if (req.body.first_name != "")
        queryStr += ', \'' + req.body.first_name + '\'';
    if (req.body.surname != "")
        queryStr += ', \'' + req.body.surname + '\'';
    if (req.body.last_name != "")
        queryStr += ', \'' + req.body.last_name + '\'';
    queryStr += ');';
    console.log(queryStr);
    db.query(queryStr, (err, result) => {
        userDTO.first_name = req.body.first_name;
        userDTO.surname = req.body.surname;
        userDTO.last_name = req.body.last_name;
        userDTO.email = req.body.email;
        userDTO.birth_date = req.body.birth_date;
        userDTO.password = req.body.password;
        if (!err) {
            console.log("User registered!");
            let token = generateAuthToken();
            authTokens[token] = userDTO;
            res.cookie('AuthToken', token);
            return res.redirect('/home');
        }
        console.log(err);
        exists = true;
        return res.redirect('/registration')
    });
}