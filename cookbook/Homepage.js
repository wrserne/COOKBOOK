const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();
const session = require('express-session');

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

// MySQL Connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'cookbook', // Specify the cookbook database
    insecureAuth: true
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database!');
});

// Set up Express.js
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Homepage - Carousel of Recipe Images
app.get('/', (req, res) => {
    // Retrieve all recipes from the database
    const sql = 'SELECT * FROM recipes';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving recipes: ' + err.stack);
            res.status(500).send('Error retrieving recipes.');
            return;
        }
        console.log('Results:', results);
        res.render('home', { recipes: results, authenticated: req.session.authenticated, userId: req.session.userId });
    });
});

// Add Recipe - Form Submission
app.post('/add', (req, res) => {
    // Add recipe logic (same as before)
    // Don't forget to add appropriate console logs if needed for debugging
});

// User Registration - Form Submission
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log('Received registration request for:', username, password);

    // Insert new user into the 'cookbook.users' table
    const sql = 'INSERT INTO cookbook.users (username, password) VALUES (?, ?)'; // Use 'cookbook.users'
    connection.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error('Error registering user: ' + err.stack);
            res.status(500).send('Error registering user.');
            return;
        }
        console.log('User registered successfully!');
        res.redirect('/login'); // Redirect to the login page after registration
    });
});

// User Login - Form Submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Received login request for:', username, password);

    // Validate the username and password against the 'cookbook.users' table
    const sql = 'SELECT * FROM cookbook.users WHERE username = ? AND password = ?'; // Use 'cookbook.users'
    connection.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Error logging in: ' + err.stack);
            res.status(500).send('Error logging in.');
            return;
        }

        if (results.length > 0) {
            // Set the session variables for authenticated user
            req.session.authenticated = true;
            req.session.userId = results[0].id;
            res.redirect('/');
        } else {
            // Authentication failed, redirect back to the login page or show an error message
            res.redirect('/login');
        }
    });
});
app.get('/recipe/:id', (req, res) => {
    const recipeId = req.params.id;

    // Retrieve the recipe details from the database based on the recipeId
    const sql = 'SELECT * FROM recipes WHERE id = ?';
    connection.query(sql, [recipeId], (err, results) => {
        if (err) {
            console.error('Error retrieving recipe details: ' + err.stack);
            res.status(500).send('Error retrieving recipe details.');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Recipe not found.');
            return;
        }

        // Render the recipe-details.ejs template with the recipe details
        res.render('recipe-details', { recipe: results[0] });
    });
});

// Logout - Clear Session
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out: ' + err.stack);
        }
        res.redirect('/');
    });
});

// Registration Page
app.get('/register', (req, res) => {
    res.render('register');
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
