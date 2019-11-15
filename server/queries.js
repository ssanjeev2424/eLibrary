const Pool = require('pg').Pool
const pool = new Pool({
  user: 'kaka',
  host: 'localhost',
  database: 'library',
  password: 'dbz'
})
const jwt = require('jsonwebtoken');
//const uuidv4 = require('uuid/v4');
const Helper = require('./helpers.js');

const isEmptyOrNull = (str) => {
	return (!str || str.length === 0 || !str.trim());
}

const authorizeUser = (req, res) => {
	if (!req.body.Email || !req.body.Password) {
      return res.status(400).send({'message': 'Some values are missing'});
    }
    if (!Helper.isValidEmail(req.body.Email)) {
      return res.status(400).send({ 'message': 'Please enter a valid email address' });
    }
	const queryText = 'SELECT * FROM Users WHERE Email = $1::text';

	pool.query(queryText, [req.body.Email], (err, result) => {
		if (err) {
			console.error('Error authorizing user', err.stack);
			return res.status(400).send({ 'message': 'Error occured' });
		}
		if (!result.rows[0]) {
	      return res.status(400).send({'message': 'The credentials you provided is incorrect'});
	    }
	    if(!Helper.comparePassword(result.rows[0].password, req.body.Password)) {
	      return res.status(400).send({ 'message': 'The credentials you provided is incorrect' });
	    }
		const user = Helper.getCleanUser(result.rows[0]);
		console.log("SUCCESS !!.............");
		console.log(result.rows[0]);
		const token = Helper.generateToken(result.rows[0]);
      	return res.status(200).send({user: user, token: token });
	})
}

const authWithToken = (req, res) => {
	const token = req.headers['x-access-token'] || req.body.token;
	console.log(token);
    if(!token) {
      return res.status(400).send({ 'message': 'Token is not provided' });
    }
    try {
      jwt.verify(token, "justanotherrandomsecretkey", (err, decoded) => {
      	  const text = 'SELECT * FROM users WHERE userid = $1';
	      console.log("Decoded User: ", decoded);
	      pool.query(text, [decoded.userId], (err, result) => {
	      	if(!result.rows[0]) {
	 	       return res.status(400).send({ 'message': 'The token you provided is invalid' });  		
	      	}
	        return res.status(200).send({user: decoded, token: token });
	      });
      })
    }
	catch(error) {
      return res.status(400).send(error);
    }
}

const getAllGenres = (request, response) => {
	const queryText = 'SELECT * from Genres';
	pool.query(queryText, [], (err, res) => {
		if(err) {
			return res.status(400).send({ 'message': 'Error occured' });
		}
		response.status(200).json(res.rows);
	})
}

const addBook = (request, response) => {
	console.log("Adding Book by: " + request.userauth);
	if (!request.body.BookName || !request.body.AuthorName || !request.body.GenreName || !request.body.Description || !request.body.Link) {
		  console.log("Some Fields are missing..");
		return response.status(400).send({'message': 'Some values are missing'});
	}
  
	const shouldAbort = err => {
	  if (err) {
		console.error('Error in transaction', err.stack)
		pool.query('ROLLBACK', err => {
		  if (err) {
			console.error('Error rolling back client', err.stack)
		  }
		})
	  }
	  return !!err
	}
  
	pool.query('BEGIN', err => {
		console.log("Inside Begin");	
		if (shouldAbort(err)) return;
	  const queryText1 = 'INSERT INTO Books(BookName,AuthorName,GenreId,Description,Link) VALUES($1,$2,(SELECT GenreId from Genres WHERE GenreName = $3),$4,$5)';

	  pool.query(queryText1, [request.body.BookName,request.body.AuthorName,request.body.GenreName,request.body.Description,request.body.Link], (err, res) => {
		  console.log("Inside 1");
		  if(shouldAbort(err)) return;
		  const result = res.rows;

		  pool.query('COMMIT', err => {
			console.log("INSIDE COMMIT");
			if(err) {
				console.error('Error adding book', err.stack)
				return res.status(400).send({ 'message': 'Error occured' });
			}
			else {
				response.status(200).json(result);
			}
		})
	  })
	})
}

