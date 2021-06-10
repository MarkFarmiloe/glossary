const express = require("express");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.use(express.json());

const mysql = require('mysql');
const hostname = 'localhost';
const port = 3000;

class Database {
    constructor(  ) {
        this.connection = mysql.createPool({
            connectionLimit: 5,
            host: hostname,
            user: 'root',
            password: 'ngo.set', 
            database: 'glossary'
        });
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

const database = new Database();


app.listen(port, function () {
  console.log(`Server is listening on port ${port}. Ready to accept requests!`);
});

app.get("/terms", function (req, res) {
    database.query("SELECT * FROM terms")
        .then((result) => {
            if (result.length === 0) {
                res.json({message: "no terms available"});
            } else {
                console.log(result);
                res.json(result)
            }
        })
        .catch((e) => console.error(e));
});

app.post("/newTerm", function (req, res) {
    const term = req.body.term;
    const def = req.body.definition;
    const lang = req.body.language;
    const contrib = req.body.contributorId;

    const query =
          "INSERT INTO terms (id, term, definition, programming_language, contributor_id) VALUES (default, ?, ?, ?, ?)";
    
    database
        .query(query, [term, def, lang, contrib])
        .then((result) => res.json({message: "Term added", id: result.insertId}))
        .catch((e) => console.error(e));
});

app.get("/contributors", function (req, res) {
    database.query("SELECT id, contributor_name, email, region FROM contributors")
        .then((result) => {
            if (result.length === 0) {
                res.json({message: "no terms available"});
            } else {
                console.log(result);
                res.json(result)
            }
        })
        .catch((e) => console.error(e));
});

app.post("/contributor/login", async function (req, res) {
    const email = req.body.email;
    
    const query =
          "SELECT id, password from contributors where email = ?";

    database
        .query(query, [email])
        .then((result) => {
            // await bcrypt.compare(password, hash);
            if (result.length === 0) {
                res.json({message: "Incorrect Email"});
            } else {
                (async () => {
                    // Hash fetched from DB
                    const hash = result[0].password;

                    // Check if password is correct
                    const isValidPass = await bcrypt.compare(req.body.password, hash);

                    if (isValidPass) {
                        res.json({message: "Authenticated"})
                    } else {
                        res.json({message: "Incorrect Password"});
                    }
                })();
            }
        })
        .catch((e) => console.error(e));
});

app.post("/newContributor", async function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const region = req.body.region;
    const pass = await bcrypt.hash(req.body.password, saltRounds)

    console.log(`password is ${pass}`);

    const query =
          "INSERT INTO contributors (id, contributor_name, region, email, password) VALUES (default, ?, ?, ?, ?)";
    
    database
        .query(query, [name, region, email, pass])
        .then(() => res.json({message: "Contributor added"}))
        .catch((e) => console.error(e));
});



// req is the Request object, res is the Response object
// (these are just variable names, they can be anything but it's a convention to call them req and res)
app.get("/", function (req, res) {
  res.send("Glossary Server v1.0");
});


