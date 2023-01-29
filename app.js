const express=require("express")
require("dotenv").config()
const session=require("express-session")

const logger = require("morgan")
const path=require("path")
const multer=require("multer")
const bcrypt=require("bcrypt")
const cookieParser=require('cookie-parser');
const db = require('./config/config')
const app=express();
const hbs=require("hbs")


const userRouter=require("./server/routes/userRouter")
const adminRouter=require("./server/routes/adminRouter")



app.use(function(req, res, next) { 
  res.header('Cache-Control', 'no-cache, no-store');
   next();
 });


app.use(session({
    secret:"process.env.secret",
    cookie:{maxAge:600000}
  }));

app.set('view engine','hbs')
app.set('views',path.join(__dirname,'views'));


hbs.registerPartials(__dirname + '/views/layouts', function (err){});

hbs.registerPartials(__dirname + '/views/partials', function (err) {});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))

hbs.registerHelper("counter", function (index){
  return index + 1;
});

//routers
app.use(userRouter);
app.use(adminRouter);

//port
const PORT=process.env.PORT||3002;

db.connectToDb((err)=>{
    if(!err){
        app.listen(PORT,()=>{
        console.log(`listening in the port ${PORT}`)
        })
    }
});


//error
app.use(function(req, res, next) {
    res.status(404).render('error/404');
  });

  module.exports = app;
  