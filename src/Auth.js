// Auth.js (Complete, Corrected Code)

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const sqlite3 = require('sqlite3');

// Ensure the required environment variables are present on startup
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("FATAL ERROR: ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set in the .env file.");
    process.exit(1); // Exit if secrets are not configured
}

const db = new sqlite3.Database('./admin.db');

function updateAll(db, name, pwd, refresh, access) {
    db.run("UPDATE adm SET name=$name, password=$pwd, refreshToken = $rtoken, accessToken= $atoken WHERE id = $id", {
        $id: 1,
        $name: name,
        $pwd: pwd,
        $rtoken: refresh,
        $atoken: access
    });
}

function updateToken(db, refresh, access) {
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
        if (err || !rows || rows.length === 0) {
            console.error("Error querying database or no admin user found:", err);
            // Pass the error or null to the callback to handle it
            fn(null, err); 
        } else {
            fn(rows[0]);
        }
    });
}

// Generates an access token using the static secret key
function generateAccessToken(user) {
    return jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

// Main token refresh endpoint
module.exports.token = function(req, res) {
    const refreshtok = req.body.token;
    if (!refreshtok) {
        return res.status(401).send("Refresh token required.");
    }

    runQueries(db, (data, err) => {
        if (err || !data) return res.sendStatus(500);
        if (data.refreshToken !== refreshtok) {
            return res.status(403).send("Invalid refresh token.");
        }

        jwt.verify(refreshtok, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).send("Refresh token could not be verified.");
            
            const accessToken = generateAccessToken({ name: user.name });
            res.json({ accessToken: accessToken });
        });
    });
};

// Middleware to authenticate an access token
module.exports.authenticateToken = function(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Logic to refresh a token from a form/UI action
module.exports.formRefreshToken = function(rtoken, usersname, fn) {
    if (rtoken == null) return fn("null token");

    runQueries(db, (data, err) => {
        if (err || !data) return fn("database error");
        if (data.refreshToken !== rtoken) return fn("wrong token");

        jwt.verify(rtoken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return fn("token verification failed");
            
            const username = { name: usersname };
            const accessToken = generateAccessToken(username);
            
            fn({
                Access: accessToken,
                Refresh: rtoken
            });
        });
    });
};

// Generates new tokens for a user session
module.exports.formToken = function(user, fn) {
    const username = { name: user };
    const accessToken = generateAccessToken(username);
    const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET);

    updateToken(db, refreshToken, accessToken);
    
    fn({
        Access: accessToken,
        Refresh: refreshToken
    });
};

// Login logic for UI Form
module.exports.formLogin = function(req, res, next) {
    runQueries(db, (data, err) => {
        if (err || !data) {
            return res.status(500).render("login", { lgmsg: "Server error" });
        }
        
        try {
            if (data.name === req.body.name && bcrypt.compareSync(req.body.password, data.password)) {
                // Check if user is still using the default password
                if (bcrypt.compareSync('Admin', data.password)) {
                    return res.render("login", { data: "pwd" }); // Force password change
                }

                const username = { name: data.name };
                const accessToken = generateAccessToken(username);
                const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET);
                
                updateToken(db, refreshToken, accessToken);

                req.session.name = req.body.name;
                req.session.password = data.password; // Note: Storing password in session is not recommended

                const redirectionUrl = req.session.redirectUrl || '/';
                res.redirect(redirectionUrl);
            } else {
                res.render("login", { lgmsg: "Login Failed" });
            }
        } catch (e) {
            console.error("Login process error:", e);
            res.render("login", { lgmsg: "An unexpected error occurred" });
        }
    });
};

// Update Password logic for UI Form
module.exports.updatePasswordForm = function(req, res) {
    runQueries(db, (data, err) => {
        if (err || !data) {
            return res.status(500).render("login", { data: "pwd", cpmsg: "Could not retrieve user data" });
        }

        const oldpassword = 'Admin';
        const newpassword = req.body.newpassword;
        const cpassword = req.body.cpassword;

        if (newpassword !== cpassword) {
            return res.render("login", { data: "pwd", cpmsg: "New passwords do not match" });
        }
        
        if (!bcrypt.compareSync(oldpassword, data.password)) {
            return res.render("login", { data: "pwd", cpmsg: "Old password is not correct" });
        }

        try {
            const salt = bcrypt.genSaltSync();
            const hashedpassword = bcrypt.hashSync(newpassword, salt);
            const username = { name: req.body.name };
            
            // Generate new tokens upon successful password change
            const accessToken = generateAccessToken(username);
            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET);

            updateAll(db, req.body.name, hashedpassword, refreshToken, accessToken);

            req.session.name = req.body.name;
            req.session.password = hashedpassword; // Again, not ideal to store this

            const redirectionUrl = req.session.redirectUrl || '/';
            res.redirect(redirectionUrl);
        } catch (e) {
            console.error("Password update error:", e);
            res.render("login", { data: "pwd", cpmsg: "Failed to update password" });
        }
    });
};

// Helper function for authenticating a form token (if needed elsewhere)
function tformToken(user, fn) {
    const res = {};
    const username = { name: user };
    const accessToken = generateAccessToken(username);
    const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET);
    updateToken(db, refreshToken, accessToken);
    res["Access"] = accessToken;
    res["Refresh"] = refreshToken;
    fn(res);
}

// Middleware to authenticate a token from a form session
module.exports.authenticateFormToken = function(req, res, next) {
    runQueries(db, (data, err) => {
        if (err || !data) return res.send("Error Validating User");

        if (data.name === req.session.name) {
            const token = data.accessToken;
            if (!token) return res.sendStatus(401);

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    // This could be where you use the refresh token to get a new access token
                    // For now, we'll just treat it as an expired session.
                    return res.redirect('/log_in');
                }
                req.user = user;
                next();
            });
        } else {
            res.send("Error Validating User");
        }
    });
};