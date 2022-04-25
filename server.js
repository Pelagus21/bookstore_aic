let express = require('express');

let server = express();

const PORT = 8888;

server.listen(PORT);

console.log('Server is running on port ' + PORT);

let router = require('./app/routes').router;

let bodyParser = require('body-parser');

server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

server.use(router);