const updateProfile = (request, response) => {
	if(!request.userauth) {
		console.log("Unauthorized");
		return	response.status(400).send( {message : 'Not Authorized!'});
	}
	
	const shouldAbort = err => {
    if (err) {
      console.error('Error in transaction', err.stack)
      pool.query('ROLLBACK', err => {
        if (err) {
          console.error('Error rolling back client', err.stack)
        }
      })
    }
    return !!err
  }

  pool.query('BEGIN', err => {
  	if (shouldAbort(err)) return;
	const queryText1 = 'UPDATE Users SET FirstName = $1, LastName=$2 WHERE userId = $3';
	const queryText2 = 'UPDATE Users SET Password = $1 WHERE userId = $2 AND Password = $3';

	pool.query(queryText1, [request.body.FirstName,request.body.LastName, request.userauth.userId], (err, res) => {
		if(shouldAbort(err)) return;	
		if(!request.body.OldPassword || !request.body.NewPassword || request.body.NewPassword !== request.body.ConfirmPassword) {
			pool.query('COMMIT', err => {
				if(err) {
					console.error('Error updating profile', err.stack)
					return res.status(400).send({ 'message': 'Error occured' });
				}
				else {
					return response.status(200).json({'message' : 'Updated'});
				}
			})
		} else {
			pool.query(queryText2, [request.body.NewPassword, request.userauth.userId, request.body.OldPassword], (err, res) => {
				if(shouldAbort(err)) return;
				pool.query('COMMIT', err => {
					if(err) {
						console.error('Error updating profile', err.stack)
						return res.status(400).send({ 'message': 'Error occured' });
					}
					else {
						return response.status(200).json({'message' : 'Updated'});
					}
				})
			})
		}
	})
  })
}

const searchBooks = (request, response) => {
	const queryText = `SELECT B.*, G.GenreName
    FROM Books AS B INNER JOIN Genres AS G ON B.GenreId = G.GenreId
    WHERE
	    ($1::text IS NOT NULL AND  B.BookName LIKE $2) OR
	    ($3::text IS NOT NULL AND  B.AuthorName LIKE $4) OR
		($5::text IS NOT NULL AND  G.GenreName LIKE $6)`;

	const queryText1 = 'SELECT GenreId from Genres WHERE GenreName = $1';
	if(!isEmptyOrNull(request.body.GenreName) ) {
		console.log('Genre Name: ', request.body.GenreName);
		pool.query(queryText1, [request.body.GenreName], (err, result) => {
			if(err || !result.rows[0]	) {
				return response.status(400).send({ 'message': 'Error occured' });
			} else {
				const GenreId = result.rows[0].genreid;
				const BookName = !isEmptyOrNull(request.body.BookName) ? request.body.BookName : null;
				const AuthorName =  !isEmptyOrNull(request.body.AuthorName) ? request.body.AuthorName : null;
				const GenreName = !isEmptyOrNull(request.body.GenreName) ? request.body.GenreName : null;

				pool.query(queryText, [BookName, '%'+BookName+'%', AuthorName, '%'+AuthorName+'%', GenreName, '%'+GenreName+'%'], (err, result) => {
			    	if (err) {
						console.error('Error searching books', err.stack)
						return response.status(400).send({ 'message': 'Error occured' });
					}
					return response.status(200).json(result.rows);
		    	})	
			}
		});
	} else {
		const GenreId = null;
		const BookName = !isEmptyOrNull(request.body.BookName) ? request.body.BookName : null;
		const AuthorName =  !isEmptyOrNull(request.body.AuthorName) ? request.body.AuthorName : null;
		const GenreName = !isEmptyOrNull(request.body.GenreName) ? request.body.GenreName : null;

		pool.query(queryText, [BookName, '%'+BookName+'%', AuthorName, '%'+AuthorName+'%', GenreName, '%'+GenreName+'%'], (err, result) => {
	    	if (err) {
				console.error('Error searching books', err.stack)
				return response.status(400).send({ 'message': 'Error occured' });
			}
			return response.status(200).json(result.rows);
    	})
	}

}

