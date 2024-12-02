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

exports.createBlankProject = async (req, res) => {
    try {
        const projectName = `Blank Project ${Date.now()}`;
        const projectUrl = `blank-project-${Date.now()}`;
        const creationDate = new Date();
        const newProject = new Project({
            name: projectName,
            url: projectUrl,
            creationDate,
            owner: req.user._id,
            excelData: { 'Hoja1': [] }, // Proyecto en blanco con una hoja vacía
            sheets: [{ name: 'Hoja1', data: [] }] // Asegurarse de que haya al menos una hoja
        });
        await newProject.save();
        res.redirect(`/MOST_Analysis/${projectUrl}`);
    } catch (error) {
        console.error('Error creating blank project:', error);
        res.status(500).send('Error creating blank project');
    }
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
    const sheetIndex = parseInt(req.query.sheetIndex) || 0;

    try {
        const project = await Project.findOne({ url: projectUrl, owner: req.user._id });
        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        // Asegurarse de que project.sheets esté definido y tenga al menos una hoja
        if (!project.sheets || project.sheets.length === 0) {
            project.sheets = [{ name: 'Hoja1', data: [] }];
            await project.save();
        }

        // Asegurarse de que el índice de la hoja esté dentro del rango válido
        const validSheetIndex = Math.min(Math.max(sheetIndex, 0), project.sheets.length - 1);
        const currentSheet = project.sheets[validSheetIndex];

        res.render('MOST_Analysis', { project, currentSheet });
    } catch (error) {
        console.error('Error en MOST Analysis:', error);
        res.status(500).send('Hubo un error al cargar la página de análisis.');
    }
};

exports.addSheet = async (req, res) => {
    const { projectUrl, newSheetName } = req.body;

    try {
        const project = await Project.findOne({ url: projectUrl, owner: req.user._id });
        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        if (!project.excelData[newSheetName]) {
            project.excelData[newSheetName] = [];
            project.sheets.push({ name: newSheetName, data: [] });
            await project.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error al agregar hoja:', error);
        res.json({ success: false });
    }
};

exports.saveChanges = async (req, res) => {
    const { projectId } = req.params;
    const { sheetName, rowDataArray } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        // Actualizar datos en excelData
        project.excelData[sheetName] = rowDataArray;

        await project.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        res.status(500).send('Error al guardar cambios');
    }
};

