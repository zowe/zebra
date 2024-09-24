var express = require('express');
var router = express.Router();
var  ctrlMain = require('../Controllers/mainController');
var  ctrlConfig = require('../Controllers/config');
var  ctrlMongo = require('../Controllers/mongohandler');
const Prometheus = require('prom-client');
var session = require('express-session');
const swaggerUi = require('swagger-ui-express'),
    swaggerdoc = require("../../Zebra_Swagger.json");
var ctrlHmai = require('../Controllers/hmaiController');
const { getMetrics } = require('../../metrics');
require('dotenv').config();
const bcrypt = require('bcryptjs')
var  Auth = require('../../Auth');
const path = require('path');
const fs = require('fs');
//var Zconfig;
try{
  var Zconfig = require("../../config/Zconfig.json");
}catch(e){
  var Zconfig = {};
}
let grafanabaseurl = Zconfig.grafanaurl;
let grafanabaseport = Zconfig.grafanaport;
let grafanahttptype = Zconfig.grafanahttptype;
let zhttp = Zconfig.zebra_httptype;
let appurl = Zconfig.appurl;
let appport = Zconfig.appport;
const axios = require('axios');
const { send } = require('process');
const grafanaServer = `${grafanahttptype}://${grafanabaseurl}:${grafanabaseport}`

// Initialize constants
const REPORTS = require("../../constants").REPORTS;
const METRICDESCRIPTIONS = require("../../constants").METRICDESCRIPTIONS;
const REPORTTYPE = require("../../constants").REPORTTYPE;
const { keys } = require('lodash');


function parameters(fn){
  parms = {
    ddsbaseurl: Zconfig.ddsbaseurl,
    ddsbaseport: Zconfig.ddsbaseport,
    rmf3filename: Zconfig.rmf3filename,
    rmfppfilename: Zconfig.rmfppfilename,
    mvsResource: Zconfig.mvsResource,
    mongourl: Zconfig.mongourl,
    dbinterval: Zconfig.dbinterval,
    dbname: Zconfig.dbname,
    appurl: Zconfig.appurl,
    appport: Zconfig.appport,
    mongoport: Zconfig.mongoport,
    ppminutesInterval: Zconfig.ppminutesInterval,
    rmf3interval: Zconfig.rmf3interval,
    httptype: Zconfig.httptype,
    useDbAuth: Zconfig.useDbAuth,
    dbUser: Zconfig.dbUser,
    dbPassword: Zconfig.dbPassword,
    authSource: Zconfig.authSource,
    useMongo: Zconfig.useMongo,
    usePrometheus: Zconfig.usePrometheus,
    https: Zconfig.https,
    grafanaurl: Zconfig.grafanaurl,
    grafanaport: Zconfig.grafanaport
  }
  fn(parms); //return the parameters
}
// ... (keep existing imports)

router.get('/hmai', function(req, res, next) {
  const Zconfig = require('../../config/Zconfig.json');
  const lpars = Object.keys(Zconfig.dds);
  console.log("Rendering HMAI report with lpars:", lpars);
  // console.log("LPAR config:", Zconfig.dds);
  res.render('hmaiReport', { 
    title: 'HMAI Report', 
    lpars: lpars,
    lparConfig: Zconfig.dds
  });
});

router.post('/hmai/start', ctrlHmai.startHMAI);
router.post('/hmai/clear-db', ctrlHmai.clearDatabase);
router.post('/hmai/get-csv', ctrlHmai.getCSVData);
router.post('/hmai/download-csv', ctrlHmai.downloadCSV);
router.post('/hmai/stop-monitoring', ctrlHmai.stopContinuousMonitoring);  
router.get('/hmai/running-processes', ctrlHmai.getRunningProcesses);
router.post('/hmai/start-all', ctrlHmai.startHMAIForAllLpars);
// Checks if user login session is available in browser
var sessionChecker = (req, res, next) => {
  if (req.session.name && req.cookies.user_sid) { //If user login session is available
      next()
  } else { 
      req.session.redirectUrl = req.url;
      res.redirect("/log_in") //redirect to login page if user is not logged in
  }    
};

router.get('/mtrfile', (req, res) => {
  fs.readFile('metrics.json', (err, data) => {
    if (err) throw err;
    let metricsfile = JSON.parse(data);
    let keyss = Object.keys(metricsfile);
    res.send({mtr: keyss, jsn:metricsfile});
  });
});

router.post('/delmtr', (req, res) => {
  fs.readFile('metrics.json', (err, data) => {
    if (err) throw err;
    let metricsfile = JSON.parse(data);
    delete metricsfile[req.body.ky]; 
    fs.writeFile("metrics.json", JSON.stringify(metricsfile, null, '\t'), 'utf-8', function(err, data) {
      res.send("Metric Deleted Successfully");
    }); 
  });
});

