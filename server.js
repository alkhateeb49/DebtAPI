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
app.use(session({ secret: 'kAjllfhlTg6zvvW52D6f', cookie: { maxAge: 60000 }}))
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
app.post('/', getData)
app.get('/login', login)


function home(req, res) {
res.sendFile('index.html', {root: __dirname});
  // if (req.session.views) {
  //   req.session.views++
  //   res.setHeader('Content-Type', 'text/html')
  //   res.write('<p>views: ' + req.session.views + '</p>')
  //   res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
  //   res.end()
  // } else {
  //   req.session.views = 1
  //   res.end('welcome to the session demo. refresh!')
  // }
  // req.session.regenerate(function(err) {
  //   // will have a new session here
  //   res.end(req.session.id);
  // })
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
          // will have a new session here
          res.end(req.session.id);
        })
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
function getData(req, res) {
  if(req.body.name){
    // console.log(req.body.name);
    let UserName = req.body.name;
    let sqlQuery = 'SELECT * FROM TestData WHERE UserName = ($1)';
    let value = [UserName];
    client.query(sqlQuery, value).then(data => {
      console.log(data.rows);
      });
    res.status(200).send("SCS");
  }else res.status(500).send("Enter Name");
}


    client.connect().then((data) => {
      app.listen(PORT, () => {
        console.log("App runing on : "+ PORT);
      });
    }).catch(error => {
      console.log('error in connect to database ' + error);
    });
