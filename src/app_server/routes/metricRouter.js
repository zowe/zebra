const router = require('express').Router();
const metricController = require('../v1_Controllers/MetricController');


// PROMETHEUS METRIC API

router.post('/:metric', metricController.create);

router.get('/', metricController.retrieve);

router.get('/:metric', metricController.retrieveOne);

router.put('/:metric', metricController.update);

router.delete('/:metric', metricController.delete);


module.exports = router;