// Updated to allow saving multiple metrics at once
router.post('/savemtr', (req, res) => {
  try {
    const lpar = req.body.lpar;
    const rpt = req.body.rpt;
    const nid = req.body.nid;
    const snvlList = req.body.snvl instanceof Array ? req.body.snvl : [req.body.snvl]; // Ensure snvl is an array
    const vid = req.body.vid;
    const umi = req.body.umi;
    const umd = req.body.umd;
    const rst = req.body.rst;

    // Synchronously read the file to avoid race conditions
    let metricsfile = {};
    try {
      const data = fs.readFileSync('metrics.json', 'utf8');
      metricsfile = JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File does not exist, start with an empty object
        metricsfile = {};
      } else {
        throw err;
      }
    }

    // Loop through each selected identifier value
    snvlList.forEach(snvl => {
      // Construct a unique key using the identifier key and value
      const key = `${lpar}_${snvl}_${vid}`;

      // Construct the new metric object
      const mtr = {
        "lpar": lpar,
        "request": {
          "report": rpt,
          "resource": rst
        },
        "identifiers": [
          {
            "key": nid,
            "value": snvl
          }
        ],
        "field": vid,
        "desc": umd
      };

      // Add the new metric to the metrics object
      metricsfile[key] = mtr;
    });

    // Synchronously write the updated metrics object back to the file
    fs.writeFileSync('metrics.json', JSON.stringify(metricsfile, null, '\t'), 'utf-8');
    res.send("Metrics Added Successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving metrics");
  }
});

router.post('/getnvl', (req, res) => {
  try{
    var lpar = req.body.lpar;
    var rpt = req.body.rpt;
    var nid = req.body.nid;
    var c = [];
    var RMF3URL = `${zhttp}://${appurl}:${appport}/v1/${lpar}/rmf3/${rpt}`; //Dynamically create URL
    axios.get(RMF3URL)
    .then(function (response) {
      // handle success
      var dat = response.data
      for(i in dat["table"]){
        c.push(dat["table"][i][nid])
      }
      //console.log(c);
      c = [...new Set(c)]; // distinct values
      res.send({sc:c});
      //console.log(response.data);
      //res.json({sc:["columnhead"]});
    })
    .catch(function (error) {
      // handle error
      res.send("error")
    })
  }catch(err){
    res.send("error")

  }
  
})

router.post('/getrpt', (req, res) => {
  try{
    var lpar = req.body.lpar;
    var rpt = req.body.rpt;
    var RMF3URL = `${zhttp}://${appurl}:${appport}/v1/${lpar}/rmf3/${rpt}`; //Dynamically create URL
    axios.get(RMF3URL)
    .then(function (response) {
      // handle success
      var columns = response.data
      res.send({sc:columns["columnhead"]});
      //console.log(response.data);
      //res.json({sc:["columnhead"]});
    })
    .catch(function (error) {
      // handle error
      res.send("error")
    })
  }catch(err){
    res.send("error")

  }
  
})
// Updated with new constant variables
router.get('/metrics', /*sessionChecker,*/ (req, res) => {
  //console.log(Zconfig.dds["RPRT"])
  resource = [];
  var lpar_details = Zconfig["dds"];
  var lpar = Object.keys(lpar_details);
  for(i in lpar){
    resource.push(lpar_details[lpar[i]]["mvsResource"])
  }
  //console.log(c);
  if(req.session.name){ //Check if User login session is available
    res.render("metrics",
      {msg:"Admin", 
        resources:resource, lpars:lpar, reports:REPORTS.RMFM3, metricDescriptions:METRICDESCRIPTIONS, reportType:REPORTTYPE}); // render the metrics page wih Admin previledge
  }else{
    res.render("metrics", {resources:resource, lpars:lpar, reports:REPORTS.RMFM3, metricDescriptions:METRICDESCRIPTIONS, reportType:REPORTTYPE});
  }
})


function ddsparm(fn){
  fn(Zconfig.dds); //return the parameters
}


router.post('/updateconfig', ctrlConfig.updateconfig);

router.post('/updatedds', ctrlConfig.updatedds);

router.post('/deletedds', ctrlConfig.deletedds);

router.post('/savedds', ctrlConfig.savedds);

router.get('/createZconfig', ctrlConfig.createZconfig);

// router.get('/config/settings', sessionChecker, (req, res) => {
//   if(Object.keys(Zconfig).length === 0){
//     res.render("settings",{nozmsg: "No Zconfig"});
//   }else{
//     res.render("settings",{msg: "Admin"});
//   } 
  
// });
function loadZconfig() {
  const configPath = path.join(__dirname, '..', '..', 'config', 'Zconfig.json');
  try {
    if (fs.existsSync(configPath)) {
      delete require.cache[require.resolve(configPath)];
      global.Zconfig = require(configPath);
    } else {
      global.Zconfig = {};
    }
  } catch (error) {
    console.error('Error loading Zconfig:', error);
    global.Zconfig = {};
  }
}

router.get('/config/settings', sessionChecker, (req, res) => {
  loadZconfig();
  if (Object.keys(global.Zconfig).length === 0) {
    res.render("settings", { nozmsg: "No Zconfig" });
  } else {
    res.render("settings", { msg: "Admin", dds: global.Zconfig.dds || {} });
  }
});

