let cpcdoci = require("./app_server/Models/cpcdocSchema");
let cpcdoc = cpcdoci.cpcdocs;
let procdoci = require("./app_server/Models/procdocSchema");
let procdoc = procdoci.procdocs;
let usagedoci = require("./app_server/Models/usagedocSchema");
let usagedoc = usagedoci.usagedocs;
let workloaddoci = require("./app_server/Models/workloaddocSchema");
let workloaddoc = workloaddoci.wokloaddocs;
const axios = require('axios');

// Helper function to get current config
function getConfig() {
  try {
    return global.Zconfig || require("./config/Zconfig.json");
  } catch(e) {
    return {};
  }
}

console.log('mongo started');

/**
 * getdata function query this app using its endpoint for JSON data to save to mongo DB 
 * @param {string} lp - LPAR name
 * @param {URLString} appbaseurl - A recognised URL for this app that returns a JSON
 * @param {function} fn - A callback function containing the required JSON
 */
async function getdata(lp, appbaseurl, fn){ 
    axios.get(appbaseurl)
    .then(function (response) {
        fn({lpar:lp, res: response.data});
    })
    .catch(function (error) {
        fn(error);
    });
}

/**
 * fedDatabase function handles saving the JSON from getdata into MongoDB
 * @param {string} lpar - LPAR name
 * @param {JSON} data - JSON returned by getdataFunction
 * @param {string} type - Type of data (CPC, PROC, USAGE, or WKL)
 * @param {function} fn - A callback function that does nothing
 */
async function fedDatabase(lpar, data, type, fn ){
                try{ // if data is not equal to error.... getdata function can return error instead of JSON when something goes wrong
                    var JSONBody = data;
                    var parm = JSONBody["title"] // represent the value of title key in JSONBody
                    var timestamp = (JSONBody["timestart"]).split(" "); // represent the value of timestart key in JSONBody
                    var date = timestamp[0];
                    var time = timestamp[1];
        
                    var datetime = toDateTime(date, time);
        
                    if(type === 'CPC'){ // if data type is equal to CPC
                        var cpc = new cpcdoc({ // Push the following key value pairs as subdocument
                            lparname: lpar,
                            title: parm,
                            datetime: datetime,
                            caption: JSONBody["caption"], // JSONBody caption for caption Key
                            lpar: JSONBody["table"] // JSONBody table for lpar Key
                        })
        
                        cpc.save((err, cpc) => { // save Subdocument to existing Document
                        if(err){
                            console.log('error');
                        } else{
                            console.log(`CPC Updated Successflly`);
                        }
                        })
                    }else if(type === 'PROC'){ // if data type is equal to PROC
                        var proc = new procdoc({ // Push the following key value pairs as subdocument
                            lparname: lpar,
                            title: parm,
                            datetime: datetime,
                            lpar_proc: JSONBody["table"] // JSONBody table for lpar Key
                        })
        
                        proc.save((err, Proc) => { // save Subdocument to existing Document
                        if(err){
                            console.log('error');
                        } else{
                            console.log(`PROC Updated Successflly`);
                        }
                        })
                    }else if(type === 'USAGE'){ // if data type is equal to USAGE
                        var usage = new usagedoc({ // Push the following key value pairs as subdocument
                            lparname: lpar,
                            title: parm,
                            datetime: datetime,
                            lpar_usage: JSONBody["table"] // JSONBody table for lpar Key
                        })
                        usage.save((err, USage) => { // save Subdocument to existing Document
                        if(err){
                            console.log('error');
                        } else{
                            console.log(`USAGE Updated Successflly`);
                        }
                        })
                    }else if(type === 'WKL'){ // if data type is equal to CPC
                        var { SYSINFO, SYSSUM } = JSONBody["classes"];
                        var workload =  new workloaddoc({ // Push the following key value pairs as subdocument
                            lparname: lpar,
                            title: parm,
                            datetime: datetime,
                            Caption: JSONBody["caption"], // JSONBody caption for caption Key
                            Class: joinWorkloadData(SYSINFO, [ SYSSUM ]), // join SYSINFO and SYSSUM data into same entry
                        })
                    
                        workload.save((err, wkl) => { // save Subdocument to existing Document
                        if(err){
                            console.log(err.message);
                        } else{
                            console.log(`Workload Updated Successflly`);
                        }
                            
                        })
                    }
                }catch(e){
        
                }
}

/**
 * Converts date and time strings to Date object
 * @param {String} date String representing date in MM/DD/YYYY format
 * @param {String} time String representing time in HOUR:MINUTE:SECONDS format
 * @returns Date object representing the date and time of the record
 */
function toDateTime(date, time) {
    const [month, day, year] = date.split("/");
    const dateTimeString = `${year}-${month}-${day}T${time}`;
    const parsed = new Date(Date.parse(dateTimeString));
    return parsed;
}

/**
 * Joins different reports into one class name and type
 * @param {Object} sysinfo The base data
 * @param {Array} reportsToJoin  The data to join into sysinfo
 * @returns The data joined on class name and type
 */
