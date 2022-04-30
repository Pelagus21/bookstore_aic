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
let userDTO = {};

exports.getLoginForm = function(req, res) {
    res.render(path.resolve(__dirname + '/../templates/login.twig'), { failed : failed });
    failed = false;
};

exports.getHomePage = function(req,  res) {
    res.render(path.resolve(__dirname + '/../templates/home.twig'));
}

exports.logIn = function (req, res) {
    let queryStr = 'SELECT * FROM "Customers" ' +
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
    res.render(path.resolve(__dirname + '/../templates/registration.twig'), {userExists : exists, userDTO : userDTO});
    exists = false;
    userDTO = {};
}

exports.registerUser = function(req, res) {
    let queryStr = 'INSERT INTO "Customers" ("Login", "Password", "Birth_date", "Email"';
    if(req.body.first_name != "")
        queryStr += ', "First_name"';
    if(req.body.surname != "")
        queryStr += ', "Surname"';
    if(req.body.last_name != "")
        queryStr += ', "Last_name"';
    queryStr += ') values(\''+ req.body.username + '\', \'' + req.body.password + '\', \'' +
        req.body.birth_date + '\', \'' + req.body.email + '\'';
    if(req.body.first_name != "")
        queryStr += ', \'' + req.body.first_name + '\'';
    if(req.body.surname != "")
        queryStr += ', \'' +req.body.surname + '\'';
    if(req.body.last_name != "")
        queryStr += ', \'' + req.body.last_name + '\'';
    queryStr += ');';
    console.log(queryStr);
    client.query(queryStr, (err, result) => {
        if(!err){
            console.log("User registered!");
            return res.redirect('/home');
        }
        console.log(err);
        exists = true;
        userDTO.first_name = req.body.first_name;
        userDTO.surname = req.body.surname;
        userDTO.last_name = req.body.last_name;
        userDTO.email = req.body.email;
        userDTO.birth_date = req.body.birth_date;
        userDTO.password = req.body.password;
        return res.redirect('/registration')
    });
}

//get book page by id

exports.getBook = function(req, res) {
    let queryStr = 'SELECT * FROM "Books" WHERE "Id" = ' + req.params.id + ';';
    client.query(queryStr)
    .then((res1) => {
        if(res1.rows.length) {
            let qstr2 = 'SELECT "Id", "First_name", "Surname"' +
                'FROM "Authors"' +
                'WHERE "Id" IN (' +
                'SELECT "Author_id"' +
                'FROM "Books_Authors"' +
                'WHERE "Book_id" = ' + req.params.id + ');';
            client.query(qstr2)
                .then((res2) => {
                    let qstr3 = 'SELECT "Id", "Genre_name"' +
                        'FROM "Genres"' +
                        'WHERE "Id" IN (' +
                        'SELECT "Genre_id"' +
                        'FROM "Books_Genres"' +
                        'WHERE "Book_id" = ' + req.params.id + ');';
                    client.query(qstr3)
                        .then((res3) => {
                            return res.render(path.resolve(__dirname + '/../templates/bookPage.twig'),
                                {
                                    book: res1.rows[0],
                                    authors: res2.rows,
                                    genres: res3.rows
                                });
                        });
                });
        } else {
            res.statusCode = 404;
            res.end("Not found");
        }
    });
}

exports.getAuthor = function (req, res) {
    let queryStr = 'SELECT * FROM "Authors" WHERE "Id" = ' + req.params.id + ';';
    client.query(queryStr)
    .then((res1) => {
        if(res1.rows.length) {
            let subqr = 'SELECT "Book_id"' +
                'FROM "Books_Authors"' +
                'WHERE "Author_id" = ' + req.params.id;
            //find books of concrete author
            let qstr2 = 'SELECT "Id", "Book_name"' +
                'FROM "Books"' +
                'WHERE "Id" IN (' + subqr + ');';
            client.query(qstr2)
            .then((res2) => {
                //find author book genres
                let qstr3 = 'SELECT "Id", "Genre_name"' +
                    'FROM "Genres"' +
                    'WHERE "Id" IN (' +
                    'SELECT "Genre_id"' +
                    'FROM "Books_Genres"' +
                    'WHERE "Book_id" IN (' + subqr + '));';
                client.query(qstr3)
                .then((res3) => {
                    return res.render(path.resolve(__dirname + '/../templates/authorPage.twig'),
                        {
                            author: res1.rows[0],
                            books: res2.rows,
                            genres: res3.rows
                        });
                });
            });
        } else {
            res.statusCode = 404;
            res.end("Not found");
        }
    });
}

exports.getGenre = function (req, res) {
    let queryStr = 'SELECT * FROM "Genres" WHERE "Id" = ' + req.params.id + ';';
    client.query(queryStr)
        .then((res1) => {
            if(res1.rows.length) {
                let subqr = 'SELECT "Book_id"' +
                    'FROM "Books_Genres"' +
                    'WHERE "Genre_id" = ' + req.params.id;
                //find books of concrete genre
                let qstr2 = 'SELECT "Id", "Book_name"' +
                    'FROM "Books"' +
                    'WHERE "Id" IN (' + subqr + ');';
                client.query(qstr2)
                    .then((res2) => {
                        //find genre authors
                        let qstr3 = 'SELECT "Id", "First_name", "Surname"' +
                            'FROM "Authors"' +
                            'WHERE "Id" IN (' +
                            'SELECT "Author_id"' +
                            'FROM "Books_Authors"' +
                            'WHERE "Book_id" IN (' + subqr + '));';
                        client.query(qstr3)
                        .then((res3) => {
                            return res.render(path.resolve(__dirname + '/../templates/genrePage.twig'),
                                {
                                    genre: res1.rows[0],
                                    books: res2.rows,
                                    authors: res3.rows
                                });
                        });
                    });
            } else {
                res.statusCode = 404;
                res.end("Not found");
            }
        });
}