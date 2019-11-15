const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001
const db = require('./queries')
var cors = require('cors');
const Auth = require('./authmiddleware')

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(allowCrossDomain);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.post('/api/auth', db.authorizeUser);
app.post('/api/authWithToken', db.authWithToken);
app.post('/api/updateProfile', Auth.verifyToken, db.updateProfile);
app.post('/api/getAllGenres', Auth.verifyToken, db.getAllGenres);
app.post('/api/addBook', Auth.verifyAdminToken, db.addBook);
app.post('/api/searchBooks', Auth.verifyToken, db.searchBooks);
app.post('/api/addUsers', Auth.verifyAdminToken, db.createUser);
app.post('/api/searchUsers', Auth.verifyToken, db.searchUsers);
app.post('/api/searchFavorites', Auth.verifyToken, db.searchFavorites);
app.post('/api/deleteFavorite', Auth.verifyToken, db.deleteFavorite);
app.post('/api/addFavorite', Auth.verifyToken, db.addFavorite);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
	