const db = require('../app/db_connection');

//get author by id
exports.getAuthorById = function (id) {
    let queryStr = 'SELECT * FROM "Authors" WHERE "Id" = ' + id + ';';
    return db.query(queryStr);
}

//get books of concrete author
exports.getBooksOfAuthor = function (id) {
    let queryStr = 'SELECT "Id", "Book_name"' +
        'FROM "Books"' +
        'WHERE "Id" IN (' +
        'SELECT "Book_id"' +
        'FROM "Books_Authors"' +
        'WHERE "Author_id" = ' +id + ');';
    return db.query(queryStr);
}

//get genres in which author writes
exports.getGenresOfAuthor = function (id) {
    let queryStr = 'SELECT "Id", "Genre_name"' +
        'FROM "Genres"' +
        'WHERE "Id" IN (' +
        'SELECT "Genre_id"' +
        'FROM "Books_Genres"' +
        'WHERE "Book_id" IN (' +
        'SELECT "Book_id"' +
        'FROM "Books_Authors"' +
        'WHERE "Author_id" = ' +id + '));';
    return db.query(queryStr);
}

exports.getAllAuthors = function () {
    let qstr = 'SELECT * FROM "Authors"';
    return db.query(qstr);
}