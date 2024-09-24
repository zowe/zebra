const express = require('express');
const router = express.Router();
const hmaiController = require('../Controllers/hmaiController');

router.post('/start', hmaiController.startHMAI);
router.post('/clear-db', hmaiController.clearDatabase);
router.post('/get-csv', hmaiController.getCSVData);
router.post('/download-csv', hmaiController.downloadCSV);
router.post('/check-new-data', hmaiController.checkNewData);
router.post('/stop-monitoring', hmaiController.stopContinuousMonitoring);  
router.post('/save-config', hmaiController.saveHMAIConfig);
router.get('/running-processes', hmaiController.getRunningProcesses);
router.post('/start-all', hmaiController.startHMAIForAllLpars);
module.exports = router;