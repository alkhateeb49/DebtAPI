const express = require('express');
const app=express();
require('dotenv').config()
const bp = require('body-parser')
const PORT=process.env.PORT || 8000;


let pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))


//Error
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
app.get('/newUser', newUser)
app.get('/show', getUser)
app.post('/', getData)


function home(req, res) {
    res.sendFile('index.html', {root: __dirname});
}
function newUser(req, res) {
  try {
    // res.sendFile('index.html', {root: __dirname});
    if(req.query.name==undefined||req.query.email==undefined||req.query.pass==undefined||req.query.phone==undefined)res.status(500).send(error);
    let UserName = req.query.name;
    let email = req.query.email;
    let password = req.query.pass;
    let phone = req.query.phone;
    let sqlQuery = 'insert into Users(userName,email,password,phone) values ($1,$2,$3,$4)';
    let value = [UserName,email,password,phone];
    client.query(sqlQuery, value).then(data => {
    console.log('data returned back from db ',data);
    });
    res.status(200).send(UserName+" "+email+" "+phone);
  } catch (error) {
    res.status(500).send('Sorry, something went wron' + error);
  }
}

function getUser(req, res) {
    // console.log(req.body.name);
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
