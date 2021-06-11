const express = require("express");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// get config vars
dotenv.config();

// secret generated with require('crypto').randomBytes(64).toString('hex')
const token_secret = process.env.TOKEN_SECRET

const app = express();
app.use(express.json());

const mysql = require('mysql');
// web server port
const port = process.env.WEB_PORT;
// db config
const config = {
    'connectionLimit': 5,
    'host': process.env.DB_HOST,
    'port': process.env.DB_PORT,
    'user': process.env.DB_USER,
    'database': process.env.DB_NAME,
    'password': process.env.DB_PASSWORD,
};

function generateAccessToken(username) {
    // token expires in 1 hour (3600 seconds)
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '3600s' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`auth token=${token}`);

    if (token == null) {
        return res.sendStatus(401);
    }
    
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
    })
}

class Database {
    constructor( config ) {
        this.connection = mysql.createPool(config);
    }

    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }

    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

const database = new Database(config);

app.listen(port, function () {
  console.log(`Server is listening on port ${port}. Ready to accept requests!`);
});

app.post("/terms/add", authenticateToken, function (req, res) {
    const term = req.body.term;
    const def = req.body.definition;
    const contrib = req.body.contributorId;

    const query =
          "INSERT INTO terms (id, term, definition, contributor_id) VALUES (default, ?, ?, ?)";
    
    database
        .query(query, [term, def, contrib])
        .then((result) => res.json({message: "Term added", id: result.insertId}))
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

app.post("/terms/update", authenticateToken, function (req, res) {
    const termid = req.body.termid;
    const term = req.body.term;
    const def = req.body.definition;
    const contrib = req.body.contributorId;

    const query =
          "UPDATE terms set term=?, definition=?, contributor_id=? WHERE id=?";
    
    database
        .query(query, [term, def, contrib, termid])
        .then((result) => {
            //console.log(result);
            if (result.changedRows === 0) {
                res.json({message: "Error.  Term not updated"})
            } else {
                res.json({message: "Term updated"})
            }
        })
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

app.post("/terms/delete", authenticateToken, function (req, res) {
    const termid = req.body.termid;

    const query =
          "DELETE from terms WHERE id=?";
    
    database
        .query(query, [termid])
        .then((result) => {
            console.log(result);
            if (result.affectedRows === 0) {
                res.json({message: "Error.  Term not deleted"})
            } else {
                res.json({message: "Term deleted"})
            }
        })
        .catch((e) => {
            console.error(e);
            res.json({error: e});
        });
});

app.post("/terms/resources/add", authenticateToken, function (req, res) {
    const termid = req.body.termid;
    const link = req.body.link;  
    const linktype = req.body.linktype; // video or web
    const language = req.body.language;

    const query =
          "INSERT INTO term_resources (id, termid, link, linktype, language) VALUES (default, ?, ?, ?, ?)";
    
    database
        .query(query, [termid, link, linktype, language])
        .then((result) => res.json({message: "Term resource added"}))
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

app.post("/terms/resources/update", authenticateToken, function (req, res) {
    const res_id = req.body.resourceid;
    const termid = req.body.termid;
    const link = req.body.link;
    const linktype = req.body.linktype;
    const language = req.body.language;

    const query =
          "UPDATE term_resources set termid=?, link=?, linktype=?, language=? where id=?";
    
    database
        .query(query, [termid, link, linktype, language, res_id])
        .then((result) => {
            if (result.changedRows === 0) {
                res.json({message: "Error.  Term resource not updated"})
            } else {
                res.json({message: "Term resource updated"})
            }
        })
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

app.post("/terms/resources/delete", authenticateToken, function (req, res) {
    const res_id = req.body.resourceid;

    const query =
          "DELETE from term_resources where id=?";
    
    database
        .query(query, [res_id])
        .then((result) => {
            if (result.affectedRows === 0) {
                res.json({message: "Error.  Term resource not deleted"})
            } else {
                res.json({message: "Term resource deleted"})
            }
        })
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

app.get("/terms", function (req, res) {
    const query = "SELECT terms.id, terms.term, terms.definition FROM terms";
    database
        .query(query)
        .then((result) => {
            console.log(result);
            if (result.length === 0) {
                res.json([]);
            } else {
                // console.log(result);
                res.json(result)
            }
        })
        .catch((e) => {
            console.error(e);
            res.json({error: e});
        });
});

app.get("/term/resources", function (req, res) {
    const termid = req.body.termid;
    const query = "SELECT id, link, linktype, language FROM term_resources where termid=?";
    database
        .query(query,[termid])
        .then((result) => {
            console.log(result);
            if (result.length === 0) {
                res.json([]);
            } else {
                // console.log(result);
                res.json(result)
            }
        })
        .catch((e) => {
            console.error(e);
            res.json({error: e});
        });
});

app.get("/contributors", authenticateToken, function (req, res) {
    database.query("SELECT id, contributor_name, email, region FROM contributors")
        .then((result) => {
            if (result.length === 0) {
                res.json({message: "no terms available"});
            } else {
                //console.log(result);
                res.json(result)
            }
        })
        .catch((e) => {
            console.error(e);
            res.json({error: e});
        });
});

app.post("/contributor/login", async function (req, res) {
    const email = req.body.email;
    
    const query =
          "SELECT id, password from contributors where email = ?";

    database
        .query(query, [email])
        .then((result) => {
            // await bcrypt.compare(password, hash);
            //console.log(result);
            if (result.length === 0) {
                res.json({message: "Incorrect Email"});
            } else {
                (async () => {
                    // Hash fetched from DB
                    const hash = result[0].password;

                    // Check if password is correct
                    const isValidPass = await bcrypt.compare(req.body.password, hash);

                    if (isValidPass) {
                        const token = generateAccessToken({ username: req.body.email });
                        res.json({auth:token});
                    } else {
                        res.json({message: "Incorrect Password"});
                    }
                })();
            }
        })
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});

app.post("/newContributor", authenticateToken, async function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const region = req.body.region;
    const pass = await bcrypt.hash(req.body.password, saltRounds)

    //console.log(`password is ${pass}`);

    const query =
          "INSERT INTO contributors (id, contributor_name, region, email, password) VALUES (default, ?, ?, ?, ?)";
    
    database
        .query(query, [name, region, email, pass])
        .then(() => res.json({message: "Contributor added"}))
        .catch((e) => {
            console.error(e)
            res.json({error: e});
        });
});



// req is the Request object, res is the Response object
// (these are just variable names, they can be anything but it's a convention to call them req and res)
app.get("/", function (req, res) {
  res.send("Glossary Server v1.0");
});


