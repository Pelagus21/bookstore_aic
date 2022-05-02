const path = require('path');
const db = require('../app/db_connection');

exports.getHomePage = async function (req, res) {
    let queryStr = 'SELECT "Id", "Genre_name" FROM "Genres"';

    await db.query(queryStr, async (err, result) =>
    {
        if (!err)
        {
            if (result.rows.length)
            {
                let genreWithBooks = [];
                for(let i = 0; i < result.rows.length; ++i)
                {
                    let getBooksOfThisGenre = 'SELECT *' +
                        'FROM "Books_Genres" INNER JOIN "Books" ON "Book_id" = "Id"' +
                        'WHERE "Genre_id" = ' + result.rows[i].Id;
                    genreWithBooks.push(await db.query(getBooksOfThisGenre).then((resInner) =>
                    {
                        return {genre: result.rows[i], books: resInner.rows};
                    }));
                }
                return res.render(path.resolve(__dirname + '/../templates/home.twig'), {res: genreWithBooks});
            }
        }
    });
}

//get book page by id
exports.getBook = function (req, res) {
    let queryStr = 'SELECT * FROM "Books" WHERE "Id" = ' + req.params.id + ';';
    db.query(queryStr)
        .then((res1) => {
            if (res1.rows.length) {
                let qstr2 = 'SELECT "Id", "First_name", "Surname"' +
                    'FROM "Authors"' +
                    'WHERE "Id" IN (' +
                    'SELECT "Author_id"' +
                    'FROM "Books_Authors"' +
                    'WHERE "Book_id" = ' + req.params.id + ');';
                db.query(qstr2)
                    .then((res2) => {
                        let qstr3 = 'SELECT "Id", "Genre_name"' +
                            'FROM "Genres"' +
                            'WHERE "Id" IN (' +
                            'SELECT "Genre_id"' +
                            'FROM "Books_Genres"' +
                            'WHERE "Book_id" = ' + req.params.id + ');';
                        db.query(qstr3)
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
    db.query(queryStr)
        .then((res1) => {
            if (res1.rows.length) {
                let subqr = 'SELECT "Book_id"' +
                    'FROM "Books_Authors"' +
                    'WHERE "Author_id" = ' + req.params.id;
                //find books of concrete author
                let qstr2 = 'SELECT "Id", "Book_name"' +
                    'FROM "Books"' +
                    'WHERE "Id" IN (' + subqr + ');';
                db.query(qstr2)
                    .then((res2) => {
                        //find author book genres
                        let qstr3 = 'SELECT "Id", "Genre_name"' +
                            'FROM "Genres"' +
                            'WHERE "Id" IN (' +
                            'SELECT "Genre_id"' +
                            'FROM "Books_Genres"' +
                            'WHERE "Book_id" IN (' + subqr + '));';
                        db.query(qstr3)
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
    db.query(queryStr)
        .then((res1) => {
            if (res1.rows.length) {
                let subqr = 'SELECT "Book_id"' +
                    'FROM "Books_Genres"' +
                    'WHERE "Genre_id" = ' + req.params.id;
                //find books of concrete genre
                let qstr2 = 'SELECT "Id", "Book_name"' +
                    'FROM "Books"' +
                    'WHERE "Id" IN (' + subqr + ');';
                db.query(qstr2)
                    .then((res2) => {
                        //find genre authors
                        let qstr3 = 'SELECT "Id", "First_name", "Surname"' +
                            'FROM "Authors"' +
                            'WHERE "Id" IN (' +
                            'SELECT "Author_id"' +
                            'FROM "Books_Authors"' +
                            'WHERE "Book_id" IN (' + subqr + '));';
                        db.query(qstr3)
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