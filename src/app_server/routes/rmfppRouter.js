var express = require('express');
var router = express.Router();
var  ctrlRmfPP = require('../Controllers/RMFPPcontroller');

/* RmfPP Controller Router. */
router.get('/',  ctrlRmfPP.rmfpp) 

router.get('/error',  function(req, res){
    var result = req.query.emsg;
    //var c = res.query.errorw;
    //console.log(`c ${c}`)
    try{
      if(result === "DE"){ //Data Error from parser
        res.render('error/dataerror')
      }else if(result === "NE"){ //NODE Version Error
        res.render('error/nodeerror') 
      }else if(result === "UA"){ //NODE Version Error
        res.render('error/autherror') 
      }else if(result === "EOUT"){ //NODE Version Error
        res.render('error/timeout')
      }else if(result === "Err"){
        res.render('error/parserError', {data:result});
      }else{
        res.render('error/parserError', {data:result});
      }
    }catch(e){
        res.render('error/nodata', {msg:`Error Message: ${result}`});
    }
    
});

module.exports = router;