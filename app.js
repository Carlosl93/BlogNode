const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

// Conenct to database
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to mongoDB');
});

db.on('error', (err) => {
  console.log(err);
});



// Init App
const app = express();

// Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(expressValidator());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

//Express messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
//Express Validator Middleware


//Models
let Article = require('./models/articles');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Home Route
app.get('/', (req, res) => {

  Article.find({}, (err, articles) => {
    if(err) {
        console.log(err);
    } else {
      res.render('index', {
        articles: articles,
        title: 'Hello'
      });
    }
  });
});

let articles = require('./routes/articles');
app.use('/articles', articles);


// Start server
app.listen('3000', () => {
  console.log('Server UP YO!!');
});
