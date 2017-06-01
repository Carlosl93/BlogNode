const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database')

// Conenct to database
mongoose.connect(config.database);
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

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

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

let users = require('./routes/user');
app.use('/users', users);


// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server UP YO!!');
});
