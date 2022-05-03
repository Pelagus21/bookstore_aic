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
        '"First_name" = \'' + body.first_name + '\', '+
        '"Surname" = \'' + body.surname + '\', ' +
        '"Last_name" = \'' + body.last_name + '\', ' +
        '"Password" = \'' + body.password + '\', ' +
        '"Birth_date" = \'' + body.birth_date + '\' ' +
        'WHERE "Login" = \'' + username + '\';';
    return db.query(queryStr);
}

//find admin by credentials
exports.findAdminByCredentials = function(username, password) {
    let queryStr = 'SELECT * FROM "Admins" ' +
        'WHERE "Login" = \'' + username +
        '\' AND "Password" = \'' + password + '\';';
    return db.query(queryStr);
}