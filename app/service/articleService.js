var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var util = require('util');
function _saveOne(entity, callback) {
  callback = typeof callback === 'function' ? callback : new Function;
  Article.find({link: entity.link}, function (err, data) {
    if (err) {
      console.log(err);
      callback(err);
      return null;
    }
    if (data && data.length > 0) {
      entity.save(function(err){
        callback(err, {
          exist: true
        });
      });

    }
    else {
      new Article(entity).save(function (err) {
        if (err) {
          console.log(err);
          callback(err);
        }
        else {
          callback();
          console.log('save article: ' + entity.title + ' success!');
        }
      });
    }
  });
}

module.exports = {
  save: function (articles, callback) {
    callback = typeof callback === 'function' ? callback : new Function;
    if (!util.isArray(articles)) articles = [articles];
    var taskSum = articles.length;
    for (var i = 0, len = articles.length; i < len; i++) {
      _saveOne(articles[i], function (err) {
        var error = [];
        if (err) {
          error.push(err);
        }
        if (--taskSum === 0) callback(error.length ? error : null);
      });
    }
  },
  find: Article.find.bind(Article)
};
