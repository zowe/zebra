var mongoose = require( 'mongoose' );
require('./cpcdocSchema');
require('./usagedocSchema');
require('./procdocSchema');
require("./workloaddocSchema");
try{
    var Zconfig = require("../../config/Zconfig.json");
}catch(e){
    var Zconfig = {};
}
var mongourl = Zconfig['mongourl'];
var mongoport = Zconfig['mongoport'];
var dbname = Zconfig['dbname'];
var dbauth = Zconfig['useDbAuth'];
var dbuser = Zconfig['dbUser'];
var dbpwd = Zconfig['dbPassword'];
var authSource = Zconfig['authSource'];
//var user = dbuser.replace(/^"(.*)"$/, '$1');
var conn;
var activities = ['cpcactivities', 'procactivities', 'usageactivities', 'workloadactivities'];

var dbURI = `mongodb://${mongourl}:${mongoport}/${dbname}?compressors=zlib`; //no authentication
var dbURIAuth = `mongodb://${mongourl}:${mongoport}/${dbname}?authSource=${authSource}&compressors=zlib`; //with authentication

if (dbauth === 'true'){
    //mongoose.connect(`mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}`,{auth:{authdb:"admin"}, useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.connect(dbURIAuth, {
        auth:{authdb: authSource},
        useNewUrlParser: true,
        useUnifiedTopology: true,
        user: dbuser,
        pass: dbpwd
    }).then(() => {
        console.log('Authentication successful');
        conn = mongoose.createConnection(`mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}?authSource=${authSource}&compressors=zlib`);
        conn.on('open', function(){
            conn.db.listCollections({name: 'cpcactivities'})
            .next(function(err, collinfo) {
                if(err){
                    console.log("error Connecting to database")
                } 
                if (collinfo) {
                    console.log("Collecions exist");
                }else{
                    for(i in activities){
                        conn.db.createCollection(activities[i],{storageEngine: {wiredTiger: {configString: 'block_compressor=zlib'}}});
                        console.log(`${activities[i]} Collection Created`)
                    }
                
                }
            });
        });
        
    }).catch(err => {
        console.log('Authentication Failed');
        //process.exit();
    });
}else{
    mongoose.connect(dbURI);
    conn = mongoose.createConnection(dbURI);
    conn.on('open', function(){
        conn.db.listCollections({name: 'cpcactivities'})
        .next(function(err, collinfo) {
            if(err){
                console.log("error Connecting to database")
            } 
            if (collinfo) {
                console.log("Collecions exist");
            }else{
                for(i in activities){
                    conn.db.createCollection(activities[i],{storageEngine: {wiredTiger: {configString: 'block_compressor=zlib'}}});
                    console.log(`${activities[i]} Collection Created`)
                }
            
            }});
    });
}
 
var readLine = require ("readline");
if (process.platform === "win32"){
    var rl = readLine.createInterface ({
    input: process.stdin,
    output: process.stdout
    });
    rl.on ("SIGINT", function (){
    process.emit ("SIGINT");
    });
}

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to database');
});
mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

var gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
    });
};

process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
    process.kill(process.pid, 'SIGUSR2');
    });
});
process.on('SIGINT', function () {
    gracefulShutdown('app termination', function () {
    process.exit(0);
    });
});
process.on('SIGTERM', function() {
    gracefulShutdown('app shutdown', function () {
    process.exit(0);
    });
});