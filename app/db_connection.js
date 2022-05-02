const {Client} = require('pg');

const client = new Client({
    host: "heffalump.db.elephantsql.com",
    user: "bnjhbbyr",
    port: 5432,
    password: "PzYsKZGDwrnZ_6j4buhyh7dpUtuCja3u",
    database: "bnjhbbyr"
});

client.connect();

module.exports = client;