const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const Connection = require("./database/db");
const authRoute = require("./routes/route");
const projectRoutes = require('./routes/projectRoutes'); 
const authMiddleware = require('./middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const moment = require('moment');
const xlsx = require('xlsx');
const User = require('./database/schema/Schema'); 

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

app.get('/settings', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render('settings', { user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Error fetching user data');
    }
});

app.get('/MOST_Analysis', authMiddleware, (req, res) => {
    res.render('MOST_Analysis', {
        components: JSON.stringify(components),
        methods: JSON.stringify(methods),
    });
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

const checkEmailRoute = require('./routes/checkEmail');
app.use('/api', checkEmailRoute);

app.use(authMiddleware, (req, res, next) => {
    res.status(404).render('404');
});

app.post('/settings/update', authMiddleware, async (req, res) => {
    const { field, value } = req.body;
    const userId = req.user._id; // Usamos el ID del usuario desde el middleware de autenticación

    try {
        // Actualiza el campo correspondiente en la base de datos
        await User.findByIdAndUpdate(userId, { [field]: value });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        res.json({ success: false });
    }
});

app.listen(port, () => {
    console.log('Server running on port', port);
});