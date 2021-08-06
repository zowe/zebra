var RMFPPparser = require('../parser/RMFPPparser') //importing the RMFPPparser file
var RMFM3parser = require('../parser/RMFMonitor3parser');


/**
 * staticXMLtoJSON function handles processing Static XML file from user directories instead of DDS server
 * @param {string} req - A User Request
 * @param {JSON} res - Express Response
 */
module.exports.staticXMLtoJSON = function(req,res){
    var urlFile = req.file; // Get The path to static XML file specified by User
    var urlType = "";
    try{ //try
        const data = urlFile.buffer.toString('utf-8');
        let index = data.indexOf('metric id=\"') + 'metric id=\"'.length;
        while (data[index] !== "\"") {
            urlType = urlType.concat(data[index]);
            index += 1;
        }
        if(urlType === 'CPU'){ // check url type
            RMFPPparser.bodyParserforRmfCPUPP(data, function(result){ //send XML file data to post processor data
                res.json(result); //return parser result
            }); 
        } else if(urlType === 'WLMGL'){ // if type is WLMGL
            RMFPPparser.bodyParserforRmfWLMPP(data, function(result){ //send XML file data to post processor data
                res.json(result); //return parser result
            });
        } else if (urlType === "") { // if type is not specified
            res.json({message:"Invalid report type"});
        } else{ // rmf monitor 3 type
            RMFM3parser.RMF3bodyParser(data, function(result) {
                res.json(result);
            });
        };
    }catch(err){ //catch
        res.send(err); //Express returns Error
    }
}