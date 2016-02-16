/**
 * http://div.io数据获取
 * @type {*|exports|module.exports}
 */
var express = require('express'),
  router = express.Router(),
  cheerio = require('cheerio'),
  network = require('../util/network');

var divio_pre = 'http://div.io/';

module.exports = function (app) {
  app.use(router);
};

router.get('/article-get/divio', function (req, res, next) {
  network.get({
    url: divio_pre,
    timeout: 15000
  }, function (err, data) {
    var $ = cheerio.load(data),
      topics = $('.home-topics ul li');
    var result = [];
    for (var i = 0, len = topics.length; i < len; i++) {
      var topic = topics.eq(i);
      result.push({
        author: {
          avatar: topic.find('.avatar img').attr('src'),
          nickname: topic.find('.author').text(),
          homepage: topic.find('.avatar').attr('href')
        },
        article: {
          title: topic.find('h3 a').text(),
          link: topic.find('h3 a').attr('href'),
          desc: topic.find('p a').text()
        }
      });
    }
    res.json(result);
    res.end();
  });
});
