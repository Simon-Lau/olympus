var express = require('express'),
  router = express.Router(),
  request = require('superagent'),
  wechartConfig = require('../../config/wechart'),
  qs = require('qs'),
  util = require('../util/util'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

module.exports = function (app) {
  app.use(router);
};

var appId = wechartConfig.appId,
  key = wechartConfig.key,
  redirectUri = encodeURIComponent('http://catlite-olympus.herokuapp.com/api/oauth2/qq');

router.get('/api/oauth2/qq', function (req, res, next) {
  if (!req.query.code) {
    res.redirect(301,
      'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=' + appId
      + '&redirect_uri=' + redirectUri
      + '&scope=scope');
    return;
  }
  var url = 'https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=' + appId
    + '&client_secret=' + key
    + '&code=' + req.query.code
    + '&state=ok&redirect_uri=' + redirectUri;
  request
    .get(url)
    .end(function (err, _res) {
      if (err) {
        res.end('error');
      }
      var resJson = qs.parse(_res.text);
      request.get('https://graph.qq.com/oauth2.0/me?access_token=' + resJson.access_token)
        .end(function (err, __res) {
          var info = JSON.parse(__res.text.substring(__res.text.indexOf('(') + 1, __res.text.indexOf(')'))),
            clientId = info.client_id,
            openId = info.openid;
          var userInfoUrl = 'https://graph.qq.com/user/get_user_info?access_token=' + resJson.access_token
            + '&oauth_consumer_key=' + appId
            + '&openid=' + openId;
          request.get(userInfoUrl).end(function (err, ___res) {
            if (err) {
              res.end('error');
            }
            var userInfo = JSON.parse(___res.text);
            User.find({openid: openId}, function (err, _user) {
              if (err) {
                res.end('error');
              }
              var sessionId = util.randomChar(32);
              if (!_user.length) {
                var user = new User({
                  nickname: userInfo.nickname,
                  logo: userInfo.figureurl,
                  gender: userInfo.gender,
                  name: userInfo.nickname,
                  sid: sessionId,
                  openid: openId
                });
                user.openId = openId;
                user.save(function (err) {
                  res.cookie('sid', sessionId);
                  res.redirect('/');
                });
              } else {
                User.update({openid: openId}, {sid: sessionId}, function (err) {
                  if (err) {
                    res.end('error');
                  }
                  res.cookie('sid', sessionId);
                  res.redirect('/');
                })
              }
            });

          });
        });
    });
});
