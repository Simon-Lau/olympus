var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use(router);
};

router.get('/api/oauth2/qq', function (req, res, next) {
  res.redirect(301,
    'https://graph.qq.com/oauth2.0/authorize?response_type=token&client_id=1105042016&redirect_uri=http://localhost:3000&scope=scope');
});
