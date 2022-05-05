const db = require('../app/db_connection');
const booksRepo = require('../app/books_repository');

order = [];

exports.addToCart = function (book_id) {
    if(order.indexOf(book_id) === -1) {
        order.push(book_id);
        console.log(order);
    }
}

exports.getBooks = async function ()
{
    let res = {books:[], total: 0};
    for(let book_id of order)
    {
        let b = await booksRepo.getBookWithFullInfo(book_id);
        res.books.push(b);
        res.total += Number(b.Price.replace(/[^0-9.-]+/g,""));
    }
    return res;
}
exports.performOrder = function (user_id) {
    //INSERT INTO table_name(column1, column2, …)
    // VALUES (value1, value2, …);
    let queryStr = 'INSERT INTO "ORDERS" ("Address", ) VALUES ()';
}