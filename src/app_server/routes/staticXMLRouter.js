var express = require('express');
var multer = require('multer');
var router = express.Router();
var  ctrlStatic = require('../Controllers/staticXMLFileController');

var storage = multer.memoryStorage();

var upload = multer({ 
    storage, 
    limits: {
        fieldSize: 32 * 1024 * 1024,
        fileSize: 32 * 1024 * 1024
    }
}); // make use of storage above


/* Static Controller Router. */
router.post('/',  upload.single('xml'), ctrlStatic.staticXMLtoJSON) ;

module.exports = router;