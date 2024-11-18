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

<<<<<<< HEAD
=======
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

>>>>>>> 9fa256fa03dc376ffd303b554f0477c5cf116102
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

<<<<<<< HEAD
=======
app.get('/MOST_Analysis/:projectUrl', authMiddleware, async (req, res) => {
    const { projectUrl } = req.params;

    try {
        const project = await Project.findOne({ url: projectUrl, owner: req.user._id });
        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        // Pasa los datos del proyecto y el Excel a la plantilla EJS
        res.render('MOST_Analysis', { project, excelData: project.excelData });
    } catch (error) {
        console.error('Error al cargar el proyecto:', error);
        res.status(500).send('Error al cargar el proyecto');
    }
});

app.get('/select-sheets/:projectUrl', authMiddleware, async (req, res) => {
    const { projectUrl } = req.params;
    
    try {
        const project = await Project.findOne({ url: projectUrl, owner: req.user._id });
        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        res.render('selectSheets', { projectUrl, sheetNames: project.sheetNames });
    } catch (error) {
        console.error('Error al cargar el proyecto:', error);
        res.status(500).send('Error al cargar el proyecto');
    }
});

app.post('/upload-excel', upload.single('excelFile'), authMiddleware, async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No se ha cargado ningún archivo');
    }

    // Lee el archivo Excel desde el buffer
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames; // Obtener los nombres de las hojas

    // Genera un nombre y URL únicos para el proyecto
    const projectName = file.originalname.split('.')[0];
    const creationDate = new Date();
    const projectUrl = `${projectName.replace(/ /g, '-').toLowerCase()}-${Date.now()}`;

    // Guarda el proyecto con los nombres de las hojas en la base de datos
    const newProject = new Project({
        name: projectName,
        url: projectUrl,
        creationDate,
        owner: req.user._id,
        sheetNames  // Almacena solo los nombres de las hojas por ahora
    });
    await newProject.save();

    // Redirige al usuario a la página para seleccionar las hojas
    res.redirect(`/select-sheets/${projectUrl}`);
});

app.post('/process-sheets', authMiddleware, async (req, res) => {
    const { projectUrl, selectedSheets } = req.body;

    if (!selectedSheets || selectedSheets.length === 0) {
        return res.status(400).send('No sheets selected');
    }

    try {
        const project = await Project.findOne({ url: projectUrl, owner: req.user._id });
        if (!project) {
            return res.status(404).send("Project not found");
        }

        // Aquí puedes procesar las hojas seleccionadas si es necesario

        // Redirige a la página de análisis MOST
        res.redirect(`/MOST_Analysis/${projectUrl}`);
    } catch (error) {
        console.error('Error processing sheets:', error);
        res.status(500).send('Error processing sheets');
    }
});

app.post('/process-selected-sheets', authMiddleware, async (req, res) => {
    const { projectId, selectedSheets } = req.body;

    try {
        // Encuentra el proyecto y verifica si ya tiene las hojas cargadas
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send('Proyecto no encontrado');
        }

        let workbook;
        if (req.file && req.file.buffer) {
            // Si el archivo fue cargado en la solicitud, úsalo
            workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        } else if (project.excelData) {
            // Si el archivo ya está en la base de datos, úsalo
            workbook = xlsx.read(project.excelData, { type: 'base64' });
        } else {
            return res.status(400).send('No se ha proporcionado un archivo para procesar');
        }

        // Procesa las hojas seleccionadas
        const processedData = {};
        selectedSheets.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            processedData[sheetName] = xlsx.utils.sheet_to_json(worksheet);
        });

        // Puedes hacer algo con `processedData`, como guardarlo en la base de datos o enviarlo a la vista
        res.json({ success: true, data: processedData });

    } catch (error) {
        console.error('Error al procesar las hojas seleccionadas:', error);
        res.status(500).send('Error al procesar las hojas seleccionadas');
    }
});

// Ruta para actualizar el nombre del proyecto
app.put('/projects/:id', authMiddleware, (req, res) => {
    const projectId = req.params.id;
    const newName = req.body.name;
    // Lógica para actualizar el nombre del proyecto en la base de datos
    Project.findByIdAndUpdate(projectId, { name: newName }, (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error updating project name.' });
        } else {
            res.json({ success: true, message: 'Project name updated successfully!' });
        }
    });
});

// Ruta para eliminar el proyecto
app.delete('/projects/:id', authMiddleware, (req, res) => {
    const projectId = req.params.id;
    // Lógica para eliminar el proyecto de la base de datos
    Project.findByIdAndDelete(projectId, (err) => {
        if (err) {
            res.json({ success: false, message: 'Error deleting project.' });
        } else {
            res.json({ success: true, message: 'Project deleted successfully!' });
        }
    });
});

>>>>>>> 9fa256fa03dc376ffd303b554f0477c5cf116102
app.use("/api", authRoute);
app.use('/', projectRoutes); // Asegúrate de que esta línea esté presente

app.use(authMiddleware, (req, res, next) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log('Server running on port', port);
});
