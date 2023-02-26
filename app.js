const express=require("express")
require("dotenv").config()
const session=require("express-session")
const Razorpay=require('razorpay')
const logger = require("./middleware/logger")
const path=require("path")
const cookieParser=require('cookie-parser');
const db = require('./config/config')
const app=express();
const hbs=require("hbs")

const userRouter=require("./routes/userRouter")
const adminRouter=require("./routes/adminRouter")

logger(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))

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

hbs.registerHelper('formatDate', function(date) {
  let day = ("0" + date.getDate()).slice(-2);
  let month = ('0' + (date.getMonth() + 1)).slice(-2);
  let year = date.getFullYear().toString();
  return `${day}-${month}-${year}`;
});

hbs.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 1; i <= n; ++i) {
      block.data.index = i;
      accum += block.fn(this);
  }
  return accum;
});

hbs.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

hbs.registerHelper('ifnoteq', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});


hbs.registerPartials(__dirname + '/views/layouts', function (err){});

hbs.registerPartials(__dirname + '/views/partials', function (err) {});


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
        
        })
    }
});


//error
app.use(function(req, res, next) {
    res.status(404).render('error/404');
  });

  module.exports = app;
  