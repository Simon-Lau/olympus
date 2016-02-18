var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var util = require('util');
function _saveOne(entity) {
  // 保存前重复判断
  Article.find({link: entity.link}, function (err, data) {
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
        console.log('article: ' + entity.title + ' already exists! now hot = ' + data[0].hot);
      });
    }
    else {
      new Article(entity).save(function (err) {
        if (err) {
          console.log(err);
          return null;
        }
        else {
          console.log('save article: ' + entity.title + ' success!');
        }
      });
    }
  });
}

module.exports = {
  save: function (articles) {
    if (!util.isArray(articles)) articles = [articles];
    for (var i = 0, len = articles.length; i < len; i++) {
      _saveOne(articles[i]);
    }
  },
  find: Article.find.bind(Article)
};
