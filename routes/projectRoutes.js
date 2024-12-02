const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/projects', authMiddleware, projectController.getProjects);
router.put('/projects/:id', authMiddleware, projectController.updateProject);
router.delete('/projects/:id', authMiddleware, projectController.deleteProject);

// Ruta para cargar archivos Excel
router.post('/upload-excel', upload.single('excelFile'), authMiddleware, projectController.uploadExcel);

// Ruta para seleccionar hojas
router.get('/select-sheets/:projectUrl', authMiddleware, projectController.selectSheets);

// Ruta para procesar hojas seleccionadas
router.post('/process-sheets', authMiddleware, projectController.processSheets);

// Ruta para MOST Analysis
router.get('/MOST_Analysis/:projectUrl', authMiddleware, projectController.mostAnalysis);

// Nueva ruta para crear un proyecto en blanco
router.post('/create-blank-project', authMiddleware, projectController.createBlankProject);

// Ruta para guardar cambios
router.post('/save-changes/:projectId', authMiddleware, projectController.saveChanges);

// Ruta para agregar hojas
router.post('/add-sheet', authMiddleware, projectController.addSheet);

module.exports = router;