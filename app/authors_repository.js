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

exports.deleteAuthor = function (id) {
    let qstr = 'DELETE FROM "Authors" WHERE "Id" = ' + id;
    return db.query(qstr);
}

//get authors sorted by popularity
exports.getAuthorsSortedByPopularity = function () {
    let qstr = 'SELECT "Id", "First_name", "Surname", COALESCE("Auth_popularity", 0) AS "Popularity"' +
        'FROM "Authors" LEFT JOIN (' +
            'SELECT "Author_id", SUM(COALESCE("Book_popularity", 0)) / COUNT(*) AS "Auth_popularity"' +
            'FROM "Books_Authors" LEFT JOIN (' +
                'SELECT "Book_id", COUNT(*) AS "Book_popularity"' +
                'FROM "Books_Orders"' +
                'GROUP BY "Book_id"' +
            ') AS "R2" ON "Books_Authors"."Book_id" = "R2"."Book_id"' +
            'GROUP BY "Author_id"' +
        ') AS "R1" ON "Authors"."Id" = "R1"."Author_id"' +
        'ORDER BY "Popularity" DESC';
    return db.query(qstr);
}

exports.updateAuthor = function (id, body) {
    let qstr = 'UPDATE "Authors" SET ' +
        '"First_name" = \'' + body.first_name + '\', ' +
        '"Surname" = \'' + body.surname + '\', ' +
        '"Last_name" = ';
        if(body.last_name.length)
            qstr += '\'' + body.last_name + '\', ';
        else
            qstr += 'NULL, '
    qstr += '"Pseudonym" = ';
        if(body.pseudo.length)
            qstr += '\'' + body.pseudo + '\' ';
        else
            qstr += 'NULL '
    qstr += 'WHERE "Id" = ' + id;
    return db.query(qstr);
}

exports.addAuthor = function (body) {
    let qstr = 'INSERT INTO "Authors" ("First_name", "Surname", "Last_name", "Pseudonym") VALUES (' +
        '\'' + body.first_name + '\', ' +
        '\'' + body.surname + '\', ';
    if(body.last_name.length)
        qstr += '\'' + body.last_name + '\', ';
    else
        qstr += 'NULL, ';
    if(body.pseudo.length)
        qstr += '\'' + body.pseudo + '\'';
    else
        qstr += 'NULL';
    qstr += ')';
    return db.query(qstr);
}
