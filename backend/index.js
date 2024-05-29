var Express = require('express');
var MongoClient = require('mongodb').MongoClient;
var cors = require('cors');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = Express();
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

var CONNECTION_STRING = "mongodb+srv://admin:abcd1234@cluster0.8qlw42m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

var DATABASE_NAME = "bookclubdb";

var database;

app.listen(5002,()=>{
    MongoClient.connect(CONNECTION_STRING, (error, client)=>{
        database=client.db(DATABASE_NAME);
        console.log("Connected to " + DATABASE_NAME + " database");
    });
})

app.get('/api/bookclub/GetBooks', (request, response)=>{
    database.collection("books").find({}).toArray((error, result)=>{
        response.send(result);
    });
})

app.post('/api/bookclub/AddBook', Express.json(), (request, response)=>{

    database.collection("books").count({}, function(error, numOfDocs){
        database.collection("books").insertOne({
            id: (numOfDocs+1).toString(),
            title: request.body.title,
            author: request.body.author,
            year: request.body.year,
            genre: request.body.genre,
            publisher: request.body.publisher
        }, (error, result) => {
            if (error) {
                return response.status(500).json("Failed to create book");
            }
            response.json("Book added successfully");
        });
    });
})

app.put('/api/bookclub/EditBook', Express.json(), (request, response) => {

    const bookId = request.body.id;
    const updatedBook = {
        title: request.body.title,
        author: request.body.author,
        year: request.body.year,
        genre: request.body.genre,
        publisher: request.body.publisher,
        bookOfMonth: 0
    };
    database.collection("books").updateOne(
        { id: bookId },
        { $set: updatedBook },
    );
    response.json("Book updated successfully");
})

app.delete('/api/bookclub/DeleteBook', (request, response)=>{
    if (!request.session.user || !request.session.user.isAdmin) {
        return response.status(403).json("Access denied");
    }

    database.collection("books").deleteOne({
        id: request.query.id
    });
    response.json("Book deleted successfully");
})

app.post('/api/bookclub/Register', (request, response) => {
    const { username, password } = request.body;
    
    if (!username || !password) {
        return response.status(400).json("Username and password are required");
    }

    database.collection("users").findOne({ username: username }, (error, user) => {
        if (user) {
            return response.status(400).json("User already exists");
       }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return response.status(500).json("Error hashing password");
            }

            database.collection("users").insertOne({
                username: username,
                password: hash,
                isAdmin: 0
            }, (error, result) => {
                if (error) {
                    return response.status(500).json("Error registering user");
                }

                response.json("User registered successfully");
            });
        });
    });
})

app.post('/api/bookclub/Login', (request, response) => {
    const { username, password } = request.body;

    database.collection("users").findOne({ username: username }, (error, user) => {
        if (!user) {
            return response.status(400).json("User not found");
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                request.session.user = {
                    username: user.username,
                    isAdmin: user.isAdmin
                };
                response.json({
                    message: "Login successful",
                    isAdmin: user.isAdmin
                });
            } else {
                response.status(400).json("Invalid credentials");
            }
        });
    });
})

app.get('/api/bookclub/CheckSession', (request, response) => {
    if (request.session.user) {
        response.json(request.session.user);
    } else {
        response.status(401).json("Not logged in");
    }
})

app.post('/api/bookclub/Logout', (request, response) => {
    request.session.destroy();
    response.json("Logout successful");
})

app.post('/api/bookclub/SetBookOfMonth', Express.json(), (request, response) => {
    if (!request.session.user || !request.session.user.isAdmin) {
        return response.status(403).json("Access denied");
    }

    const { bookId } = request.body;

    database.collection("books").updateMany({}, { $set: { bookOfMonth: 0 } }, (error, result) => {
        if (error) {
            return response.status(500).json("Failed to reset books");
        }

        database.collection("books").updateOne({ id: bookId }, { $set: { bookOfMonth: 1 } }, (err, res) => {
            if (err) {
                return response.status(500).json("Failed to set book of month");
            }

            response.json("Book of the month set successfully");
        });
    });
})

app.get('/api/bookclub/GetBookOfMonth', (request, response) => {
    database.collection("books").findOne({ bookOfMonth: 1 }, (error, result) => {
        if (error || !result) {
            return response.status(404).json("No book of the month found");
        }
        response.json(result);
    });
})

app.get('/api/bookclub/GetBookClubs', (request, response) => {
    database.collection("clubs").find({}).toArray((error, result) => {
        if (error) {
            return response.status(500).json("Failed to fetch book clubs");
        }
        response.send(result);
    });
})

app.post('/api/bookclub/CreateBookClub', Express.json(), (request, response) => {
    if (!request.session.user || !request.session.user.isAdmin) {
        return response.status(403).json("Access denied");
    }

    const clubName = request.body.name;

    if (!clubName) {
        return response.status(400).json("Name is required");
    }

    database.collection("clubs").count({}, function(error, numOfDocs){
        database.collection("clubs").insertOne({
            id: (numOfDocs+1).toString(),
            name: clubName,
            members: 0
        }, (error, result) => {
            if (error) {
                return response.status(500).json("Failed to create book club");
            }
            response.json("Book club created successfully");
        });
    });
})

app.put('/api/bookclub/EditBookClub', Express.json(), (request, response) => {
    if (!request.session.user || !request.session.user.isAdmin) {
        return response.status(403).json("Access denied");
    }

    const clubId = request.body.clubId;
    const clubName = request.body.clubName;

    database.collection("clubs").updateOne(
        { id: clubId },
        { $set: { name: clubName } },
        (error, result) => {
            if (error) {
                return response.status(500).json("Error updating book club");
            }
            response.json("Book club updated successfully");
        }
    );
})

app.delete('/api/bookclub/DeleteBookClub', (request, response) => {
    if (!request.session.user || !request.session.user.isAdmin) {
        return response.status(403).json("Access denied");
    }

    const clubId = request.query.id;

    database.collection("clubs").deleteOne({ id: clubId }, (error, result) => {
        if (error) {
            return response.status(500).json("Failed to delete book club");
        }
        response.json("Book club deleted successfully");
    });
})

app.post('/api/bookclub/JoinBookClub', Express.json(), (request, response) => {
    if (!request.session.user) {
        return response.status(403).json("Access denied");
    }

    const username = request.session.user.username;
    const clubId = request.body.clubId;

    database.collection("memberships").insertOne({
        clubId: clubId,
        username: username,
        joinedAt: new Date()
    }, (error, result) => {
        if (error) {
            return response.status(500).json("Error joining club");
        }

        database.collection("memberships").countDocuments({ clubId: clubId }, (err, count) => {
            if (err) {
                return response.status(500).json("Error counting members");
            }
            
            database.collection("clubs").updateOne(
                { id: clubId },
                { $set: {membersCount : count} },
            );
            response.json("Joined club successfully");
        });
    });
})

app.post('/api/bookclub/LeaveBookClub', Express.json(), (request, response) => {
    if (!request.session.user) {
        return response.status(403).json("Access denied");
    }

    const username = request.session.user.username;
    const clubId = request.body.clubId;

    database.collection("memberships").deleteOne({
        clubId: clubId,
        username: username
    }, (error, result) => {
        if (error) {
            return response.status(500).json("Error leaving club");
        }

        database.collection("memberships").countDocuments({ clubId: clubId }, (err, count) => {
            if (err) {
                return response.status(500).json("Error counting members");
            }
            
            database.collection("clubs").updateOne(
                { id: clubId },
                { $set: { membersCount: count } },
            );
            response.json("Left club successfully");
        });
    });
})