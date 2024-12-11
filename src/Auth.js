require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
var fs = require('fs'); //importing the fs module

var sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./admin.db');

function updateAll(db,name, pwd, refresh, access) {
    db.run("UPDATE adm SET name=$name, password=$pwd, refreshToken = $rtoken, accessToken= $atoken WHERE id = $id", {
        $id: 1,
        $name: name,
        $pwd: pwd,
        $rtoken: refresh,
        $atoken: access
    });
}

function updateToken(db,refresh, access) {
    db.run("UPDATE adm SET refreshToken = $rtoken, accessToken= $atoken WHERE id = $id", {
        $id: 1,
        $rtoken: refresh,
        $atoken: access
    });
}

function runQueries(db, fn) {
    db.all(`
    select name, password, refreshToken, accessToken from adm 
    where id = ?`, 1, (err, rows) => {
        if(err){
            console.log(err)
        }else{
            fn(rows[0])
        }
   });  
}

module.exports.token = function(req, res){
    if(Object.keys(Admin).length != 0){
        const refreshtok = req.body.token;
        try{
            runQueries(db, function(data){
                if (!(data.refreshToken).includes(refreshtok)) return res.sendStatus(403);
                jwt.verify(refreshtok, process.env.REFRESH_TOKEN, (err, user) => {
                    if (err) return res.sendStatus(403);
                    const accessToken = generateAccessToken({name: user.name});
                    res.json({accessToken: accessToken})
                })
            });
          }catch(err){
              res.send("Token Generation Failed");
          }
    }
}

function generateAccessToken(user){
    return jwt.sign({user:user}, process.env.ACCESS_TOKEN, {expiresIn: "15m"})
}

module.exports.authenticateToken =function (req,res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.status(401).send("")

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403).send("")
        req.user = user
        next();
    }) 

}

module.exports.formRefreshToken = function(rtoken, usersname, fn){
    var ress = {};
    const refreshtok = rtoken;
    if (refreshtok == null){
        fn("null token")
    } 
    try{
        runQueries(db, function(data){
            if (!(data.refreshToken).includes(refreshtok)){
                fn("wrong token")
            } 
            jwt.verify(refreshtok, process.env.REFRESH_TOKEN, (err, user) => {
                if (err) {
                }else{
                    var username = {name: usersname};
                    const accessToken = generateAccessToken(username);
                    ress["Access"] = accessToken;
                    ress["Refresh"] = rtoken;
    
                    fn(ress)
                }
                //res.json({accessToken: accessToken})
            })
        });
        
    }catch(err){
        fn("Token Generation Failed");
    }
}

module.exports.formToken = function(user, fn){
    var res = {};
    const username = {name: user};
    const accessToken = generateAccessToken(username);
    const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN);
    updateToken(db, refreshToken, accessToken);
    res["Access"] = accessToken;
    res["Refresh"] = refreshToken;
    //console.log("Adding referesh token saved succesfully from formToken");
    fn(res);
}

//Login for UI Form
module.exports.formLogin  = async function (req, res, next){
    var accessToken;
    var refreshToken;
    runQueries(db, function(data){
        try{
            if(data.name == req.body.name && bcrypt.compareSync(req.body.password, data.password)){
                if (bcrypt.compareSync('Admin', data.password)){
                    res.render("login", {data: "pwd"})
                }else{
                    //Serialise User
                    const username = {name: data.name};
                    accessToken = generateAccessToken(username);
                    refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN);
                    updateToken(db, refreshToken, accessToken);
                    req.session.name = req.body.name;
                    req.session.password = data.password;
                    //res.cookie(`ZAccToken`,`${accessToken}`);
                    var redirectionUrl = req.session.redirectUrl;
                    res.redirect(redirectionUrl);
                    //next();
                    //console.log("Adding referesh token saved succesfully from formLogin");
                }
            }else{
                res.render("login", {lgmsg: "Login Failed"})
            }
        } catch(err){
            res.render("login", {lgmsg: "Login Failed"})
        }
    });       
}

function wenv(act, rft, fn){ //write to .env file
    fs.writeFile(".env", `ACCESS_TOKEN = ${act} \nREFRESH_TOKEN = ${rft}`, 'utf-8', function(err, data) {
        if (err){
            fn("error")
        } else {
            fn("Success")
        }
    })
}
//Update Paasword Form
module.exports.updatePasswordForm = async function(req, res){
    runQueries(db, function(data){
        var user = null;
        if(req.body.name != "Admin" && data.name == "Admin"){
            user = {name: "Admin", password: data.password};
        }
        if(user == null){
            user = {name: data.name, password: data.password};
        }
        username = req.body.name;
        oldpassword  = 'Admin';
        newpassword = req.body.newpassword;
        cpassword = req.body.cpassword; 
        try{
            if ( bcrypt.compareSync(oldpassword, user.password) && newpassword === cpassword){
                try{
                    const Salt = bcrypt.genSaltSync()
                    const hashedpassword = bcrypt.hashSync(newpassword, Salt)
                    //const user = {name: data.name, password: hashedpassword}
                    //Update ENV here
                    wenv(req.body.act, req.body.rft, function(data1){
                        if(data1 === "Success"){
                            accessToken = generateAccessToken(username);
                            refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN);
                            updateAll(db,req.body.name, hashedpassword,refreshToken, accessToken);
                            req.session.name = req.body.name;
                            req.session.password = newpassword;
                            var redirectionUrl = req.session.redirectUrl;
                            res.redirect(redirectionUrl);
                            //console.log("Adding referesh token saved succesfully from updatePassword");
                        }else{
                            res.render("login", {data: "pwd", cpmsg: "Failed to save data to .env file"})
                        }
                    })
                }catch(err) {
                    res.render("login", {data: "pwd", cpmsg: err})
                }
            }else{
                res.render("login", {data: "pwd", cpmsg: "Password mismatch"})
                //res.send("")
            }
        } catch(err){
            res.render("login", {data: "pwd"})
        }

    });
}

function tformToken(user, fn){
    var res = {};
    const username = {name: user};
    const accessToken = generateAccessToken(username);
    const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN);
    updateToken(db, refreshToken, accessToken);
    res["Access"] = accessToken;
    res["Refresh"] = refreshToken;
    //console.log("Adding referesh token saved succesfully from formToken");
    fn(res);
}

module.exports.authenticateFormToken =function (req,res, next) {
    var token;
    var refreshToken;
    runQueries(db, function(data){
        if(data.name == req.session.name && data.password == req.session.password){
            token = data.accessToken; // get access token
            refreshToken = data.refreshToken;
            if(token == null){
                tformToken(req.session.name, function(data1){
                    if (data1.Access){
                        //console.log("New token Created");
                        next();
                    }else{
                        res.send(data1)
                    }
                })
            }

            jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
                if (err){
                    tformToken(req.session.name, function(data2){
                        if (data2.Access){
                            //console.log("Forbidden. New token Created");
                            next()
                        }else{
                            res.send(data2)
                        }
                    })
                }else{
                    //console.log("Token Active");
                    next()
                }
            }) 
        }else{
            res.send("Error Validating User");
        }
    })
}