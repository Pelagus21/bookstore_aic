const db = require('../app/db_connection');

exports.findCustomerByCredentials = function (username, password) {
    let queryStr = 'SELECT * FROM "Customers" ' +
        'WHERE "Login" = \'' + username +
        '\' AND "Password" = \'' + password + '\';';
    return db.query(queryStr);
}

exports.addCustomer = function (body) {
    let queryStr = 'INSERT INTO "Customers" ("Login", "Password", "Birth_date", "Email"';
    if (body.first_name != "")
        queryStr += ', "First_name"';
    if (body.surname != "")
        queryStr += ', "Surname"';
    if (body.last_name != "")
        queryStr += ', "Last_name"';
    queryStr += ') values (\'' + body.username + '\', \'' + body.password + '\', \'' +
        body.birth_date + '\', \'' + body.email + '\'';
    if (body.first_name != "")
        queryStr += ', \'' + body.first_name + '\'';
    if (body.surname != "")
        queryStr += ', \'' + body.surname + '\'';
    if (body.last_name != "")
        queryStr += ', \'' + body.last_name + '\'';
    queryStr += ');';
    return db.query(queryStr);
}

exports.deleteCustomer = function (username) {
    let queryStr = 'DELETE FROM "Customers" WHERE "Login" = \'' + username + '\';';
    return db.query(queryStr);
}

exports.updateCustomer = function (username, body) {
    let queryStr = 'UPDATE "Customers" SET ' +
        '"First_name" = \'' + body.first_name + '\', ' +
        '"Surname" = \'' + body.surname + '\', ' +
        '"Last_name" = \'' + body.last_name + '\', ' +
        '"Password" = \'' + body.password + '\', ' +
        '"Birth_date" = \'' + body.birth_date + '\' ' +
        'WHERE "Login" = \'' + username + '\';';
    return db.query(queryStr);
}

//find admin by credentials
exports.findAdminByCredentials = function (username, password) {
    let queryStr = 'SELECT * FROM "Admins" ' +
        'WHERE "Login" = \'' + username +
        '\' AND "Password" = \'' + password + '\';';
    return db.query(queryStr);
}

exports.usersThatBoughtAllBooksOfAuthor = function (author_id) {
    let booksOfAuthor = 'SELECT "Book_id" ' +
        'FROM ("Books" LEFT JOIN "Books_Authors" ON "Id" = "Book_id") LEFT JOIN "Authors" ON "Authors"."Id" = "Author_id"' +
        'WHERE "Authors"."Id" = ' + author_id;
    let CustomersToBooks = 'SELECT DISTINCT "Customers"."Login", "Books_Orders"."Book_id"' +
        'FROM ("Orders" INNER JOIN "Customers" ON "Customer_login" = "Login")' +
        'INNER JOIN "Books_Orders" ON "Order_id" = "Orders"."Id"';
    let query = 'SELECT * ' +
        'FROM "Customers" AS "Outer"' +
        'WHERE NOT EXISTS (SELECT * ' +
        'FROM "Books"' +
        'WHERE EXISTS(SELECT * ' +
        'FROM (' + booksOfAuthor + ') AS "BooksOfAuthor" ' +
        'WHERE "Books"."Id" = "BooksOfAuthor"."Book_id")' +
        'AND NOT EXISTS (SELECT * ' +
        'FROM (' + CustomersToBooks + ') AS "CustomersToBooks" ' +
        'WHERE "Login" = "Outer"."Login" AND "Books"."Id" = "CustomersToBooks"."Book_id"))';
    return db.query(query);

}