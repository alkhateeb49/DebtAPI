const express = require('express');
const app=express();
require('dotenv').config()
const bp = require('body-parser')
const PORT=process.env.PORT || 8000;


// SessionToken
var session = require('express-session')
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'kAjllfhlTg6zvvW52D6f',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
// app.use(session({ secret: 'kAjllfhlTg6zvvW52D6f', cookie: { maxAge: null }}))
//
app.use(express.static('./public')); // Public file
app.set('view engine', 'ejs');



// Date
let date_ob = new Date();

// current date
// adjust 0 before single digit date
let date = ("0" + date_ob.getDate()).slice(-2);
// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
// current year
let year = date_ob.getFullYear();
// prints date in YYYY-MM-DD format
var TodDate=year + "-" + month + "-" + date;
// 

let pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

// Vars
var status ="";
// 

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
app.get('/test',test )
app.get('/signup',signUp)
app.get('/newuser', newUser)
app.get('/show', getUser)
app.get('/login', checkLogin)
app.get('/logout', logout)
app.post('/createdebt', createDebt)
app.post('/acceptdebt', acceptDebt)
app.get('/debtbyme', debtByMe)
app.get('/debtforme', debtForMe)
app.get('/create', createDebtview)




// 
app.get('/mysession',function(req,res){
  res.send([req.session.UserId,req.session.username,req.session.email,req.session.phone]);
});
// 

function test(req,res){
  res.render('pages/index', {
    status: status
  });
}

function home(req, res) {
  if(req.session.username==null){
    res.render('pages/login', {
      status: status
    });
    status ="";
  }else{
    res.redirect('../debtForMe');
  }
}

function checkLogin(req, res) {
  if(req.session.username!=null){
    req.session.reload(function(err) {
      // session updated
    })
  }
  try {
    if(req.query.name==undefined||req.query.pass==undefined){res.status(200).send(JSON.parse('["Missing Data"]'));}
    else{
    let UserName = req.query.name;
    let password = req.query.pass;
    
    client.query('SELECT * FROM Users WHERE userName = ($1) AND password = ($2)',[UserName,password]).then(data => {
      if(data.rows.length == 1){
        
        req.session.UserId = data.rows[0].id;
        req.session.username = data.rows[0].username;
        req.session.email = data.rows[0].email;
        req.session.phone = data.rows[0].phone;
        
        // console.log(req.session.id);

        // res.status(200).send(JSON.parse('["Login Successfully"]'));
            
      }
      else{
        // res.status(200).send(JSON.parse('["Wrong Username or Password"]'));
        status = "Wrong Username Or Password"
      }
      res.redirect('../')
      });
    }
  
  } catch (error) {
    res.status(200).send('Sorry, something went wron' + error);
  }
}

function logout(req,res){
  req.session.destroy();
  // res.end("Logout Done");
  // res.status(200).send(JSON.parse('["Logout Is Done"]'));
  res.redirect('../')
}

function signUp(req,res){
  if(req.session.username!=null){
    res.redirect('../');
  }else{
    res.render('pages/signup', {
      status: status
    });
    status ="";
  }
}

function newUser(req, res) {
  try {
    if(req.query.name==undefined||req.query.email==undefined||req.query.pass==undefined||req.query.phone==undefined){res.status(200).send("Missing data");}
    else if(req.query.pass.length<8){status="Password less than 8 characters";}
    else if(req.query.phone.length<10){status="Mobile number less than 10 characters";}
    else{
    let UserName = req.query.name;
    let email = req.query.email;
    let password = req.query.pass;
    let phone = req.query.phone;
    
    client.query('SELECT * FROM Users WHERE userName = ($1) OR email = ($2)',[UserName,email]).then(data => {
      if(data.rows.length != 0){status="Username or email exists";}
      else{
        let sqlQuery = 'insert into Users(userName,email,password,phone) values ($1,$2,$3,$4)';
        let value = [UserName,email,password,phone];
        client.query(sqlQuery, value).then(data => {
        });
        status='done';
      }
      });
  }
  res.redirect('/signup')
  } catch (error) {
    res.status(200).send('Sorry, something went wron' + error);
  }
}

function getUser(req, res) {
    let sqlQuery = 'SELECT * FROM Users';
    client.query(sqlQuery).then(data => {
      // console.log(data.rows);
      res.status(200).send(data.rows);
      });
}

function createDebtview(req,res){
  if(req.session.username==null){res.redirect('../');}else{
    let sqlQuery = 'SELECT username FROM Users';
    client.query(sqlQuery).then(data => {
      res.render('pages/createDebt',{
        status: status,users: data.rows
      });status="";
      });
  }
}

function createDebt (req,res){
  if(req.session.username==null){res.redirect('../');}
  else if(!req.body.title||!req.body.descr||!req.body.amount||!req.body.createdtoname||!req.body.duedate){status= "Please fill all values";res.redirect('/create');}
  else{

    client.query('SELECT id FROM users WHERE username = ($1)',[req.body.createdtoname]).then(data => {
      if(data.rows.length == 1){

        let sqlQuery = 'insert into debt (status,title,descr,amount,createdby,createdbyname,createdto,createdtoname,creationdate,duedate,completiondate) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)';
        let value = [0,req.body.title,req.body.descr,req.body.amount,req.session.UserId,req.session.username,data.rows[0].id,req.body.createdtoname,TodDate,req.body.duedate,null];
        client.query(sqlQuery, value).then(data => {
        });
        status= "done"
        res.redirect('/create');
      }
      else{
        status= "Create to User not exist"
        res.redirect('/create');
      }
      });
  }
}

function acceptDebt(req,res){
  if(req.session.username==null){res.redirect('../');}
  else if(req.body.DebtId==undefined){res.redirect('../');}
  else{
    client.query('SELECT * FROM debt WHERE id = ($1) and createdto = ($2)',[req.body.DebtId,req.session.UserId]).then(data => {
      if(data.rows.length == 1){
        client.query('UPDATE debt SET status = ($1) WHERE id = ($2) and createdto = ($3)',[true,req.body.DebtId,req.session.UserId]).then(data => {
          res.redirect('../');
        });
      }
      else{
        res.redirect('../');
      }
      });

  }
}

function debtByMe(req,res){
  if(req.session.username==null){res.redirect('../');}
  else{
    client.query('SELECT * FROM debt WHERE createdby = ($1)',[req.session.UserId]).then(data => {
      res.render('pages/debtByMe', {
        data: data.rows
      });
    });
  }
}

function debtForMe(req,res){
  if(req.session.username==null){res.redirect('../');}
  else{
    client.query('SELECT * FROM debt WHERE createdto = ($1)',[req.session.UserId]).then(data => {
      res.render('pages/debtForMe', {
        data: data.rows
      });
    });
  }
}





    client.connect().then((data) => {
      app.listen(PORT, () => {
        console.log("App runing on : "+ PORT);
      });
    }).catch(error => {
      console.log('error in connect to database ' + error);
    });
