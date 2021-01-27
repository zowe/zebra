var express = require('express');
var router = express.Router();
var  ctrlStatic = require('../Controllers/staticXMLFileController');

/* Static Controller Router. */
router.get('/',  ctrlStatic.staticXMLtoJSON) 

module.exports = router;