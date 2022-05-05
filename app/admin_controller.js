const path = require('path');
const bookRepo = require('../app/books_repository');


let _bookUpdated = false;

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

exports.getEditBookPage = async function (req, res) {
    let res1 = await bookRepo.getBookById(req.params.id);
    if(res1.rows.length) {
        let res2 = await bookRepo.getGenresOfBook(req.params.id);
        let res3 = await bookRepo.getAuthorsOfBook(req.params.id);
        res.render(path.resolve(__dirname + '/../templates/editBook.twig'),
            {
                book: res1.rows[0],
                genres: res2.rows,
                authors: res3.rows,
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
