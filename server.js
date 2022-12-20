const express = require('express');
const app=express();
require('dotenv').config()
const bp = require('body-parser')
const PORT=process.env.PORT || 8000;

// SessionToken
var session = require('express-session')
// app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//   secret: 'kAjllfhlTg6zvvW52D6f',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }))
app.use(session({ secret: 'kAjllfhlTg6zvvW52D6f', cookie: { maxAge: null }}))
//


let pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))


//Error Handler
process.on
(
    'uncaughtException',
    function (err)
    {
        console.log(err)
        var stack = err.stack;
        
    }
);

app.get('/', home)
app.get('/test', test)
app.get('/newUser', newUser)
app.get('/show', getUser)
app.get('/login', login)
app.get('/logout', logout)
app.post('/action', action)




function home(req, res) {
res.sendFile('index.html', {root: __dirname});
}

function test(req, res) {
  res.end(req.session.id);
}

function login(req, res) {
  try {
    if(req.query.name==undefined||req.query.pass==undefined){res.status(500).send("Missing data");}
    else{
    let UserName = req.query.name;
    let password = req.query.pass;
    
    client.query('SELECT * FROM Users WHERE userName = ($1) AND password = ($2)',[UserName,password]).then(data => {
      if(data.rows.length == 1){
        req.session.regenerate(function(err) {

          client.query('SELECT * FROM SessionID WHERE userName = ($1)',[data.rows[0].username]).then(data2 => {
            if(data2.rows.length == 0){
              let sqlQuery = 'insert into SessionID (userId,userName,email,phone,Session) values ($1,$2,$3,$4,$5)';
              let value = [data.rows[0].id,data.rows[0].username,data.rows[0].email,data.rows[0].phone,req.session.id];
              client.query(sqlQuery, value).then(data => {
              });
            }
            else{
                let sqlQuery = 'update SessionID SET Session = ($1) where userId = ($2)';
                let value = [req.session.id,data.rows[0].id];
                client.query(sqlQuery, value).then(data => {
                });
            }
          })
          res.status(200).send([req.session.id,data.rows[0].id]);
          });
            
      }
      else{
        res.status(500).send("Wrong Username or Password");
      }
      });
    }
  
  } catch (error) {
    res.status(500).send('Sorry, something went wron' + error);
  }
}


function logout(req,res){
  req.session.destroy(function(err) {
    // cannot access session here
    res.end("Logout Done");

  })
}



function newUser(req, res) {
  try {
    if(req.query.name==undefined||req.query.email==undefined||req.query.pass==undefined||req.query.phone==undefined){res.status(500).send("Missing data");}
    else if(req.query.pass.length<8){res.status(500).send("Password less than 8 characters");}
    else if(req.query.phone.length<10){res.status(500).send("Mobile number less than 10 characters");}
    else{
    let UserName = req.query.name;
    let email = req.query.email;
    let password = req.query.pass;
    let phone = req.query.phone;
    
    client.query('SELECT * FROM Users WHERE userName = ($1) OR email = ($2)',[UserName,email]).then(data => {
      if(data.rows.length != 0){res.status(500).send("Username or email exists");}
        else{
          let sqlQuery = 'insert into Users(userName,email,password,phone) values ($1,$2,$3,$4)';
          let value = [UserName,email,password,phone];
          client.query(sqlQuery, value).then(data => {
          console.log('data returned back from db ',data);
          });
          res.status(200).send(UserName+" "+email+" "+phone);
        }
      });
  }
  } catch (error) {
    res.status(500).send('Sorry, something went wron' + error);
  }
}

function getUser(req, res) {
    let sqlQuery = 'SELECT * FROM Users';
    client.query(sqlQuery).then(data => {
      console.log(data.rows);
      res.status(200).send(data.rows);
      });
}


function action (req,res){
  if(!req.body.session||!req.body.id){res.status(500).send("Missing data");}
  client.query('SELECT * FROM SessionID WHERE userId = ($1) AND session = ($2)',[req.body.id,req.body.session]).then(data => {
    if(data.rows.length === 1){
      res.status(200).send("SCS");
    }
    else {
      res.status(500).send('Please Login');
    }
  })
}



    client.connect().then((data) => {
      app.listen(PORT, () => {
        console.log("App runing on : "+ PORT);
      });
    }).catch(error => {
      console.log('error in connect to database ' + error);
    });