const createUser = (request, response) => {
	console.log("Creating Employee by " + request.userauth)
	if (!request.body.Email || !request.body.Password || !request.body.FirstName || !request.body.LastName || !request.body.StartDate) {
		  console.log("Some Fields are missing");
		return response.status(400).send({'message': 'Some values are missing'});
	}
	if (!Helper.isValidEmail(request.body.Email)) {
		console.log("Email is invalid")
	  return response.status(400).send({ 'message': 'Please enter a valid email address' });
	}
  
	const shouldAbort = err => {
	  if (err) {
		console.error('Error in transaction', err.stack)
		pool.query('ROLLBACK', err => {
		  if (err) {
			console.error('Error rolling back client', err.stack)
		  }
		})
	  }
	  return !!err
	}
  
	pool.query('BEGIN', err => {
		console.log("Inside Begin");	
		if (shouldAbort(err)) return;
		
		const queryText1 = 'INSERT INTO Users(FirstName,LastName,Email,StartDate,ExpirationDate,Password,IsAdmin,IsActive) VALUES($1,$2,$3,$4,$8,$5,$6,$7)';
	
		  pool.query(queryText1, [request.body.FirstName,request.body.LastName,request.body.Email,request.body.StartDate,request.body.Password,request.body.IsAdmin,true,null], (err, res) => {
			  console.log("Inside Add user Query");
			  if(shouldAbort(err)) return;
			  const result = res.rows;
			  pool.query('COMMIT', err => {
				  console.log("INSIDE COMMIT");
				  if(err) {
					  console.error('Error adding user', err.stack)
					  return res.status(400).send({ 'message': 'Error occured' });
				  }
				  else {
					  response.status(200).json(result);
				  }
			  })
		  })
	})
  }

  const searchUsers = (request, response) => {
	  
	const queryText = `SELECT Users.* FROM Users
		WHERE
	    ($1::text IS NOT NULL AND  FirstName LIKE $4) OR
	    ($2::text IS NOT NULL AND  LastName LIKE $5) OR
	    ($3::text IS NOT NULL AND  Email LIKE $6)`;

		const FirstName = !isEmptyOrNull(request.body.FirstName) ? request.body.FirstName : null;
		const LastName =  !isEmptyOrNull(request.body.LastName) ? request.body.LastName : null;
		const Email = !isEmptyOrNull(request.body.Email) ? request.body.Email : null;

		pool.query(queryText, [FirstName, LastName, Email, '%'+FirstName+'%', '%'+LastName+'%', '%'+Email+'%'], (err, result) => {
			if (err) {
				console.error('Error searching users..', err.stack)
				return response.status(400).send({ 'message': 'Error occured' });
			}
			return response.status(200).json(result.rows);
		});		
}

const searchFavorites = (request, response) => {
	const queryText = `SELECT B.*, G.GenreName FROM Books AS B, Users AS U, Favorites AS F, Genres AS G
					WHERE
					(F.UserId = $1) AND
					(F.UserId = U.UserId) AND
					(G.GenreId = B.GenreId) AND
					(F.BookId = B.BookId)`;

	pool.query(queryText, [request.body.UserId], (err, result) => {
		if (err) {
			console.error('Error searching Favorites..', err.stack)
			return response.status(400).send({ 'message': 'Error occured' });
		}
		return response.status(200).json(result.rows);
	});	
}

const deleteFavorite = (request, response) => {
	const queryText = `DELETE FROM Favorites WHERE UserId = $1 AND BookId = $2`;

	pool.query(queryText, [request.body.UserId, request.body.BookId], (err, result) => {
		if (err) {
			console.error('Error in deleting Favorite..', err.stack)
			return response.status(400).send({ 'message': 'Error occured' });
		}
		return response.status(200).json({'message' : 'Deleted'});
	});	
}

const addFavorite = (request, response) => {
	const queryText = `SELECT UserId,BookId FROM Favorites WHERE UserId = $1 AND BookId = $2`;
	const queryText2 = 'INSERT INTO Favorites(UserId,BookId,Completed) VALUES($1,$2,$3)';

	pool.query(queryText, [request.body.UserId, request.body.BookId], (err, result) => {
		if (err) {
			console.error('Error in checking Favorite..', err.stack)
			return response.status(400).send({ 'message': 'Error occured' });
		}
		if(result.rows[0]) {
			console.log("Book is alredy a Favorite !!");
			return response.status(200).json({'message' : 'Already a Favorites'});
		}

		pool.query(queryText2, [request.body.UserId, request.body.BookId, false], (err2, result2) => {
			if (err) {
				console.error('Error in adding Favorite..', err.stack)
				return response.status(400).send({ 'message': 'Error occured' });
			}
			return response.status(200).json({'message' : 'Added to Favorites'});
		});
	});	
}

module.exports = {
  authorizeUser,
  authWithToken,
  updateProfile,
  getAllGenres,
  addBook,
  searchBooks,
  createUser,
  searchUsers,
  searchFavorites,
  deleteFavorite,
  addFavorite
}
