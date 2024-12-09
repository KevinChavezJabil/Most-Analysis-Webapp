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
    try {
        const { projectUrl, sheetIdentifier } = req.params;

        const project = await Project.findOne({ url: projectUrl, owner: req.user._id });
        if (!project) return res.status(404).send("Project not found");

        const currentSheet = project.sheets.id(sheetIdentifier);
        if (!currentSheet) return res.status(404).send("Sheet not found");

        const components = await MechanicalComponent.find({});
        const methods = await MechanicalAssembly.find({});

        res.render('MOST_Analysis', {
            project,
            currentSheet,
            components, // Array de { _id, name }
            methods // Array de { _id, name }
        });
    } catch (error) {
        console.error("Error loading MOST Analysis:", error);
        res.status(500).send("Error loading MOST Analysis");
    }
};

exports.getComponentsAndMethods = async (req, res) => {
    try {
        const components = await MechanicalComponent.find({});
        const methods = await MechanicalAssembly.find({});
        res.json({ components, methods });
    } catch (error) {
        console.error("Error fetching components and methods:", error);
        res.status(500).json({ error: "Error fetching components and methods" });
    }
};

exports.getCycleTime = async (req, res) => {
    try {
        const { componentId, methodIds } = req.query;
        const component = await MechanicalComponent.findById(componentId);
        const methods = await MechanicalAssembly.find({ _id: { $in: methodIds.split(',') } });

        let totalCycleTime = component.standard_time;
        methods.forEach(method => {
            totalCycleTime += method.standard_time;
        });

        res.json({ cycleTime: totalCycleTime });
    } catch (error) {
        console.error("Error fetching cycle time:", error);
        res.status(500).json({ error: "Error fetching cycle time" });
    }
};

exports.addSheet = async (req, res) => {
    try {
        // Encuentra los ObjectId de los métodos y componentes por nombre
        const componentName = req.body.component; // Ejemplo: "Component 1"
        const methodNames = req.body.methods; // Ejemplo: ["Method A", "Method B"]

        const component = await MechanicalComponent.findOne({ name: componentName }).select('_id');
        const methods = await MechanicalAssembly.find({ name: { $in: methodNames } }).select('_id');

        if (!component || methods.length === 0) {
            return res.status(404).json({ error: "Component or methods not found" });
        }

        // Crea una nueva hoja con los ObjectId
        const newSheet = {
            name: req.body.name,
            data: req.body.data.map((row) => ({
                partNumber: row.partNumber,
                description: row.description,
                quantity: row.quantity,
                component: component._id,
                methods: methods.map((method) => method._id),
                cycleTime: row.cycleTime,
            })),
        };

        // Agrega la hoja al proyecto
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        project.sheets.push(newSheet);
        await project.save();

        res.status(200).json({ message: "Sheet added successfully", project });
    } catch (error) {
        console.error('Error al agregar hoja:', error);
        res.status(500).json({ error: "Error al agregar hoja" });
    }
};

exports.saveChanges = async (req, res) => {
    try {
        const { projectId, sheetId } = req.params;
        const changes = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).send("Project not found");

        const sheet = project.sheets.id(sheetId);
        if (!sheet) return res.status(404).send("Sheet not found");

        // Aplica los cambios de forma segura
        sheet.name = changes.name || sheet.name;
        sheet.data = changes.rowDataArray || sheet.data;

        await project.save();
        res.status(200).json({ success: true, message: "Changes saved successfully", sheet });
    } catch (error) {
        console.error("Error saving changes:", error);
        res.status(500).json({ error: "Error saving changes" });
    }
};