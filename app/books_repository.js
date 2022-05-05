const db = require('../app/db_connection');

//get book by id
exports.getBookById = function (id) {
    let queryStr = 'SELECT * FROM "Books" WHERE "Id" = ' + id + ';';
    return db.query(queryStr);
}

//get authors of book
exports.getAuthorsOfBook = function (id) {
    let queryString = 'SELECT "Id", "First_name", "Surname"' +
        'FROM "Authors"' +
        'WHERE "Id" IN (' +
        'SELECT "Author_id"' +
        'FROM "Books_Authors"' +
        'WHERE "Book_id" = ' + id + ');';
    return db.query(queryString);
}

//get genres of book
exports.getGenresOfBook = function (id) {
    let queryStr = 'SELECT "Id", "Genre_name"' +
        'FROM "Genres"' +
        'WHERE "Id" IN (' +
        'SELECT "Genre_id"' +
        'FROM "Books_Genres"' +
        'WHERE "Book_id" = ' + id + ');';
    return db.query(queryStr);
}

exports.getBookWithFullInfo = async function (id) {
    let book = (await exports.getBookById(id)).rows;
    if(book.length === 0)
        return [];
    let authors = (await exports.getAuthorsOfBook(id)).rows;
    let genres = (await exports.getGenresOfBook(id)).rows;
    book[0].authors = authors;
    book[0].genres = genres;

    return book[0];
}