var spider = require('../../spider/tianyaFeelingSpider'),
  config = require('../../../config/config'),
  mongoose = require('mongoose');

mongoose.connect(config.db);

var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

require(config.root + '/app/model');

spider.catchArticles({
  url: '/list-feeling-1.shtml',
  block: 5000
});


