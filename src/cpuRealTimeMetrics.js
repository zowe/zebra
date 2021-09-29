const express = require('express');
const axios = require('axios');
const router = express.Router();
const { Console } = require('console');
var cpu_lpar;
const Prometheus = require('prom-client');
try{
    var Zconfig = require("./config/Zconfig.json");
}catch(e){
    var Zconfig = {};
}
let appbaseurl = Zconfig.appurl;
let appbaseport = Zconfig.appport;
let rmf3interval = Zconfig.rmf3interval;
let httptype = Zconfig.zebra_httptype;
console.log('cpu prom started');
const cpuRealtimeURL = `${httptype}://${appbaseurl}:${appbaseport}/rmfm3?report=CPC`;
const sysRealtimeURL = `${httptype}://${appbaseurl}:${appbaseport}/rmfm3?reports=SYSINFO`;
const jobsRealtimeURL = `${httptype}://${appbaseurl}:${appbaseport}/rmfm3?report=USAGE`;
const channelRealtimeURL = `${httptype}://${appbaseurl}:${appbaseport}/rmfm3?reports=CHANNEL`;
setInterval(() => { // Set interval function allows this routine to run at a specified intervals
    axios.get(cpuRealtimeURL)
    .then(function (response) {
        // handle success
        Prometheus.register.clear();  //clear prometheus register
        var JSONBody = response.data; 
        var caption = JSONBody['caption'] // represent the value for caption key in the JSONBody
        try { // try to create CPCHLMSU custom metric
            var name3 = 'MSU_'+caption["CPCHPNAM"]; // name variable
            var value3 = "CPCHLMSU" // value variable
            cpu_lpar = new Prometheus.Gauge({ //create custom prometheus metric 
                name: name3, // dynamicall add name to the metric
                help: 'MSU-value', // add help statement to the metric
                labelNames: ['parm'] //custom metric label
            });
            cpu_lpar.set({ //set custom metric value
                parm: value3 //dynamically set the label value 
            }, parseFloat(caption["CPCHLMSU"])); //dynamically set the custom metric value 
        } catch (err) { //if error
            // do nothing and move on
        }
        
        for (i in JSONBody['table']) { // loop through the lpars in the cpu report(JSONBody)
            var JSONBody_lpar = JSONBody['table'][i];
            var name = "TOU_" + JSONBody_lpar['CPCPPNAM']; //append TOU(Total Utilization) to lpar name
            var value = 'CPCPLTOU';
            var name2 = "EFU_" + JSONBody_lpar['CPCPPNAM']; //append EFU(Effective Utilization) to lpar name
            var value2 = 'CPCPPEFU';
            var name4 = "MIPS_" + JSONBody_lpar['CPCPPNAM'];
            var value4 = 'MIPS';
	    var name7 = 'MEM_' + JSONBody_lpar['CPCPPNAM'];
	    var value7 = 'CPCPCSMB'
            try {
                cpu_lpar = new Prometheus.Gauge({ //create custom prometheus metric for lpar Total Urilization
                    name: name, // dynamicall add name
                    help: 'lpar Total Utilization', // help statement
                    labelNames: ['parm'] //custom metric label
                });
                cpu_lpar.set({ //set custom metric value for lpar Total Urilization
                    parm: value //dynamically set the label value 
                }, parseFloat(JSONBody_lpar['CPCPLTOU'])); //dynamically set the custom metric value 
                cpu_lpar = new Prometheus.Gauge({ //create custom prometheus metric for lpar Effective Urilization
                    name: name2, // dynamicall add name
                    help: 'lpar Effective Utilization', //help statement
                    labelNames: ['parm'] //custom metric label
                });
                cpu_lpar.set({ //set custom metric value
                    parm: value2 //dynamically set the label value
                }, parseFloat(JSONBody_lpar['CPCPPEFU'])); //dynamically set the custom metric value 
                cpu_lpar = new Prometheus.Gauge({ //create custom prometheus metric for lpar MIPS Urilization
                    name: name4, // dynamicall add name
                    help: 'lpar MIPS Utilization', //help statement
                    labelNames: ['parm'] //custom metric label 
                });
                cpu_lpar.set({ //set custom metric value for lpar Total Urilization
                    parm: value4 //dynamically set the label value 
                }, (parseFloat(JSONBody_lpar['CPCPLTOU'])/100)*2951); //dynamically set the custom metric value
                //console.log();
		    //
                cpu_lpar = new Prometheus.Gauge({ // Central Storage(MEMORY) allocated for LPAR
                    name: name7, // dynamicall add name
                    help: 'Memory Allocated', //help statement
                    labelNames: ['parm'] //custom metric label 
                });
                cpu_lpar.set({ //set custom metric value for lpar Total memory
                    parm: value7 //dynamically set the label value 
                }, (parseFloat(JSONBody_lpar['CPCPCSMB']))); //dynamically set the custom metric value
                //console.log();
                //
            } catch (err) { 
                //console.log('Caught one' + name);
            }
        }
    
    })
    .catch(function (error) {
        // handle error
        console.log("cpu request not successful");
    })
    .then(function () {
        // always executed
    });
    //----------------------------------------------------------------------------------
    axios.get(sysRealtimeURL)
    .then(function (response) {
        // handle success
        var JSONBody = response.data;
        for (i in JSONBody['table']) { // loop through the table in the sys report(JSONBody)
            var JSONBody_lpar = JSONBody['table'][i];
            var name4 = "VC_" + JSONBody_lpar['SYSNAMVC']; //append VC to sys name
            var value4 = 'SYSCPUVC';
            try {
                cpu_lpar = new Prometheus.Gauge({ //create custom prometheus metric 
                    name: name4, // dynamicall add name
                    help: 'Workload CPU Utilization', // help statement
                    labelNames: ['parm'] //custom metric label
                });
                cpu_lpar.set({ //set custom metric value 
                    parm: value4 //dynamically set the label value 
                }, parseFloat(JSONBody_lpar['SYSCPUVC'])); //dynamically set the custom metric value 
            } catch (err) {
                //console.log('Caught one' + name);
            }
        }
    })
    .catch(function (error) {
        // handle error
        console.log("sys request not successful");
    })
    .then(function () {
        // always executed
    });
	        //---------------- routine for started task address spaces -------
    axios.get(jobsRealtimeURL)
    .then(function (response) {
        // handle success
        var JSONBody = response.data;
        for (i in JSONBody['table']) { // loop through the table in the sys report(JSONBody)
            var JSONBody_lpar = JSONBody['table'][i];
            var name5 = "RPRTJOB_" + JSONBody_lpar['JUSPJOB']; //append VC to sys name
            var value5 = 'JUSPCPUD'; //--  CPU Time for the interval
            try {
                cpu_lpar = new Prometheus.Gauge({ //create custom prometheus metric
                    name: name5, // dynamicall add name
                    help: 'Workload TASK CPU Time for the interval', // help statement
                    labelNames: ['parm'] //custom metric label
                });
                cpu_lpar.set({ //set custom metric value
                    parm: value5 //dynamically set the label value
                }, parseFloat(JSONBody_lpar['JUSPCPUD'])); //dynamically set the custom metric value
            } catch (err) {
                //console.log('Caught one' + name);
            }
        }
    })
    .catch(function (error) {
        // handle error
        console.log("sys request not successful");
    })
    .then(function () {
        // always executed
    });
        //---------------- routine for channel utilization reports  -------
    axios.get(channelRealtimeURL)
    .then(function (response) {
        // handle success
        var JSONBody = response.data;
        for (i in JSONBody['table']) { // loop through the table in the sys report(JSONBody)
            var JSONBody_lpar = JSONBody['table'][i];
            var name6 = "CHANNEL_"+JSONBody_lpar['CHACPIVC']+"_"+JSONBody_lpar['CHACPTVC']; //append chtype to sys name
		console.log(name6);
            var value6 = 'CHACTUVC'; //-- channel utilization for the interval
            try {
                cpu_lpar = new Prometheus.Gauge({ //create custom prometheus metric 
                    name: name6, // dynamicall add name
                    help: 'Total Channel Utilization for the interval', // help statement
                    labelNames: ['parm'] //custom metric label
                });
                cpu_lpar.set({ //set custom metric value 
                    parm: value6 //dynamically set the label value 
                }, parseFloat(JSONBody_lpar['CHACTUVC'])); //dynamically set the custom metric value 
            } catch (err) {
                //console.log('Caught one' + name);
            }
        }
    })
    .catch(function (error) {
        // handle error
        console.log("sys request not successful");
	    console.log(error);
	    console.log(response);
    })
    .then(function () {
        // always executed
    });
}, parseInt(rmf3interval) * 1000); // set timeout 100sec