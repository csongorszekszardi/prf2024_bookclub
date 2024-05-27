var Express = require('express');
var MongoClient = require('mongodb').MongoClient;
var cors = require('cors');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');

var app = Express();
app.use(cors());
app.use(bodyParser.json());

var CONNECTION_STRING = "mongodb+srv://admin:abcd1234@cluster0.8qlw42m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

var DATABASE_NAME = "bookclubdb";

var database;

app.listen(5002,()=>{
    MongoClient.connect(CONNECTION_STRING, (error, client)=>{
        database=client.db(DATABASE_NAME);
        console.log("Connected to "+DATABASE_NAME+" database");
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
        });
        response.json("Book added successfully");
    });
})

app.delete('/api/bookclub/DeleteBook', (request, response)=>{
    database.collection("books").deleteOne({
        id: request.query.id
    });
    response.json("Book deleted successfully");
})

app.put('/api/bookclub/EditBook', Express.json(), (request, response) => {
    const bookId = request.body.id;
    const updatedBook = {
        title: request.body.title,
        author: request.body.author,
        year: request.body.year,
        genre: request.body.genre,
        publisher: request.body.publisher
    };
    database.collection("books").updateOne(
        { id: bookId },
        { $set: updatedBook },
    );
    response.json("Book updated successfully");
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