const path = require('path');
const bookRepo = require('../app/books_repository');
const genreRepo = require('../app/genres_repository');
const authorRepo = require('../app/authors_repository');

let _bookUpdated = false;
let _authorUpdated = false;
let _genreUpdated = false;
let _authorDeleteForbidden = undefined;
let _genreDeleteForbidden = undefined;


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
                res.redirect('/adminAuthors');
            },
            (error) => {
                _authorDeleteForbidden = req.params.id;
                res.redirect('/adminAuthors');
            }
        );
}

exports.deleteGenre = function(req, res) {
    genreRepo.deleteGenre(req.params.id)
        .then(
            (result) => {
                console.log("Genre deleted");
                res.redirect('/adminGenres');
            },
            (error) => {
                _genreDeleteForbidden = req.params.id;
                res.redirect('/adminGenres');
            }
        );
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

exports.getEditAuthorPage = function(req, res) {
    authorRepo.getAuthorById(req.params.id)
        .then(
            (result) => {
                if(result.rows.length) {
                    res.render(path.resolve(__dirname + '/../templates/editAuthor.twig'),
                        {
                            updated : _authorUpdated,
                            author : result.rows[0]
                        });
                    _authorUpdated = false;
                } else {
                    res.statusCode = 404;
                    res.end("Not found");
                }
            }
        );
}

exports.getEditGenrePage = function(req, res) {
    genreRepo.getGenreById(req.params.id)
        .then(
            (result) => {
                if(result.rows.length) {
                    res.render(path.resolve(__dirname + '/../templates/editGenre.twig'),
                        {
                            updated : _genreUpdated,
                            genre : result.rows[0]
                        });
                    _genreUpdated = false;
                } else {
                    res.statusCode = 404;
                    res.end("Not found");
                }
            }
        );
}


exports.getAddBookPage = async function (req, res) {
    let all_gens = await genreRepo.getAllGenres();
    let all_auths = await authorRepo.getAllAuthors();
    res.render(path.resolve(__dirname + '/../templates/addBook.twig'),
        {
            all_genres : all_gens.rows,
            all_authors : all_auths.rows
        });
}

exports.addBook = async function (req, res) {
    let result = await bookRepo.addBook(req.body.data);
    await bookRepo.addGenresForBook(result.rows[0].Id, req.body.data.genres_ids);
    await bookRepo.addAuthorsForBook(result.rows[0].Id, req.body.data.authors_ids);
    console.log("Book added!");
    res.statusCode = 301;
    res.send('Added');
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
            res.statusCode = 301;
            res.send('Updated');
        }
    );
}

exports.updateAuthor = function (req, res) {
    authorRepo.updateAuthor(req.params.id, req.body)
    .then(
        (result) => {
            console.log("Author updated");
            _authorUpdated = true;
            res.redirect('/editAuthor/' + req.params.id);
        }
    );
}

exports.updateGenre = function (req, res) {
    genreRepo.updateGenre(req.params.id, req.body)
        .then(
            (result) => {
                console.log("Genre updated");
                _genreUpdated = true;
                res.redirect('/editGenre/' + req.params.id);
            }
        );
}

exports.getAddAuthorPage = function (req, res) {
    res.render(path.resolve(__dirname + '/../templates/addAuthor.twig'));
}

exports.getAddGenrePage = function (req, res) {
    res.render(path.resolve(__dirname + '/../templates/addGenre.twig'));
}

exports.addAuthor = function (req, res) {
    authorRepo.addAuthor(req.body)
    .then(
        (result) => {
            console.log("Author added");
            res.redirect('/adminAuthors');
        }
    );
}

exports.addGenre = function (req, res) {
    genreRepo.addGenre(req.body)
        .then(
            (result) => {
                console.log("Genre added");
                res.redirect('/adminGenres');
            }
        );
}

exports.getAdminAuthorsPage = function (req, res) {
    authorRepo.getAuthorsSortedByPopularity()
        .then(
            (result) => {
                res.render(path.resolve(__dirname + '/../templates/adminAuthors.twig'),
                    {
                        authDelId : _authorDeleteForbidden,
                        authors : result.rows
                    });
                _authorDeleteForbidden = undefined;
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
                        genreDelId : _genreDeleteForbidden,
                        genres : result.rows,
                        flagP : true
                    });
                _genreDeleteForbidden = undefined;
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