function joinWorkloadData(sysinfo, [ syssum ]) {
    let joinedData = [];
    for (let i = 0; i < sysinfo.length; i++) {
        let found = false;
        for (let j = 0; j < syssum.length; j++) {
            if (sysinfo[i]["SYSDDSIN"] === syssum[j]["SUMDDSIN"] &&
                sysinfo[i]["SYSDDSIT"] === syssum[j]["SUMDDSIT"] &&
                sysinfo[i]["SYSDDSIP"] === syssum[j]["SUMDDSIP"] ) {
                found = true;
                joinedData.push({
                    ...sysinfo[i],
                    ...syssum[j]
                });
                break;
            }
        }
        if (!found) {
            for (let j = 0; j < syssum.length; j++) {
                if (sysinfo[i]["SYSDDSIN"] === syssum[j]["SUMDDSIN"] &&
                    sysinfo[i]["SYSDDSIT"] === syssum[j]["SUMDDSIT"] ) {
                    found = true;
                    joinedData.push({
                        ...sysinfo[i],
                        ...syssum[j]
                    });
                    break;
                }
            }
        }
        if (!found) {
            joinedData.push({ 
                ...sysinfo[i],
                SUMGRP:"",
                SUMTYP:"",
                SUMRCTNT:"",
                SUMIMP:"",
                SUMEVG:"",
                SUMEVA:"",
                SUMRTGTM:"",
                SUMRTGP:"",
                SUMRTATM:"",
                SUMRTAP:"",
                SUMPFID:"",
                SUMTRAN:"",
                SUMARTWM:"",
                SUMARTAM:"",
                SUMARTTM:"",
                SUMARTQM:"",
                SUMARTRM:"",
                SUMARTIM:"",
                SUMARTCM:"",
                SUMGOA:"",
                SUMDUR:"",
                SUMRES:"",
                SUMRGTYP:"",
                SUMSMI:"",
                SUMSMA:"",
                SUMSRA:"",
                SUMRGSPC:"",
                SUMCRIT:"",
                SUMHONP:"",
                SUMMLIM:"",
                SUMMEMUS:"",
                SUMDDSIN:"",
                SUMDDSIT:"",
                SUMDDSIP:"",
                SUMEGRP:"",
                SUMRTGT:"",
                SUMRTAT:"",
                SUMARTW:"",
                SUMARTA:"",
                SUMARTT:"",
                SUMARTQ:"",
                SUMARTR:"",
                SUMARTI:"",
                SUMARTC:""
            });
        }
    }
    return joinedData;
}

// Initial check to see if MongoDB monitoring should start
let shouldStartMonitoring = false;
try {
    const initialConfig = getConfig();
    const lpar_details = initialConfig["dds"] || {};
    const lpars = Object.keys(lpar_details);
    
    for(let i in lpars){
        var lpar = lpars[i];
        if (lpar_details[lpar]["useMongo"] === 'true'){
            shouldStartMonitoring = true;
            break;
        }
    }
}catch(e){
    console.error("Error checking initial MongoDB config:", e);
}

if(shouldStartMonitoring){
    setInterval(async () => {
        try {
            // Get fresh config on each iteration
            const config = getConfig();
            const appbaseurl = config.appurl;
            const appbaseport = config.appport;
            const httptype = config.zebra_httptype;
            const dds = config.dds || {};
            
            // Dynamically determine which LPARs have MongoDB enabled
            const lpar_mongo = [];
            for(const lpar in dds){
                if (dds[lpar]["useMongo"] === 'true'){
                    lpar_mongo.push(lpar);
                }
            }
            
            // Process each LPAR
            for(let i in lpar_mongo){
                const lpar_name = lpar_mongo[i];

                const cpuRealtimeURL = `${httptype}://${appbaseurl}:${appbaseport}/v1/${lpar_name}/rmf3/CPC`;
                const procRealtimeURL = `${httptype}://${appbaseurl}:${appbaseport}/v1/${lpar_name}/rmf3/PROC`;
                const usageRealtimeURL = `${httptype}://${appbaseurl}:${appbaseport}/v1/${lpar_name}/rmf3/USAGE`;
                const sysRealtimeURL = `${httptype}://${appbaseurl}:${appbaseport}/v1/${lpar_name}/rmf3/SYSINFO`;
                const syssumRealtimeURL = `${httptype}://${appbaseurl}:${appbaseport}/v1/${lpar_name}/rmf3/SYSSUM?resource=\",,SYSPLEX\"`;
        
                await getdata(lpar_name, cpuRealtimeURL, async function(data){
                    await fedDatabase(data["lpar"], data["res"], 'CPC', function(c){})
                });
        
                await getdata(lpar_name, procRealtimeURL, async function(data){
                    await fedDatabase(data["lpar"], data["res"], 'PROC', function(c){})
                });
        
                await getdata(lpar_name, usageRealtimeURL, async function(data){
                    await fedDatabase(data["lpar"], data["res"], 'USAGE', function(c){})
                });
        
                await getdata(lpar_name, sysRealtimeURL, async function(sysinfoData){
                    await getdata(sysinfoData["lpar"], syssumRealtimeURL, async function(syssumData) {
                        await fedDatabase(syssumData["lpar"], {
                            title: "Workload Activity",
                            timestart: sysinfoData["res"]["timestart"],
                            caption: { ...sysinfoData["res"]["caption"], ...syssumData["res"]["caption"] },
                            classes: { SYSINFO: sysinfoData["res"]["table"], SYSSUM: syssumData["res"]["table"] }, 
                        }, 'WKL', function(c){});
                    });
                });
            }
        } catch(e) {
            console.error("Error in MongoDB monitoring interval:", e);
        }
    }, parseInt(getConfig().dbinterval || 100) * 1000);
}
