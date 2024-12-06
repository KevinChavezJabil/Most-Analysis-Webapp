const Project = require('../database/schema/projectSchema');
const MechanicalAssembly = require('../database/schema/MechanicalAssembly');
const MechanicalComponent = require('../database/schema/MechanicalComponent');
const xlsx = require('xlsx');

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user._id });

        const projectList = projects.map(project => ({
            name: project.name,
            url: project.url,
            creationDate: project.creationDate,
            firstSheetId: project.sheets.length > 0 ? project.sheets[0]._id : null // ID de la primera hoja
        }));

        res.render('projects', { projects: projectList, suggestions: projects.map(p => p.name) });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).send('Error fetching projects');
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

        const newSheet = { name: 'Sheet 1', data: [] }; // Inicializa una hoja con nombre por defecto
        const newProject = new Project({
            name: projectName,
            url: projectUrl,
            creationDate,
            owner: req.user._id,
            sheets: [newSheet] // Agrega la hoja al proyecto
        });

        const savedProject = await newProject.save();
        const sheetId = savedProject.sheets[0]._id; // Obtén el ID de la hoja recién creada
        res.redirect(`/MOST_Analysis/${projectUrl}/${sheetId}`);
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
    const { projectUrl, sheetIdentifier } = req.params;

    try {
        const project = await Project.findOne({ url: projectUrl, owner: req.user._id });
        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        const currentSheet = project.sheets.id(sheetIdentifier);
        if (!currentSheet) {
            return res.status(404).send("Hoja no encontrada");
        }

        const components = await MechanicalComponent.find({});
        const methods = await MechanicalAssembly.find({});

        res.render('MOST_Analysis', { project, currentSheet, components, methods });
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

        const newSheet = { name: newSheetName, data: [] };
        project.sheets.push(newSheet);
        await project.save();

        const sheetId = project.sheets[project.sheets.length - 1]._id; // Obtén el ID de la hoja recién creada
        res.json({ success: true, sheetId });
    } catch (error) {
        console.error('Error al agregar hoja:', error);
        res.json({ success: false });
    }
};

exports.saveChanges = async (req, res) => {
    try {
        const { projectId, sheetId } = req.params;
        const changes = req.body; // Asegúrate de recibir los datos correctamente

        // Busca el proyecto por la URL en lugar de por ID
        const project = await Project.findOne({ url: projectId });
        if (!project) {
            return res.status(404).send("Proyecto no encontrado");
        }

        // Busca la hoja correspondiente en el proyecto
        const sheet = project.sheets.id(sheetId);
        if (!sheet) {
            return res.status(404).send("Hoja no encontrada");
        }

        // Aplica los cambios a la hoja
        changes.rowDataArray.forEach((row) => {
            row.methods = row.methods.map((methodId) => mongoose.Types.ObjectId(methodId));
        });

        sheet.data = changes.rowDataArray || sheet.data;
        sheet.name = changes.name || sheet.name;

        // Guarda el proyecto actualizado
        await project.save();
        res.status(200).json({ success: true, message: "Cambios guardados exitosamente" });
    } catch (error) {
        console.error("Error al guardar cambios:", error);
        res.status(500).json({ success: false, message: "Error al guardar cambios" });
    }
};