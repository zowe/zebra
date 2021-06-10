var express = require('express');
var router = express.Router();
var  ctrlStatic = require('../Hierarchical/apiController');
var multer  = require('multer')
const path = require('path');
const fs = require('fs');

router.get('/:lpar/:resource/:monitor/:report',  ctrlStatic.api)

/*res.json({
        ddslpar: req.params.lpar,
        ddsresource: req.params.resource,
        ddsmonitor: req.params.monitor,
        ddsreport: req.params.report
    });*/

module.exports = router;