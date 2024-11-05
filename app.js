// constants
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const Connection = require("./database/db");
const authRoute = require("./routes/route");
const authMiddleware = require('./middleware/auth');

app.set('view engine', 'ejs');
Connection();

// middleware
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

// Set CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL); // Replace with your frontend domain
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies, etc.)
  next();
});

// render views
app.get('/', (req, res) => {
    console.log(__dirname)
    res.render('index')
});

app.get('/home', authMiddleware, (req, res) => {
    res.render('home');
});

app.get('/projects', authMiddleware, (req, res) => {
    res.render('projects');
});

app.get('/excelUpload', authMiddleware, (req, res) => {
    res.render('excelUpload');
});

app.get('/settings', authMiddleware, (req, res) => {
    res.render('settings');
});

app.get('/MOST', authMiddleware, (req, res) => {
    res.render('MOST');
});

// Rutas de autenticación
app.use("/api", authRoute); // Añadir las rutas de autenticación

// Manejo de errores 404
app.use(authMiddleware, (req, res, next) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log('Server running on port', port);
});
