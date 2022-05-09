const db = require('../app/db_connection');
const booksRepo = require('../app/books_repository');

order = [1];

exports.addToCart = function (book_id) {
    if (order.indexOf(book_id) === -1) {
        order.push(book_id);
        console.log(order);
    }
}

exports.getBooks = async function () {
    let res = {books: [], total: 0};
    for (let book_id of order) {
        let b = await booksRepo.getBookWithFullInfo(book_id);
        res.books.push(b);
        res.total += Number(b.Price.replace(/[^0-9.-]+/g, ""));
    }
    return res;
}

function getOrderInsertionQuery(body) {
    let queryStr = `INSERT INTO "Orders" ("Address", "Phone_number_1", `;
    if (body.phone_number_2) {
        queryStr += "Phone_number_2, ";
    }
    if (body.phone_number_3) {
        queryStr += "Phone_number_3, ";
    }
    queryStr += `"Delivery_date", "Creation_date", "Customer_login")`;

    queryStr += ` values ( '` + body.address + `', '` + body.phone_number_1 + `', `;
    if (body.phone_number_2) {
        queryStr += `'` + body.phone_number_2 + "\', ";
    }
    if (body.phone_number_3) {
        queryStr += `'` + body.phone_number_3 + "\', ";
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
        for (let i = 0; i < order.length; ++i) {
            queryStr += `( ${orderId}, ${order[i]}, 1),`
        }
        queryStr = queryStr.slice(0, -1);//remove last comma


        db.query(queryStr).then(res => {

            /*decrease number of book copies in books relation*/
            let queryToDecreaseNumberOfCopies = 'UPDATE "Books" \n' +
                'SET "Number_of_copies" = "Number_of_copies" - 1\n' +
                `WHERE "Id" = ANY(ARRAY[${order.toString()}])`
            order = [];
            db.query(queryToDecreaseNumberOfCopies);

        });
    });
    return;
}