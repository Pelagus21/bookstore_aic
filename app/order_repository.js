const db = require('../app/db_connection');
const booksRepo = require('../app/books_repository');

order = new Map();

exports.order = order;

exports.addToCart = function (book_id) {
    if (Array.from( order.keys()).indexOf(book_id) === -1) {
        order.set(book_id, 1);
        console.log(order);
    }
}

exports.getBooks = async function () {
    let res = {books: [], total: 0};
    for (let [key, value] of order) {
        let b = await booksRepo.getBookWithFullInfo(key);
        res.books.push(b);
        res.total += Number(b.Price.replace(/[^0-9.-]+/g, "")) * value;
    }
    return res;
}

exports.removeBookById = function (id) {
    order.delete(' ' + id);
}

function getOrderInsertionQuery(body) {
    let queryStr = `INSERT INTO "Orders" ("Address", "Phone_number_1", `;
    if (body.phone_number_2) {
        queryStr += "\"Phone_number_2\", ";
    }
    if (body.phone_number_3) {
        queryStr += "\"Phone_number_3\", ";
    }
    queryStr += `"Delivery_date", "Creation_date", "Customer_login")`;

    queryStr += ` values ( '` + body.address + `', '` + body.phone_number_1 + `', `;
    if (body.phone_number_2) {
        queryStr += `'` + body.phone_number_2 + `', `;
    }
    if (body.phone_number_3) {
        queryStr += `'` + body.phone_number_3 + `', `;
    }
    queryStr += `current_date + interval '7 day', now(), '${body.user.Login}') RETURNING *`;
    return queryStr;
}

exports.performOrder = function (body) {
    /*create new order*/
    let queryStr = getOrderInsertionQuery(body);


    return db.query(queryStr).then(res => {
        let orderId = res.rows[0].Id;

        /*add new order-books in order rows*/
        let queryStr = `INSERT INTO "Books_Orders" ("Order_id", "Book_id", "Copies_quantity")` +
            ` values `;
        order.forEach((value, key, map)=>{
            queryStr += `( ${orderId}, ${key}, ${value}),`
        });
        queryStr = queryStr.slice(0, -1);//remove last comma


        db.query(queryStr).then(res => {

            /*decrease number of book copies in books relation*/
            let queryToDecreaseNumberOfCopies = 'UPDATE "Books" \n' +
                'SET "Number_of_copies" = "Number_of_copies" - 1\n' +
                `WHERE "Id" = ANY(ARRAY[${Array.from( order.keys()).toString()}])`
            order.clear();
            return db.query(queryToDecreaseNumberOfCopies);

        });
    });

}

exports.getAllUserOrders = function (login) {
    let queryHelper = 'SELECT "Order_id", "Book_id", "Price" * "Copies_quantity" AS "PriceCopies" ' +
        'FROM "Books_Orders" INNER JOIN "Books" ON "Books_Orders"."Book_id" = "Books"."Id"';

    let queryStr = 'SELECT "Id", "Address", cast("Creation_date" AS TEXT) AS "Creation_date", ' +
        'cast("Delivery_date" AS TEXT) AS "Delivery_date", (SUM("PriceCopies")) AS "TotalCost" ' +
        'FROM "Orders" INNER JOIN (' + queryHelper + ') AS "QueryHelper" ON "Orders"."Id" = "QueryHelper"."Order_id" ' +
        'WHERE "Orders"."Customer_login" = \'' + login + '\' ' +
        'GROUP BY "Id", "Address", "Creation_date", "Delivery_date", "Customer_login";'
    return db.query(queryStr);
}