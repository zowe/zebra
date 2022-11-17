const bcrypt = require('bcryptjs')
var sqlite3 = require('sqlite3');
var db;

db = new sqlite3.Database('./admin.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
        } else if (err) {
            console.log("Getting error " + err + " from DB");
            exit(1);
    }
    
    //updateToken(db, "refresh", "access");
    /* runQueries(db, function(data){
        console.log(data);
    });  */
    console.log("Admin DB Created");
});

function createDatabase() {
    var newdb = new sqlite3.Database('admin.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
            exit(1);
        }
        createTables(newdb);
    });
}

function createTables(newdb) {
    const Salt = bcrypt.genSaltSync()
    const hashedpassword = bcrypt.hashSync("Admin", Salt) 
    newdb.exec(`
    create table adm (
        id int primary key not null,
        name text not null,
        password text not null,
        refreshToken text,
        accessToken text
    );
    insert into adm (id, name, password, refreshToken, accessToken)  
        values (1, 'Admin', '${hashedpassword}', '', '');  
        `, ()  => {
            //runQueries(newdb);
            console.log("Admin Saved Successfully"); 
    });
}