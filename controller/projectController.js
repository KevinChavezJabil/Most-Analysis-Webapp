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
//logica para actualizar un proyecto
};

exports.deleteProject = (req, res) => {
//logica para borrar un proyecto
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
//logica para subir un excel
};

exports.selectSheets = async (req, res) => {
//logica para seleccionar una hoja del proyecto
};

exports.processSheets = async (req, res) => {
//logica para procesar las hojas seleccionadas
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