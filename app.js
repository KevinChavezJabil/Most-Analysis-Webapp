const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const Connection = require("./database/db");
const authRoute = require("./routes/route");
const projectRoutes = require('./routes/projectRoutes'); // Nueva ruta de proyectos
const authMiddleware = require('./middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const moment = require('moment');
const xlsx = require('xlsx');

app.set('view engine', 'ejs');
Connection();

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/home', authMiddleware, (req, res) => {
    res.render('home');
});

app.get('/excelUpload', authMiddleware, (req, res) => {
    res.render('excelUpload');
});

app.get('/settings', authMiddleware, (req, res) => {
    res.render('settings');
});

app.get('/MOST_Analysis', authMiddleware, (req, res) => {
    res.render('MOST_Analysis');
});

app.get('/api/methods', async (req, res) => {
    try {
        const methods = await MechanicalAssembly.find();
        const components = await MechanicalComponent.find();
        res.json({ methods, components });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.use("/api", authRoute);
app.use('/', projectRoutes); // Asegúrate de que esta línea esté presente

app.use(authMiddleware, (req, res, next) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log('Server running on port', port);
});
