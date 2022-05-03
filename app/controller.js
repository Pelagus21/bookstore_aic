const path = require('path');

const db = require('../app/db_connection');
const genresRepo = require('../app/genres_repository');
const authorsRepo = require('../app/authors_repository');
const booksRepo = require('../app/books_repository');

exports.getHomePage = function (req, res) {
    let queryStr = 'select "Id", "Book_name", "Popularity"\n' +
        'from "Books" inner join (\n' +
        'select "Book_id", count(*) as "Popularity"\n' +
        'from "Books_Orders"\n' +
        'group by "Book_id") as "Res1" on "Books"."Id" = "Res1"."Book_id"\n' +
        'order by "Popularity" desc';

    db.query(queryStr, async (err, result) => {
        if (!err) {
            if (result.rows.length) {
                return res.render(path.resolve(__dirname + '/../templates/home.twig'), {books: result.rows});
            }
        }
    });
}

//get book page by id
exports.getBook = function (req, res) {
    booksRepo.getBookById(req.params.id)
    .then((res1) => {
        if (res1.rows.length) {
            booksRepo.getAuthorsOfBook(req.params.id)
            .then((res2) => {
                booksRepo.getGenresOfBook(req.params.id)
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
    authorsRepo.getAuthorById(req.params.id)
    .then((res1) => {
        if (res1.rows.length) {
            authorsRepo.getBooksOfAuthor(req.params.id)
            .then((res2) => {
                authorsRepo.getGenresOfAuthor(req.params.id)
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

exports.getGenres = async function (req, res) {
    let getGenresAndNumOfReadBooks = 'SELECT "Helper_genre_num_of_readers"."count", "Helper_genre_num_of_readers"."Id_of_genre", "Genre_name"' +
        'FROM "Helper_genre_num_of_readers" INNER JOIN "Genres" ON "Genres"."Id" = "Id_of_genre"' +
        'ORDER BY "count" DESC';

    await db.query(getGenresAndNumOfReadBooks, async (err, result) => {
        if (!err) {
            if (result.rows.length) {
                let genreWithBooks = [];
                for (let i = 0; i < result.rows.length; ++i) {
                    let getBooksOfThisGenre = 'SELECT "Books_Authors"."Book_id", "Book_name", "Description", ' +
                        '"Price", "Image_url", "Author_id", CONCAT("First_name", \' \', "Surname", ' +
                        'COALESCE(\'-\' || "Last_name", \'\')) AS "author_name"' +

                        'FROM (("Books_Genres" INNER JOIN "Books" ON "Book_id" = "Id") ' +
                        'INNER JOIN "Books_Authors" ON "Books_Authors"."Book_id" = "Books"."Id") INNER JOIN "Authors"' +
                        'ON "Books_Authors"."Book_id" = "Authors"."Id"' +
                        'WHERE "Genre_id" = ' + result.rows[i].Id_of_genre;
                    genreWithBooks.push(await db.query(getBooksOfThisGenre).then((resInner) => {
                        return {genre: result.rows[i], books: resInner.rows};
                    }));
                }
                return res.render(path.resolve(__dirname + '/../templates/genres.twig'), {res: genreWithBooks});
            }
        }
    });
}

exports.getGenre = function (req, res) {
    genresRepo.getGenreById(req.params.id)
    .then((res1) => {
        if (res1.rows.length) {
            genresRepo.getBooksInGenre(req.params.id)
            .then((res2) => {
                genresRepo.getAuthorsOfGenre(req.params.id)
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