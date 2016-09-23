var express = require('express');
var router = express.Router();
var path = require('path');
var jwt = require('jsonwebtoken');
var pg = require('pg');
var config = {
  database: 'node_api',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
};
var pool = new pg.Pool(config);


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/***CREATE USER***/
//curl --data "name=jonathan&password=password&admin=true" http://127.0.0.1:3000/api/v1/users

router.post('/api/v1/users', function(req, res) {
  var results = [];

  // Grab data from http request
  var data = { name: req.body.name, password: req.body.password, admin: req.body.admin };

  // Get a Postgres client from the connection pool
  pool.connect(function(err, client, done) {

    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err });
    }

    client.query("SELECT * FROM users WHERE name=($1)", [data.name], function(err, results) {
      if (results["rowCount"] > 0) {
        return res.status(500).json({ success: false, data: "That name is already taken!" });
      }
    });

    // SQL Query > Insert Data
    client.query("INSERT INTO users(name, password, admin) values($1, $2, $3)", [data.name, data.password, data.admin]);

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM users ORDER BY id ASC");

    // Stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});


/***SHOW USERS****/

router.get('/api/v1/users', function(req, res) {
  var results = [];

  // Get a Postgres client from the connection pool
  pool.connect(function(err, client, done) {

    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err });
    }

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM users ORDER BY id ASC;");

    // Stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});


/****UPDATE USER****/
//curl -X PUT --data "name=donnovan&password=pastwords&admin=false" http://127.0.0.1:3000/api/v1/users/1


router.put('/api/v1/users/:user_id', function(req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.user_id;

    // Grab data from http request
    var data = {name: req.body.name, password: req.body.password, admin: req.body.admin};

    // Get a Postgres client from the connection pool
    pool.connect(function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).send(json({ success: false, data: err}));
        }

        // SQL Query > Update Data
        client.query("UPDATE users SET name=($1), password=($2), admin=($3) WHERE id=($4)", [data.name, data.password, data.admin, id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM users ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });

});


/****DELETE USER****/
//curl -X DELETE http://127.0.0.1:3000/api/v1/users/3

router.delete('/api/v1/users/:user_id', function(req, res) {

  var results = [];

  // Grab data from the URL parameters
  var id = req.params.user_id;

  // Get a Postgres client from the connection pool
  pool.connect(function(err, client, done) {

    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err });
    }

    // SQL Query > Delete Data
    client.query("DELETE FROM users WHERE id=($1)", [id]);

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM users ORDER BY id ASC");

    // Stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});


/****REQUEST API TOKEN****/
//curl --data "name=jonathan&password=password" http://127.0.0.1:3000/authenticate

// route to authenticate a user
router.post('/authenticate', function(req, res) {
  var jwt = require('jsonwebtoken');
  var token = jwt.sign({ foo: 'bar' }, 'shhhhhsshh');

  // Grab data from http request
  var data = { name: req.body.name, password: req.body.password };

  // Get a Postgres client from the connection pool
  pool.connect(function(err, client, done) {

    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err });
    }

    client.query("UPDATE users SET token=($1) WHERE name=($2) AND password=($3)", [token, data.name, data.password], function(err, results) {
      if (results["rowCount"] > 0) {
        return res.status(200).json({ success: true, data: token });
      } else {
        return res.status(500).json({ success: false, data: "You've ruined the act, Gob.." });
      }
    });

  });
});

module.exports = router;