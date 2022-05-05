const path = require('path');
const bookRepo = require('../app/books_repository');


exports.getAdminBooksPage = function (req, res) {
    bookRepo.getAllBooks()
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

function errorResponse(res, err) {
    console.log(err);
    res.statusCode = 500;
    res.end('Unknown error');
}

exports.getEditBookPage = function (req, res) {
    bookRepo.getBookById(req.params.id)
    .then(
        (result1) => {
            bookRepo.getGenresOfBook(req.params.id)
            .then(
                (result2) => {
                    bookRepo.getAuthorsOfBook(req.params.id)
                    .then(
                        (result3) => {
                            res.render(path.resolve(__dirname + '/../templates/editBook.twig'),
                                {
                                    book : result1.rows[0],
                                    genres : result2.rows,
                                    authors : result3.rows
                                });
                        },
                        (error3) => {
                            errorResponse(res, error3)
                        }
                    );
                },
                (error2) => {
                    errorResponse(res, error2);
                }
            );
        },
        (error) => {
            errorResponse(res, error);
        }
    );
}