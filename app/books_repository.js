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

//find all books
exports.getAllBooks = function () {
    let queryStr = 'SELECT "Id", "Book_name"' +
        'FROM "Books"';
    return db.query(queryStr);
}

//delete book by id
exports.deleteBook = function (id) {
    let queryStr = 'DELETE FROM "Books" WHERE "Id" = \'' + id + '\';';
    return db.query(queryStr);
}

//update book fields
exports.updateBookFields = function (id, data) {
    if(data.book_changed) {
        let queryStr = 'UPDATE "Books" SET ' +
            '"Book_name" = \'' + data.book_name + '\', ' +
            '"Number_of_copies" = \'' + data.copies_numb + '\', ' +
            '"Description" = \'' + data.description + '\', ' +
            '"Price" = ' + data.price + ', ' +
            '"Year_of_publishing" = ' + data.year + ', ' +
            '"Image_url" = \'' + data.url + '\' ' +
            'WHERE "Id" = ' + id;
        return db.query(queryStr);
    }
    return new Promise((resolve) => { resolve(true); });
}

exports.deleteBookAuthorsRelation = function (id) {
    let query1 = 'DELETE FROM "Books_Authors" WHERE "Book_id" = ' + id;
    return db.query(query1)
    //return new Promise((resolve, reject) => { resolve(true); });
}

exports.insertBookAuthors = function (id, authors_ids) {
    if(authors_ids) {
        this.deleteBookAuthorsRelation(id)
        .then(
            (result) => {
                if (authors_ids.length) {
                    let query2 = 'INSERT INTO "Books_Authors" ("Book_id", "Author_id") values ';
                    for (let i = 0; i < authors_ids.length; i++) {
                        query2 += '(' + id + ', ' + authors_ids[i] + '), ';
                    }
                    return db.query(query2.substr(0, query2.length - 2));
                }
                return new Promise((resolve, reject) => { resolve(true); });
            }
        );
    }
    return new Promise((resolve) => { resolve(true); });
}

exports.deleteBookGenresRelation = function (id) {
    let query1 = 'DELETE FROM "Books_Genres" WHERE "Book_id" = ' + id;
    return db.query(query1)
    //return new Promise((resolve, reject) => { resolve(true); });
}

exports.insertBookGenres = function (id, genres_ids) {
    if(genres_ids) {
        this.deleteBookGenresRelation(id)
        .then(
            (result) => {
                if (genres_ids.length) {
                    let query2 = 'INSERT INTO "Books_Genres" ("Book_id", "Genre_id") values ';
                    for (let i = 0; i < genres_ids.length; i++) {
                        query2 += '(' + id + ', ' + genres_ids[i] + '), ';
                    }
                    return db.query(query2.substr(0, query2.length - 2));
                }
                return new Promise((resolve) => { resolve(true); });
            }
        );
    }
    return new Promise((resolve) => { resolve(true); });
}
