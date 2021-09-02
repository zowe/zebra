var express = require('express');
var router = express.Router();
var  rmf3controller = require('../v1_Controllers/RMF3Controller');
var  rmfppcontroller = require('../v1_Controllers/RMFPPController');
var multer  = require('multer')
const path = require('path');
const fs = require('fs');

router.get('/:lpar/rmf',  rmf3controller.RMFIIImetrics);

router.get('/:lpar/rmf3/:report',  rmf3controller.RMFIII);

router.get('/:lpar/rmf3/:report/:apiml',  rmf3controller.RMFIII);

router.get('/:lpar/:rmfpp/:report',  rmfppcontroller.rmfpp)

router.get('/:lpar/:rmfpp/:report/:apiml',  rmfppcontroller.rmfpp)

/*router.get('/:lpar/:resource/:file/:monitor/:report',  function(req, res){
    res.json({
        ddslpar: req.params.lpar,
        ddsresource: req.params.resource,
        ddsfile: req.params.file,
        ddsmonitor: req.params.monitor,
        ddsreport: req.params.report
    });
})*/

module.exports = router;