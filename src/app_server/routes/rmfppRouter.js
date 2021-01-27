var express = require('express');
var router = express.Router();
var  ctrlRmfPP = require('../Controllers/RMFPPcontroller');

/* RmfPP Controller Router. */
router.get('/',  ctrlRmfPP.rmfpp) 


module.exports = router;