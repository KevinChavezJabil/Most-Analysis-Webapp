const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rutas existentes
router.get('/projects', authMiddleware, projectController.getProjects);
router.put('/projects/:id', authMiddleware, projectController.updateProject);
router.delete('/projects/:id', authMiddleware, projectController.deleteProject);
router.post('/upload-excel', upload.single('excelFile'), authMiddleware, projectController.uploadExcel);
router.get('/select-sheets/:projectUrl', authMiddleware, projectController.selectSheets);
router.post('/process-sheets', authMiddleware, projectController.processSheets);
router.get('/MOST_Analysis/:projectUrl/:sheetIdentifier', authMiddleware, projectController.mostAnalysis);
router.post('/create-blank-project', authMiddleware, projectController.createBlankProject);
router.post('/save-changes/:projectId/:sheetId', authMiddleware, projectController.saveChanges);

// Nueva ruta para agregar hojas
router.post('/add-sheet/:projectUrl', projectController.addSheet);
router.get('/get-sheets/:projectUrl', authMiddleware, projectController.getSheets);

// Otras rutas relacionadas
router.get('/get-components-and-methods', projectController.getComponentsAndMethods);
router.get('/api/get-cycle-time', projectController.getCycleTime);

module.exports = router;
