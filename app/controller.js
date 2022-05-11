const path = require('path');

const db = require('../app/db_connection');
const genresRepo = require('../app/genres_repository');
const authorsRepo = require('../app/authors_repository');
const booksRepo = require('../app/books_repository');
const ordersRepo = require('../app/order_repository');
const usersRepo = require('../app/user_repository');

exports.getHomePage = function (req, res) {
    let queryStr = 'select "Id", "Book_name", "Popularity", "Description", "Price", "Image_url", "Number_of_copies"' +
        'from "Books" inner join (\n' +
        'select "Book_id", count(*) as "Popularity"\n' +
        'from "Books_Orders"\n' +
        'group by "Book_id") as "Res1" on "Books"."Id" = "Res1"."Book_id"\n' +
        'order by "Popularity" desc';


    db.query(queryStr, async (err, result) => {
        if (!err) {
            if (result.rows.length) {
                return res.render(path.resolve(__dirname + '/../templates/home.twig'), {books: result.rows});
            }
        }
    });
}

exports.addToCart = function (req, res) {
    ordersRepo.addToCart(req.params.id);
    res.redirect('/home');
}

exports.cart = async function (req, res) {
    return res.render(path.resolve(__dirname + '/../templates/cart.twig'), {
        res: await ordersRepo.getBooks()
    });
}

//get book page by id
exports.getBook = function (req, res) {
    booksRepo.getBookById(req.params.id)
        .then((res1) => {
            if (res1.rows.length) {
                booksRepo.getAuthorsOfBook(req.params.id)
                    .then((res2) => {
                        booksRepo.getGenresOfBook(req.params.id)
                            .then((res3) => {
                                return res.render(path.resolve(__dirname + '/../templates/bookPage.twig'),
                                    {
                                        book: res1.rows[0],
                                        authors: res2.rows,
                                        genres: res3.rows
                                    });
                            });
                    });
            } else {
                res.statusCode = 404;
                res.end("Not found");
            }
        });
}

exports.getAuthor = function (req, res) {
    authorsRepo.getAuthorById(req.params.id)
        .then((res1) => {
            if (res1.rows.length) {
                authorsRepo.getBooksOfAuthor(req.params.id)
                    .then((res2) => {
                        authorsRepo.getGenresOfAuthor(req.params.id)
                            .then((res3) => {
                                return res.render(path.resolve(__dirname + '/../templates/authorPage.twig'),
                                    {
                                        author: res1.rows[0],
                                        books: res2.rows,
                                        genres: res3.rows
                                    });
                            });
                    });
            } else {
                res.statusCode = 404;
                res.end("Not found");
            }
        });
}

exports.getGenres = async function (req, res) {
    let getGenresAndNumOfReadBooksHelper = '(SELECT COUNT("Books_Orders"."Book_id"), "Genres"."Id" AS "Id_of_genre"' +
        'FROM ("Genres" LEFT JOIN "Books_Genres" ON "Id" = "Genre_id")' +
        'LEFT JOIN "Books_Orders" ON "Books_Orders"."Book_id" = "Books_Genres"."Book_id"' +
        'GROUP BY "Genres"."Id")';

    let viewDeleteQuery = 'DROP VIEW IF EXISTS "Helper_genre_num_of_readers"';
    let viewCreationQuery = 'CREATE VIEW "Helper_genre_num_of_readers" AS' + getGenresAndNumOfReadBooksHelper;
    await db.query(viewDeleteQuery);
    await db.query(viewCreationQuery);

    let getGenresAndNumOfReadBooks = 'SELECT "Helper_genre_num_of_readers"."count", "Helper_genre_num_of_readers"."Id_of_genre", "Genre_name"' +
        'FROM "Helper_genre_num_of_readers" RIGHT JOIN "Genres" ON "Genres"."Id" = "Id_of_genre"' +
        'ORDER BY "count" DESC';

    await db.query(getGenresAndNumOfReadBooks, async (err, result) => {
        if (!err) {
            if (result.rows.length) {
                let genreWithBooks = [];
                for (let i = 0; i < result.rows.length; ++i) {
                    let getBooksOfThisGenre = 'SELECT "Books_Authors"."Book_id" AS "Id", "Book_name", "Description", ' +
                        '"Price", "Image_url", "Author_id", CONCAT("First_name", \' \', "Surname", ' +
                        'COALESCE(\'-\' || "Last_name", \'\')) AS "author_name"' +

                        'FROM (((SELECT * FROM "Books_Genres" WHERE "Genre_id" = ' + result.rows[i].Id_of_genre + ') AS "Books_this_genre"' +
                        ' INNER JOIN "Books" ON "Book_id" = "Id") ' +
                        'INNER JOIN "Books_Authors" ON "Books_Authors"."Book_id" = "Books"."Id") INNER JOIN "Authors"' +
                        'ON "Books_Authors"."Author_id" = "Authors"."Id"';
                    genreWithBooks.push(await db.query(getBooksOfThisGenre).then((resInner) => {
                        return {genre: result.rows[i], books: resInner.rows};
                    }));
                }
                return res.render(path.resolve(__dirname + '/../templates/genres.twig'), {res: genreWithBooks});
            }
        }
    });
}

