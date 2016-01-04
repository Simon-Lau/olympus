var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
  User = mongoose.model('User');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  var sessionId = req.cookies.sid;
  User.find({sid: sessionId}, function (err, user) {
    if (err) return next(err);
    console.log(user);
    res.render('index', {
      title: 'Generator-Express MVC OLYMPUS',
      user: user[0]
    });
  });
});
