
const jwt = require('jsonwebtoken');
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'kaka',
  host: 'localhost',
  database: 'library',
  password: 'dbz'
})

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.body.token;
  
  if(!token) {
    console.log("Token not provided, unauthorised for this request");
    return res.status(400).send({ 'message': 'Token is not provided' });
  }
  try {
    jwt.verify(token, "justanotherrandomsecretkey", (error, decoded) => {
      const text = 'SELECT * FROM users WHERE userid = $1';
      pool.query(text, [decoded.userId], (err, result) => {
        if(!result || !result.rows[0]) {
          return res.status(400).send({ 'message': 'The token you provided is invalid' });
        }
        req.userauth = {userId: decoded.userId, email: decoded.email, isAdmin: decoded.isAdmin, firstName: decoded.firstName, lastName: decoded.lastName};
        console.log(req.userauth);
        next();          
      });
    }) 
  }catch(error) {
    return res.status(400).send(error);
  }
}

const verifyAdminToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.body.token;
  
  if(!token) {
    console.log("Token not provided, unauthorised for this request");
    return res.status(400).send({ 'message': 'Token is not provided' });
  }
  try {
    jwt.verify(token, "justanotherrandomsecretkey", (error, decoded) => {
      const text = 'SELECT * FROM users WHERE userid = $1';
      if(!decoded.isAdmin || decoded.isAdmin === false) {
        return res.status(400).send({ 'message': 'Not Authorized!' });
      }
      pool.query(text, [decoded.userId], (err, result) => {
        if(!result.rows[0]) {
          return res.status(400).send({ 'message': 'The token you provided is invalid' });
        }
        req.userauth = {userId: decoded.userId, email: decoded.email, isAdmin: decoded.isAdmin, firstName: decoded.firstName, lastName: decoded.lastName};
        console.log(req.userauth);
        next();          
      });
    }) 
  }catch(error) {
    return res.status(400).send(error);
  }
}


module.exports = {verifyToken, verifyAdminToken}
