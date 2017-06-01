const express = require('express');
const router = express.Router();

//Models
let Article = require('../models/articles');
let User = require('../models/user');

//Get single article
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(article.author != req.user._id){
      req.flash('danger', 'Not authorized');
      res.redirect('/');
    }
    res.render('edit_article', {
      title: 'Edit Article',
      article: article
    });
  });
});


//Add Route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_article', {
      title: 'Add Article'
    })
});

//Add Summit POST Route
router.post('/add', (req, res) => {

  req.checkBody('title', 'Title is required').notEmpty();
  //req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('add_article', {
      title: 'Add Article',
      errors: errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save((err) => {
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success', 'Article added');
        res.redirect('/');
      }
    });
  }
});

//Add Summit POST Route
router.post('/edit/:id', (req, res) => {

  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id: req.params.id};

  Article.update(query, article, (err) => {
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article updated');
      res.redirect('/');
    }
  });
});

router.delete('/:id', (req, res) => {
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
    } else {
      Article.remove(query, (err) => {
        if(err){
          console.log(err)
        }
        req.flash('danger', 'Article deleted');
        res.send('Success');
      });
    }
  });
});


//Add single article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      console.log(user);
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});

// Access control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please log in');
    res.redirect('/users/login');
  }
}

module.exports = router;
