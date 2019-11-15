
CREATE SEQUENCE Users_seq;

CREATE TABLE Users(
	UserId int DEFAULT NEXTVAL ('Users_seq') NOT NULL,
	FirstName Varchar(50) NOT NULL,
	LastName Varchar(50) NOT NULL,
	Email Varchar(100) NOT NULL,
	StartDate date NOT NULL,
	ExpirationDate date NULL,
	Password Varchar(20) NOT NULL,
	IsAdmin Boolean NOT NULL,
	IsActive Boolean NOT NULL,
PRIMARY KEY 
(
	UserId
) 
);


CREATE SEQUENCE Genres_seq;

CREATE TABLE Genres(
	GenreId int DEFAULT NEXTVAL ('Genres_seq') NOT NULL,
	GenreName Varchar(50) NOT NULL,
PRIMARY KEY 
(
	GenreId
) 
);


CREATE SEQUENCE Books_seq;

CREATE TABLE Books(
	BookId int DEFAULT NEXTVAL ('Books_seq') NOT NULL,
	BookName Varchar(50) NOT NULL,
	AuthorName Varchar(50) NOT NULL,
	GenreId int NOT NULL,
	Description Varchar(100) NOT NULL,
	Link Varchar(100) NOT NULL,
PRIMARY KEY 
(
	BookId
) 
);


CREATE TABLE Favorites(
	UserId int NOT NULL,
	BookId int NOT NULL,
	Completed Boolean NOT NULL,
PRIMARY KEY
(
	UserId,
	BookId
)
);


ALTER TABLE Books ADD CONSTRAINT constraint_genre_fk FOREIGN KEY(GenreId)
REFERENCES Genres(GenreId);

ALTER TABLE Favorites ADD CONSTRAINT constraint_user_fk FOREIGN KEY(UserId)
REFERENCES Users(UserId);

ALTER TABLE Favorites ADD CONSTRAINT constraint_book_fk FOREIGN KEY(BookId)
REFERENCES Books(BookId);



INSERT INTO Genres(GenreName) VALUES ('AutoBiography');

INSERT INTO Genres(GenreName) VALUES ('History');

INSERT INTO Genres(GenreName) VALUES ('Action and Adventure');

INSERT INTO Genres(GenreName) VALUES ('Comic');

INSERT INTO Genres(GenreName) VALUES ('Mystery');

INSERT INTO Genres(GenreName) VALUES ('Science Fiction');

INSERT INTO Genres(GenreName) VALUES ('Engineering');

INSERT INTO 
Users(FirstName,LastName,Email,StartDate,ExpirationDate,Password,IsAdmin,IsActive)

VALUES('System','Admin','system.admin@gmail.com','2019-02-02','3000-01-01','admin',true,true);

INSERT INTO 
Users(FirstName,LastName,Email,StartDate,ExpirationDate,Password,IsAdmin,IsActive)

VALUES('sanju','sharma','sanju@gmail.com','2019-02-02','2020-01-01','sanju',false,true);




