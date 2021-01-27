var fs = require('fs'); //importing the fs module
var RMFPPparser = require('../parser/RMFPPparser') //importing the RMFPPparser file
var Zconfig = require("../../config/Zconfig");
var appbaseurl = Zconfig.appurl;
var appbaseport = Zconfig.appport;
let httptype = Zconfig.httptype;
var axios = require('axios');
//var appURL = `${httptype}://${appbaseurl}:${appbaseport}`



/**
 * staticXMLtoJSON function handles processing Static XML file from user directories instead of DDS server
 * @param {string} req - A User Request
 * @param {JSON} res - Express Response
 */
module.exports.staticXMLtoJSON = function(req,res){
    var urlFile = req.query.file; // Get The path to static XML file specified by User
    var urlType; //
    if(req.query.type){ // If user has spercified type of report (CPU Or WLM)
        urlType = (req.query.type).toUpperCase(); //Populate Urltype variable
    } 
    try{ //try
        fs.readFile(urlFile.toString(),"utf-8", async function(err, data) { // Read the XML File content
        if (err) { //if reading failed
            throw err; // throw error
        }else { // else if reading is successful
            if(urlType === 'CPU'){ // check url type
                RMFPPparser.bodyParserforRmfCPUPP(data, function(result){ //send XML file data to post processor data
                    res.json(result); //return parser result
                }); 
            } else if(urlType === 'WLM'){ // if type is WLM
                RMFPPparser.bodyParserforRmfWLMPP(data, function(result){ //send XML file data to post processor data
                    res.json(result); //return parser result
                });
            } else{ //if type is not specified
                res.json({message:"Please specify type parameter"})
            }
        }});
    }catch(err){ //catch
        res.send(err); //Express returns Error
    }
}

/*module.exports.uploadFile = function(req, res){
    var fileType = (req.body.type).toUpperCase();
    console.log(req.file.originalname);
    console.log("type " + fileType)
    res.send("Saved Successfully")
}*/

module.exports.uploadFile = function(req, res){
    var fileType = (req.body.type).toUpperCase();
    try {
        if(!req.file) { //if file parameter is not in request
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let file = req.file;

            if (fileType === "CPU") { //if user specified CPU as report name
                filerequest(file.originalname, function (data) { //A call to the getRequestpp function made with a callback function as parameter
                    RMFPPparser.bodyParserforRmfCPUPP(data, function (result) { //data returned by the getRequestpp callback function is passed to bodyParserforRmfPP function
                    res.json(result); //Express display all the result returned by the call back function
                    });
                });
            } else if (fileType == "WLM"){
                filerequest(file.originalname, function (data) { //A call to the getRequestpp function made with a callback function as parameter
                    RMFPPparser.bodyParserforRmfWLMPP(data, function (result) { //data returned by the getRequestpp callback function is passed to bodyParserforRmfPP function
                    res.json(result); //Express display all the result returned by the call back function
                    });
                });
            }
        
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

module.exports.parseFile = function(req, res){
    var fileType = (req.body.type).toUpperCase();
    try {
        if(!req.query.file) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let file = req.query.file;

            if (fileType === "CPU") { //if user specified CPU as report name
                filerequest(file, function (data) { //A call to the getRequestpp function made with a callback function as parameter
                    RMFPPparser.bodyParserforRmfCPUPP(data, function (result) { //data returned by the getRequestpp callback function is passed to bodyParserforRmfPP function
                    res.json(result); //Express display all the result returned by the call back function
                    });
                });
            } else if (fileType == "WLM"){
                filerequest(file, function (data) { //A call to the getRequestpp function made with a callback function as parameter
                    RMFPPparser.bodyParserforRmfWLMPP(data, function (result) { //data returned by the getRequestpp callback function is passed to bodyParserforRmfPP function
                    res.json(result); //Express display all the result returned by the call back function
                    });
                });
            }
        
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

function filerequest(av, fn){
    var fileURL = `${httptype}://${appbaseurl}:${appbaseport}/${av}`
    //var fileURL = `http://localhost:3090/${av}`
    axios.get(fileURL)
    .then(function (response) {
        // handle success
        fn(response.data);
    })
    .catch(function (error) {
        // handle error
        fn(error);
    })
    .then(function () {
        // always executed
    });
}