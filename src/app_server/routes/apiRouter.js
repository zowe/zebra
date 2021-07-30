var express = require('express');
var router = express.Router();
var  ctrlStatic = require('../Hierarchical/apiController');
var multer  = require('multer')
const path = require('path');
const fs = require('fs');

router.get('/:lpar/:monitor/:report',  ctrlStatic.api)

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