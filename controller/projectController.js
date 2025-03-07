const Project = require('../database/schema/projectSchema');
const mongoose = require('mongoose');
const MechanicalAssembly = require('../database/schema/MechanicalAssembly');
const MechanicalComponent = require('../database/schema/MechanicalComponent');
const xlsx = require('xlsx');

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user._id }).sort({ creationDate: -1 });

        const projectList = projects.map(project => ({
            name: project.name,
            url: project.url,
            creationDate: project.creationDate,
            firstSheetId: project.sheets.length > 0 ? project.sheets[0]._id : null
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
            components,
            methods 
        });        
    } catch (error) {
        console.error("Error loading MOST Analysis:", error);
        res.status(500).send("Error loading MOST Analysis");
    }
};

exports.addSheet = async (req, res) => {
    try {
        const { projectUrl } = req.params; 

        const project = await Project.findOne({ url: projectUrl });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const sheetCount = project.sheets.length;
        const newSheetName = `Sheet ${sheetCount + 1}`;

        const newSheet = {
            name: newSheetName,
            data: [],
        };

        project.sheets.push(newSheet);
        await project.save();

        const savedSheet = project.sheets[project.sheets.length - 1]; // Obtén la hoja recién creada
        res.status(200).json({ message: "Sheet added successfully", sheet: savedSheet });
    } catch (error) {
        console.error('Error al agregar hoja:', error);
        res.status(500).json({ error: "Error al agregar hoja" });
    }
};

exports.getSheets = async (req, res) => {
    try {
        const project = await Project.findOne({ url: req.params.projectUrl }).select('sheets');
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.json(project.sheets); // Devuelve las hojas del proyecto
    } catch (error) {
        console.error('Error al obtener las hojas:', error);
        res.status(500).json({ message: 'Error al obtener las hojas' });
    }
};

exports.saveChanges = async (req, res) => {
    try {
        const { projectId, sheetId } = req.params;
        const { rowDataArray } = req.body;

        const project = await Project.findOne({ url: projectId });
        if (!project) return res.status(404).send("Project not found");

        const sheet = project.sheets.id(sheetId);
        if (!sheet) return res.status(404).send("Sheet not found");

        sheet.data = rowDataArray.map(item => ({
            partNumber: item.partNumber,
            description: item.description,
            quantity: item.quantity,
            component: new mongoose.Types.ObjectId(item.component),
            methods: (item.methods || []).map(method => new mongoose.Types.ObjectId(method)),
            cycleTime: item.cycleTime || 0
        }))

        await project.save();
        res.status(200).json({ success: true, message: "Changes saved successfully", sheet });
    } catch (error) {
        console.error("Error saving changes:", error);
        res.status(500).json({ error: "Error saving changes" });
    }
};