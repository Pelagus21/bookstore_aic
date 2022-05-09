const {Client} = require('pg');

const client = new Client({
    host: "heffalump.db.elephantsql.com",
    user: "bnjhbbyr",
    port: 5432,
    password: "PzYsKZGDwrnZ_6j4buhyh7dpUtuCja3u",
    database: "bnjhbbyr"
});

client.connect();

/*client.query(`SELECT * FROM "Books_Orders"`).then(res=>{
    let i = 0;
});*/

let queryStr = 'SELECT "Books_Orders"."Order_id", COUNT() ' +
    `FROM ("Books_Orders" INNER JOIN (SELECT * FROM "Orders" WHERE "Customer_login" = '${"gleb2001"}') AS "FilteredOrders" ON "Order_id" = "FilteredOrders"."Id")` +
    'GROUP BY "Books_Orders"."Order_id"';
queryStr = `SELECT * FROM "Orders" WHERE "Customer_login" = '${"gleb2001"}'`;
client.query(queryStr).then(res => {
    let i = 0;
})

module.exports = client;