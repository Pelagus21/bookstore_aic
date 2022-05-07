const path = require('path');
const bookRepo = require('../app/books_repository');
const genreRepo = require('../app/genres_repository');
const authorRepo = require('../app/authors_repository');

let _bookUpdated = false;

exports.getAdminBooksPage = function (req, res) {
    bookRepo.getBooksSortedByPopularity()
    .then(
        (result) => {
            res.render(path.resolve(__dirname + '/../templates/adminBooks.twig'),
                {books : result.rows});
        },
        (error) => {
            console.log(error);
            res.statusCode = 500;
            res.end('Unknown error');
        }
    );
}

exports.deleteBook = function(req, res) {
    bookRepo.deleteBook(req.params.id)
    .then(
        (result) => {
            console.log("Book deleted");
            res.redirect('/adminBooks');
        },
        (error) => {
            console.log(error);
            res.statusCode = 500;
            res.end('Something went wrong');
        }
    );
}

exports.deleteAuthor = function(req, res) {
    authorRepo.deleteAuthor(req.params.id)
        .then(
            (result) => {
                console.log("Author deleted");
                res.redirect('/adminAuthor');
            },
            (error) => {
                console.log(error);
                res.end('Cannot delete author who currently has books');
            }
        );
}

function errorResponse(res, err) {
    console.log(err);
    res.statusCode = 500;
    res.end('Unknown error');
}

exports.getEditBookPage = async function (req, res) {
    let res1 = await bookRepo.getBookById(req.params.id);
    if(res1.rows.length) {
        let res2 = await bookRepo.getGenresOfBook(req.params.id);
        let res3 = await bookRepo.getAuthorsOfBook(req.params.id);
        let res4 = await genreRepo.getAllGenres();
        let res5 = await authorRepo.getAllAuthors();
        res.render(path.resolve(__dirname + '/../templates/editBook.twig'),
            {
                book: res1.rows[0],
                genres: res2.rows,
                authors: res3.rows,
                all_genres: res4.rows,
                all_authors: res5.rows,
                updated: _bookUpdated
            });
        _bookUpdated = false;
    } else {
        res.statusCode = 404;
        res.end("Book not found");
    }
}


exports.updateBook = function (req, res) {
    bookRepo.updateBookFields(req.params.id, req.body.data)
    .then(
        (result) => {
            return bookRepo.insertBookAuthors(req.params.id, req.body.data.authors_ids);
        }
    )
    .then(
        (result) => {
            return bookRepo.insertBookGenres(req.params.id, req.body.data.genres_ids);
        }
    )
    .then(
        (result) => {
            console.log("Book updated");
            _bookUpdated = true;
            res.send('Updated');
        }
    );
}

exports.getAdminAuthorsPage = function (req, res) {
    authorRepo.getAuthorsSortedByPopularity()
        .then(
            (result) => {
                res.render(path.resolve(__dirname + '/../templates/adminAuthors.twig'),
                    {authors : result.rows});
            },
            (error) => {
                console.log(error);
                res.statusCode = 500;
                res.end('Unknown error');
            }
        );
}

exports.getAdminGenresPage = function (req, res) {
    genreRepo.getGenresSortedByPopularity()
        .then(
            (result) => {
                res.render(path.resolve(__dirname + '/../templates/adminGenres.twig'),
                    {
                        genres : result.rows,
                        flagP : true
                    });
            },
            (error) => {
                console.log(error);
                res.statusCode = 500;
                res.end('Unknown error');
            }
        );
}

exports.getGenresInAllOrders = function (req, res) {
    genreRepo.getGenresInAllOrders()
        .then(
            (result) => {
                res.render(path.resolve(__dirname + '/../templates/adminGenres.twig'),
                    {
                        genres : result.rows,
                        flagP : false
                    });
            },
            (error) => {
                console.log(error);
                res.statusCode = 500;
                res.end('Unknown error');
            }
        );
}
