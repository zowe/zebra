var neDB = require('nedb');
const bcrypt = require('bcryptjs')
var db = new neDB({ filename: 'my.db', autoload: true });
var dbrefresh = new neDB({ filename: 'my.dbrefresh', autoload: true });
var data = {name: "Admin", password: "Admin"}

/*db.remove({name: 'Admin'}, {multi: true}, err => {
    if (err) {
     callback(null, err);
     return;
    }
})*/

db.find({ name: 'Admin' })
  .exec(async function(err, result) {
    if (err) {
        console.error(err);
    } else {
        if (result.length == 0){
            try{
                const Salt = bcrypt.genSaltSync()
                const hashedpassword = bcrypt.hashSync(data.password, Salt)
                const user = {name: data.name, password: hashedpassword}
                db.insert(user, function (err, newDoc) { 
                    if(err){
                    }else{
                        console.log("Admin Saved Successfuly");
                    }
                })
                //res.status(201).send();
            }catch(err) {
                //res.status(500).send()
            }
            
        }else{
            console.log("Admin Already Exist");
            //console.log('Got results: ', result[0]["name"])
        }
    }
});

module.exports.db = db
module.exports.dbrefresh = dbrefresh