const db = require('../app/db_connection');

//get genre by id
exports.getGenreById = function (id) {
    let queryStr = 'SELECT * FROM "Genres" WHERE "Id" = ' + id + ';';
    return db.query(queryStr);
}

//get books that belong to genre
exports.getBooksInGenre = function(id) {
    let queryStr = 'SELECT *' +
        'FROM "Books"' +
        'WHERE "Id" IN (' +
        'SELECT "Book_id"' +
        'FROM "Books_Genres"' +
        'WHERE "Genre_id" = ' + id + ');';
    return db.query(queryStr);
}

//get authors who write in genre
exports.getAuthorsOfGenre = function (id) {
    let queryStr = 'SELECT "Id", "First_name", "Surname"' +
        'FROM "Authors"' +
        'WHERE "Id" IN (' +
        'SELECT "Author_id"' +
        'FROM "Books_Authors"' +
        'WHERE "Book_id" IN (' +
        'SELECT "Book_id"' +
        'FROM "Books_Genres"' +
        'WHERE "Genre_id" = ' + id + '));';
    return db.query(queryStr);
}