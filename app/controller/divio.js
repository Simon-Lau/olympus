/**
 * http://div.io数据获取
 * @type {*|exports|module.exports}
 */
var express = require('express'),
  router = express.Router(),
  network = require('../util/network'),
  divioService = require('../service/divioService');

var divio_pre = 'http://div.io/';

module.exports = function (app) {
  app.use(router);
};

router.get('/article-get/divio', function (req, res, next) {
  var limit = Number(req.query._l) || 10;
  var position = Number(req.query._p) || 0;
  divioService.find({}).sort({hot: -1}).skip(position).limit(limit).exec(function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.json(data);
    res.end();
  });
});
