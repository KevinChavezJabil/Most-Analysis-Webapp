const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const Connection = require("./database/db");
const authRoute = require("./routes/route");
const authMiddleware = require('./middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Project = require('./database/schema/projectSchema'); // Asegúrate de que la ruta sea correcta
const MechanicalAssembly = require('./database/schema/MechanicalAssembly');
const MechanicalComponent = require('./database/schema/MechanicalComponent');
const moment = require('moment');

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

const mongoose = require('mongoose');

app.get('/projects', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Asegúrate de que req.user contiene el usuario autenticado
        const projects = await Project.find({ owner: userId });
        const projectNames = projects.map(project => project.name); // Obtener los nombres de los proyectos
        res.render('projects', { projects, suggestions: projectNames });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.render('projects', { projects: [], suggestions: [] }); // Renderiza una lista vacía en caso de error
    }
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

app.post('/MOST_Analysis', upload.single('excelFile'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No se ha cargado ningún archivo');
    }
    
    const projectName = file.originalname.split('.')[0];
    const creationDate = new Date();
    const projectUrl = projectName.replace(/ /g, '-').toLowerCase();

    const newProject = new Project({
        name: projectName,
        url: projectUrl,
        creationDate,
        owner: req.user._id,
    });
    await newProject.save();

    res.redirect(`/MOST_Analysis/${projectUrl}`);
});

app.use("/api", authRoute);

app.use(authMiddleware, (req, res, next) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log('Server running on port', port);
});
