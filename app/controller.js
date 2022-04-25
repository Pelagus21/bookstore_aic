const {Client} = require('pg');

const path = require('path');

const client = new Client({
    host: "heffalump.db.elephantsql.com",
    user: "bnjhbbyr",
    port: 5432,
    password: "PzYsKZGDwrnZ_6j4buhyh7dpUtuCja3u",
    database: "bnjhbbyr"
});

client.connect();

let failed = false;
let exists = false;

exports.getLoginForm = function(req, res) {
    res.render(path.resolve(__dirname + '/../templates/login.twig'), { failed : failed });
    failed = false;
};

exports.getHomePage = function(req,  res) {
    res.render(path.resolve(__dirname + '/../templates/home.twig'));
}

exports.logIn = function (req, res) {
    let queryStr = 'SELECT * FROM public."Customers" ' +
                    'WHERE "Login" = \'' + req.body.username +
                    '\' AND "Password" = \'' + req.body.password + '\';';
    client.query(queryStr, (err, result) => {
        if(!err) {
            if(result.rows.length) {
                console.log("Authenticated");
                console.log(result.rows);
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

exports.getRegistrationForm = function(req, res) {
    res.render(path.resolve(__dirname + '/../templates/registration.twig'), {userExists : exists});
    exists = false;
}

exports.registerUser = function(req, res) {
    //let queryStr = 'INSERT INTO public."Customers" ("Login", "First_name", "Last_name")'
}