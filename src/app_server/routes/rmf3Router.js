var express = require('express');
var router = express.Router();
var  ctrlRmf3 = require('../Controllers/RMF3Controller');

/* RMF3 Controller Router. */
router.get('/',  ctrlRmf3.rmfIII) //Route for caption and column parameters.

module.exports = router;