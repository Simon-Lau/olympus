var express = require('express'),
  router = express.Router(),
  request = require('superagent'),
  qs = require('qs');

module.exports = function (app) {
  app.use(router);
};

var appId = '101277293',
  key = 'd7b8f1f341ba8313c2ec806a1d5f30ba',
  redirectUri = 'http%3A%2F%2Fcatlite-olympus.herokuapp.com%2Fapi%2Foauth2%2Fqq';

router.get('/api/oauth2/qq', function (req, res, next) {
  if (!req.query.code && !req.query.openid) {
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
            res.cookie('wx_openid', openId);
            res.cookie('wx_access_token', resJson.access_token);
            res.redirect('/');
          });
        });
    });
});
