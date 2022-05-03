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