router.get('/ddsconfig', (req, res) => {
  loadZconfig();
  res.render("ddsconfig", { dds: global.Zconfig.dds || {} });
});

router.get('/otherconfig', (req, res) => {
  res.render("otherconfig", {fparms:Zconfig});
})

/*
// render the setting page


router.get('/zsetting', (req, res) => {
  res.render("zsetting");
});

router.get('/ddssetting', (req, res) => {
  res.render("ddssetting");
});

//addsetting 
router.post('/addsetting', Auth.authenticateFormToken,  ctrlMain.addFormSettings) //call addsetting function in maincontroller

router.get('/settings', Auth.authenticateToken, ctrlMain.settings) // call settings function

router.post('/addsettings', Auth.authenticateToken,  ctrlMain.addSettings) //call add settings function



router.get('/setting', sessionChecker, (req, res) => {
  Auth.formToken(req.session.name, function(data){ //Authenticate user
    if (data.Access){ // if data returned by the auhentication function contains an Access parameter
      parameters(function(parms){ //get Zconfig parameters
       res.render("settings", {fdata: data, fparms:parms}); // render the setting page with Access token and Zconfig parameters
      })
    }else{
      res.send(data)
    }
  })
});

 

*/


// Zebra API ML cookie checker
router.get('/apimlcookie',  function(req, res, next){
  if (req.cookies.apimlAuthenticationToken == undefined){
    res.send("No Cookie");
  }else{
    res.send(req.cookies.apimlAuthenticationToken);
  }
})

router.post('/apimllogin',  function(req, res, next){
  axios.post('https://localhost:10010/api/v1/gateway/auth/login', {
    "username": req.body.username,
    "password": req.body.password
  })
  .then(function (response) {
    if(response.headers["set-cookie"]){
      var res_head = response.headers["set-cookie"][0].split("=");
      var token_split = res_head[1].split(";");
      var token = token_split[0];
      res.send(token);
    }else{
      res.send("error");
    }
  })
  .catch(function (error) {
    res.send("error");
  });
})

// Zebra UI routers

// router for getting new Access token using the refresh token on the UI Page
router.post("/refreshT", sessionChecker, (req, res) => {
   Auth.formRefreshToken(req.body.refresh, req.session.name, function(data){ //Authenticate refresh token
     if (data.Access){ // if data returned by the auhentication function contains an Access parameter
       parameters(function(parms){ //get Zconfig parameters
        res.render("settings", {fdata: data, fparms:parms}); // render the setting page with Access token and Zconfig parameters
       })
     }else{
       res.send(data)
     }
   })
})

//render swagger document
router.use('/apis', swaggerUi.serve, swaggerUi.setup(swaggerdoc));

// redirect to grafana server
router.get('/grafana',  function(req, res, next){
  res.redirect(grafanaServer);
})

// render files from /upload directory
router.get('/files', (req, res) => {
  const directoryPath = path.join(__dirname, '../../uploads');
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        res.send('Unable to scan uploads directory: ' + err);
        return;
    } 
    res.render("files", {resfiles: files});
  });
   
});

// render the mongoDB access page
router.get('/mongo', (req, res) => {
  res.render("mongot");
});

// logout routine
router.use("/log_out", (req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) { // if cookie is available
      res.clearCookie('user_sid'); // delete cookie
  }
  //res.clearCookie()
  res.redirect("/") //redirect to homepage
});

//render the about page
router.get("/about", (req, res)=> {
  if(req.session.name){ //Check if User login session is available
    res.render("about",{msg:"Admin"}); // render the about page wih Admin previledge
  }else{
    res.render("about");
  }
  
})

//render the login page and authorise login
router.route('/log_in')
  .get((req, res) => {
    res.render("login");
  })
  .post(Auth.formLogin); // authorise user credentials

// handle mongoDB data request
router.post('/mongo', ctrlMongo.mongoReport);

//handes Password change using Zebra UI
router.post("/UpdatePasswordForm", Auth.updatePasswordForm)



/* Main Controller Router. */
router.get('/',  ctrlMain.home) // Call home function
router.get('/api-doc',  function(req, res, next){
  res.json(swaggerdoc);
})

router.get('/prommetric', (req, res) => {
    res.end(Prometheus.register.metrics()); //display metrics in prom-client register
});
// Prometheus metric API router for real-time metric data retrieval
router.get('/v1/metrics', (req, res) => {
  const metrics = getMetrics();
  res.json(metrics); // Serve the reloaded metrics
});
/* router.post("/login", Auth.login)  */

/* router.post("/UpdatePassword", Auth.authenticateToken, Auth.updatePassword) */

router.post("/token", Auth.token)

router.get("/users", Auth.authenticateToken, (req,res) =>{
  db.find({ }, function (err, users) {
      res.json(users); // logs all of the data in docs
  });
})

router.get("/logout", Auth.authenticateToken, (req,res) => {
  dbrefresh.remove({}, {multi: true}, err => {
      if (err) {
        res.send('Error logging out.');
      }else{
          res.status(200).send("Done!!!!");
      }
  });
})


module.exports = router;