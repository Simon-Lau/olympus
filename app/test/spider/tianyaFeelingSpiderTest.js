var spider = require('../../spider/tianyaFeelingSpider'),
  config = require('../../../config/config'),
  mongoose = require('mongoose');

mongoose.connect(config.db);

var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

require(config.root + '/app/model');

//spider.catchArticles({
//  url: '/list-feeling-1.shtml',
//  block: 500
//});

(function main() {
  catchArticleDetail({
    position: 0,
    step: 1
  });
})();

function catchArticleDetail(params) {
  var self = arguments.callee;
  var Article = mongoose.model('Article');
  Article.find().skip(params.position).limit(params.step).exec(function (err, data) {
    if (err) {
      console.log(err);
      console.log('db error: find entity error, retry......');
      self(params);
    } else if (data && data.length === 0) {
      console.log('no more articles');
    } else if (data[0].finish === 1) {
      console.log('article ' + data[0].title + ' has already finished!');
      self({
        position: ++params.position,
        step: params.step
      });
    }
    else {
      spider.catchArticleDetail({
        article: data[0],
        block: 1000
      }, function (err) {
        if (err) {
          console.log('catch article \'' + data[0].title + '\' error, skip......')
        } else {
          console.log('done!');
          return;
        }
        self({
          position: ++params.position,
          step: params.step
        });
      }.bind(this));
    }

  });
}


