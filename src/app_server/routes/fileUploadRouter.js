var express = require('express');
var router = express.Router();
var  ctrlStatic = require('../Controllers/staticXMLFileController');
var multer  = require('multer')
const path = require('path');
const fs = require('fs');

// handler for fie storage in /uploads
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) //Appending extension
    }
})

var upload = multer({ storage: storage }); // make use of storage above

//upload a single file using /file
router.post('/', upload.single('avatar_file'),  ctrlStatic.uploadFile)

//parse file from /upload directory using the parseFile function in staticXMLFileController.js
router.post('/parse', ctrlStatic.parseFile)

// Delete file from /upoad directory
router.post('/delete', (req, res) => {
    var file = req.query.file; //get filename from request
    const directoryPath = path.join(__dirname, `../../uploads/${file}`); // the path to the file

    try{
        fs.unlink(directoryPath, function(err) { // remove the fie from the directory
            if (err) { 
              throw err //if error, throw it
            } else {
                const directoryPath = path.join(__dirname, '../../uploads'); // the path to the uploads
                fs.readdir(directoryPath, function (err, files) { //read the uploads direcory
                    //handling error
                    if (err) {
                        res.send('Unable to scan uploads directory: ' + err); // send tghis messgae in case of error
                    } 
                    res.render("files", {resfiles: files, msg:`Successfully deleted ${file}.`}); // send this message if scan is successful
                });
            }
        });
    }catch(err){
        res.send(err);
    }
});

module.exports = router;