exports.getGenre = function (req, res) {
    genresRepo.getGenreById(req.params.id)
        .then((res1) => {
            if (res1.rows.length) {
                genresRepo.getBooksInGenre(req.params.id)
                    .then((res2) => {
                        genresRepo.getAuthorsOfGenre(req.params.id)
                            .then((res3) => {
                                return res.render(path.resolve(__dirname + '/../templates/genrePage.twig'),
                                    {
                                        genre: res1.rows[0],
                                        books: res2.rows,
                                        authors: res3.rows
                                    });
                            });
                    });
            } else {
                res.statusCode = 404;
                res.end("Not found");
            }
        });
}

exports.order = function (req, res) {
    return res.render(path.resolve(__dirname + '/../templates/order.twig'));
}

exports.createOrder = async function (req, res) {
    req.body.user = req.user;
    await ordersRepo.performOrder(req.body);
    res.redirect('/home');
}

exports.getAdminHomePage = function (req, res) {
    res.render(path.resolve(__dirname + '/../templates/adminHome.twig'));
}

exports.possibleFriends = async function (req, res) {

    let CustomersToBooks = 'SELECT DISTINCT "Customers"."Login", "Books_Orders"."Book_id"' +
        'FROM ("Orders" INNER JOIN "Customers" ON "Customer_login" = "Login")' +
        'INNER JOIN "Books_Orders" ON "Order_id" = "Orders"."Id"';

    let currUserLogin = req.user.Login/*'sasha123'*/;
    let bookFriends = 'SELECT * ' +
        'FROM "Customers" AS "Outer"' +
        'WHERE NOT EXISTS (SELECT * ' +
        'FROM "Books"' +
        'WHERE EXISTS(SELECT * ' +
        'FROM (' + CustomersToBooks + ') AS "CustomersToBooks" ' +
        'WHERE "Login" = \'' + currUserLogin + '\' AND "Books"."Id" = "CustomersToBooks"."Book_id")' +
        'AND NOT EXISTS (SELECT * ' +
        'FROM (' + CustomersToBooks + ') AS "CustomersToBooks" ' +
        'WHERE "Login" = "Outer"."Login" AND "Books"."Id" = "CustomersToBooks"."Book_id")) AND "Login" != \'' + currUserLogin + '\'';

    let usersQ;
    let booksWithPriceQ;
    await db.query(bookFriends, (err, result) => {
        if (!err) {
            exports.averagePrice();
            usersQ = result.rows;

        }
    });
    await exports.averagePrice().then(res => {
        booksWithPriceQ = res.rows;
    })
    return res.render(path.resolve(__dirname + '/../templates/possibleFriends.twig'), {
        users: usersQ,
        booksWithPrice: booksWithPriceQ
    });
}

exports.averagePrice = function () {
    let qstr = 'SELECT coalesce(AVG("Price"::numeric), 0.00) AS AvgPrice, "Genres"."Genre_name"' +
        'FROM ("Genres" LEFT JOIN "Books_Genres" ON "Id" = "Genre_id") LEFT JOIN "Books" ON "Books"."Id" = "Book_id"' +
        'GROUP BY "Genres"."Genre_name"' +
        'ORDER BY coalesce(AVG("Price"::numeric), 0.00) DESC';
    return db.query(qstr);
}

exports.queries = async function (req, res) {
    let res1 = await genresRepo.countBookInEveryGenre();
    let res2 = await genresRepo.booksNoOneBought();
    let res4 = await genresRepo.countsBooksFromEachAuthor();

    let allAuthors = await authorsRepo.getAllAuthors();
    let res3 = new Map();
    for (let i = 0; i < allAuthors.rows.length; ++i) {
        let t = await usersRepo.usersThatBoughtAllBooksOfAuthor(allAuthors.rows[i].Id);
        res3.set(allAuthors.rows[i].Surname, t.rows);
    }
    return res.render(path.resolve(__dirname + '/../templates/queries.twig'), {
        all_authors: allAuthors.rows,
        res1: res1.rows,
        res2: res2.rows,
        res3: res3,
        res4: res4.rows
    });
}

exports.allUsersOrders = function (req, res) {
    ordersRepo.getAllUserOrders(req.user.Login).then(result => {
        return res.render(path.resolve(__dirname + '/../templates/myOrders.twig'), {res: result.rows});
    });
}
