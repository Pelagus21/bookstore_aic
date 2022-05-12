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

exports.getAllGenres = function() {
    let qstr = 'SELECT * FROM "Genres"';
    return db.query(qstr);
}

exports.deleteGenre = function (id) {
    let qstr = 'DELETE FROM "Genres" WHERE "Id" = ' + id;
    return db.query(qstr);
}

//get genres sorted by popularity
exports.getGenresSortedByPopularity = function () {
    let qstr = 'SELECT "Id", "Genre_name", COALESCE("Genre_popularity", 0) AS "Popularity"' +
        'FROM "Genres" LEFT JOIN (' +
            'SELECT "Genre_id", SUM(COALESCE("Book_popularity", 0)) / COUNT(*) AS "Genre_popularity"' +
            'FROM "Books_Genres" LEFT JOIN (' +
                'SELECT "Book_id", COUNT(*) AS "Book_popularity"' +
                'FROM "Books_Orders"' +
            'GROUP BY "Book_id"' +
            ')' +
            'AS "R2" ON "Books_Genres"."Book_id" = "R2"."Book_id"' +
            'GROUP BY "Genre_id"' +
            ') ' +
        'AS "R1" ON "Genres"."Id" = "R1"."Genre_id"' +
        'ORDER BY "Popularity" DESC';
    return db.query(qstr);
}

exports.getGenresInAllOrders = function () {
    let qstr = 'SELECT "Id", "Genre_name" ' +
        'FROM "Genres" AS "R1"' +
        'WHERE NOT EXISTS (' +
            'SELECT * ' +
            'FROM "Orders" ' +
            'WHERE "Orders"."Id" NOT IN ( ' +
                'SELECT "Order_id" ' +
                'FROM "Books_Orders" ' +
                'WHERE "Book_id" IN ( ' +
                    'SELECT "Book_id" ' +
                    'FROM "Books_Genres" ' +
                    'WHERE "Genre_id" = "R1"."Id" ' +
                ')' +
            ')' +
        ');';
    return db.query(qstr);
}

exports.countBookInEveryGenre = function () {
    let queryHelperStr = 'SELECT *' +
        'FROM "Books" INNER JOIN "Books_Genres" ON "Books"."Id" = "Books_Genres"."Book_id"';
    let qstr = 'SELECT "Genres"."Genre_name", COUNT("QueryHelper"."Id") AS "NumberOfBooks"' +
        'FROM "Genres" LEFT JOIN (' + queryHelperStr + ') AS "QueryHelper" ON "Genres"."Id" = "QueryHelper"."Genre_id"' +
        'GROUP BY "Genres"."Genre_name";';
    return db.query(qstr);
}

exports.booksNoOneBought = function () {
    let qstr = 'SELECT "Books"."Book_name"' +
        'FROM "Books"' +
        'WHERE "Books"."Id" NOT IN ( SELECT DISTINCT "Books_Orders"."Book_id"' +
        'FROM "Books_Orders" );';
    return db.query(qstr);
}

exports.countsBooksFromEachAuthor = function () {
    let queryHelperStr = 'SELECT *' +
        'FROM "Books" INNER JOIN "Books_Authors" ON "Books"."Id" = "Books_Authors"."Book_id"';
    let qstr = 'SELECT "Authors"."Id", CONCAT("Authors"."First_name", \' \', "Authors"."Surname") AS "AuthorName", COUNT("QueryHelper"."Id") AS "NumberOfBooks"' +
        'FROM "Authors" LEFT JOIN (' + queryHelperStr + ') AS "QueryHelper" ON "Authors"."Id" = "QueryHelper"."Author_id"' +
        'GROUP BY "Authors"."Id";';
    return db.query(qstr);
}

exports.updateGenre = function (id, body) {
    let qstr = 'UPDATE "Genres" SET ' +
        '"Genre_name" = \'' + body.genre_name + '\', ' +
        '"Description" = \'' + body.description + '\' ' +
        'WHERE "Id" = ' + id;
    return db.query(qstr);
}

exports.addGenre = function (body) {
    let qstr = 'INSERT INTO "Genres" ("Genre_name", "Description") VALUES (' +
        '\'' + body.genre_name + '\', ' +
        '\'' + body.description + '\')';
    return db.query(qstr);
}

