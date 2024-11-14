const Project = require('../database/schema/projectSchema');
const MechanicalAssembly = require('../database/schema/MechanicalAssembly');
const MechanicalComponent = require('../database/schema/MechanicalComponent');
const xlsx = require('xlsx');

exports.getProjects = async (req, res) => {
    try {
        const userId = req.user._id;
        const projects = await Project.find({ owner: userId });
        const projectNames = projects.map(project => project.name);
        res.render('projects', { projects, suggestions: projectNames });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.render('projects', { projects: [], suggestions: [] });
    }
};

exports.updateProject = (req, res) => {
    const projectId = req.params.id;
    const newName = req.body.name;
    Project.findByIdAndUpdate(projectId, { name: newName }, (err, result) => {
        if (err) {
            res.json({ success: false, message: 'Error updating project name.' });
        } else {
            res.json({ success: true, message: 'Project name updated successfully!' });
        }
    });
};

exports.deleteProject = (req, res) => {
    const projectId = req.params.id;
    Project.findByIdAndDelete(projectId, (err) => {
        if (err) {
            res.json({ success: false, message: 'Error deleting project.' });
        } else {
            res.json({ success: true, message: 'Project deleted successfully!' });
        }
    });
};

exports.uploadExcel = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No se ha cargado ningún archivo');
    }

    // Lee el archivo Excel desde el buffer
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convierte la hoja en un array de objetos
    const rawData = xlsx.utils.sheet_to_json(worksheet);

    // Guarda los datos del Excel en la base de datos
    const projectName = file.originalname.split('.')[0];
    const creationDate = new Date();
    const projectUrl = `${projectName.replace(/ /g, '-').toLowerCase()}-${Date.now()}`;
    
    const newProject = new Project({
        name: projectName,
        url: projectUrl,
        creationDate,
        owner: req.user._id,
        excelData: { 'Hoja1': rawData } // Guarda los datos del Excel en un objeto con la hoja como clave
    });
    await newProject.save();

    // Redirige al usuario al URL personalizado de MOST Analysis del proyecto
    res.redirect(`/MOST_Analysis/${projectUrl}`);
};

exports.selectSheets = async (req, res) => {
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
};

exports.processSheets = async (req, res) => {
    const { projectUrl, selectedSheets } = req.body;

    if (!selectedSheets || selectedSheets.length === 0) {
        return res.status(400).send('No sheets selected');
    }

    try {
        const project = await Project.findOne({ url: projectUrl, owner: req.user._id });
        if (!project) {
            return res.status(404).send("Project not found");
        }
        res.redirect(`/MOST_Analysis/${projectUrl}`);
    } catch (error) {
        console.error('Error processing sheets:', error);
        res.status(500).send('Error processing sheets');
    }
};

exports.mostAnalysis = async (req, res) => {
    const { projectUrl } = req.params;

    try {
        const project = await Project.findOne({ url: projectUrl, owner: req.user._id });
        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        const excelData = project.excelData;

        console.log('Datos enviados a la vista:', excelData); // Para depurar

        res.render('MOST_Analysis', { project, excelData });
    } catch (error) {
        console.error('Error al cargar el proyecto:', error);
        res.status(500).send('Error al cargar el proyecto');
    }
};

exports.saveChanges = async (req, res) => {
    const { projectId } = req.params;
    const { rowData } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        // Actualizar datos en excelData (busca la fila correspondiente y actualiza)
        const sheetName = "Hoja1"; // Ajusta según sea necesario
        const rowIndex = project.excelData[sheetName].findIndex(row => row["Part Number"] === rowData.partNumber);

        if (rowIndex !== -1) {
            project.excelData[sheetName][rowIndex] = rowData;
        }

        await project.save();
        res.status(200).send("Cambios guardados exitosamente");
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        res.status(500).send('Error al guardar cambios');
    }
};


