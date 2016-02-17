/**
 * http://div.io数据获取
 * @type {*|exports|module.exports}
 */
var express = require('express'),
  mongoose = require('mongoose'),
  router = express.Router(),
  cheerio = require('cheerio'),
  network = require('../util/network');

var Article = mongoose.model('Article');

var divio_pre = 'http://div.io/';

module.exports = function (app) {
  app.use(router);
};

router.get('/article-get/divio', function (req, res, next) {
  network.get({
    url: divio_pre,
    timeout: 15000
  }, function (err, data) {
    if (err) {
      res.end('error: ' + err.toString());
    }
    var $ = cheerio.load(data),
      topics = $('.home-topics ul li');
    var result = [];
    for (var i = 0, len = topics.length; i < len; i++) {
      var topic = topics.eq(i);
      var article = {
        author: {
          avatar: topic.find('.avatar img').attr('src'),
          nickname: topic.find('.author').text(),
          homepage: topic.find('.avatar').attr('href')
        },
        title: topic.find('h3 a').text(),
        link: topic.find('h3 a').attr('href'),
        desc: topic.find('p a').text()
      };
      result.push(article);
    }
    res.json(result);
    res.end();

    // 将数据存到数据库
    for (i = 0, len = result.length; i < len; i++) {
      // 保存前重复判断
      Article.find({link: result[i].link}, function (err, data) {
        if (err) {
          console.log(err);
          return null;
        }
        if (data && data.length > 0) {
          // 已获取过的,热度+1
          data[0].hot++;
          data[0].save(function (err) {
            if (err) {
              console.log('article hot modify failed!');
            }
          });
          console.log('article: ' + this.title + ' already exists! now hot = ' + data[0].hot);
        }
        else {
          new Article(this).save(function (err) {
            if (err) {
              console.log(err);
              return null;
            }
            else {
              console.log('save article: ' + this.title + ' success!');
            }
          }.bind(this));
        }
      }.bind(result[i]));
    }
  });
});
