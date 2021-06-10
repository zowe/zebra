const axios = require('axios');
var RMFMonitor3parser = require('../parser/RMFMonitor3parser') //importing the RMFMonitor3parser file
var RMFPPparser = require('../parser/RMFPPparser') //importing the RMFPPparser file
var Zconfig = require("./dds");

/**
 * RMFMonitor3getRequest is the GET function for retrieving data from RMF monitor III.
 * @param {string} baseurl - The the IP address or the symbolic name of the DDS server, obtained from Zconfig file. 
 * @param {string} baseport - The port of the DDS server, obtained from Zconfig file.
 * @param {string} rmf3filename - The filename of the XML document you want to retrieve, followed by the extension .xml (rmfm3.xml), obtained from Zconfig file.
 * @param {string} urlReport - Monitor III report name, obtained from URL User Input.
 * @param {string} mvsResource - Monitor III resource identifier, obtained from Zconfig file.
 * @param {XML} fn - Callback function which returns an XML containing data from Monitor III.
 */
 function RMFMonitor3getRequest(ddshttp, baseurl, baseport, rmf3filename, urlReport, mvsResource, ddsid, ddspass, ddsauth, fn) { //fn is to return value from callback
    //Use backtick for URL string formatting
    var RMF3URL = `${ddshttp}://${baseurl}:${baseport}/gpm/${rmf3filename}?report=${urlReport}&resource=${mvsResource}`; //Dynamically create URL
    if(ddsauth === 'true'){
      axios.get(RMF3URL, {
        auth: {
          username: ddsid,
          password: ddspass
        }
      })
      .then(function (response) {
        // handle success
        fn(response.data);
        //console.log(response.data);
      })
      .catch(function (error) {
        // handle error
        try{
          if(parseInt(error.response.status) === 401){
            fn("UA");
          }else{
            fn(error["errno"]);
          }
        }catch(e){
          fn(error["errno"]);
        }
        
        //console.log(error.response.status);
        //console.log(error);
      })
      .then(function () {
        // always executed
      });
    }else{
      axios.get(RMF3URL)
      .then(function (response) {
        // handle success
        fn(response.data);
      })
      .catch(function (error) {
        // handle error
        //console.log(error)
        try{
          if(parseInt(error.response.status) === 401){
            fn("UA");
          }else{
            fn(error["errno"]);
          }
        }catch(e){
          fn(error["errno"]);
        }
      })
      .then(function () {
        // always executed
      });
  
    } 
}

module.exports.api = async function (req, res) {

    if(req.params.lpar){
        var c = Zconfig["dds"][req.params.lpar];
        RMFMonitor3getRequest(c["ddshhttptype"], c["ddsbaseurl"], c["ddsbaseport"], c["rmf3filename"], req.params.report, c["mvsResource"], c["ddsuser"], c["ddspwd"], c["ddsauth"], function (data) {
            RMFMonitor3parser.RMF3bodyParser(data, function (result) {
                res.json(result)
            });
            

        });
        //res.json(c);
    }

};
