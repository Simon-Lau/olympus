/**
 * 解析从天涯论坛情感板块获取的点击量10W以上的文章数据
 */
var cheerio = require('cheerio');
var network = require('../util/network');

var tianya_feeling_pre = 'http://bbs.tianya.cn';

function _parse(data) {
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
      desc: topic.find('p a').text(),
      source: 'bbs-tianya-feeling'
    };
    result.push(article);
  }
  return result;
}
module.exports = {
  catchArticles: function (params) {
    if (params.url == '') return;
    network.get({
      url: tianya_feeling_pre + params.url,
      timeout: 30000
    }, function (err, data) {
      if (err) {
        console.log('error: ');
        console.log(err);
        return null;
      }
      // 将数据存到数据库
      $ = cheerio.load(data, {decodeEntities: false});
      var articles = [];
      var tbodys = $('#main .mt5 table tbody');
      //var nextPageUrl = tianya_feeling_pre + $('.short-pages-2 .links a').eq($('.short-pages-2 .links a').length - 1).attr('href');
      var nextPageUrl = '';
      // 从第二个tbody开始为正文
      for (var i = 1, iLen = tbodys.length; i < iLen; i++) {
        var tbody = $(tbodys[i]);
        var trs = tbody.find('tr');
        // 获取每个tbody里的tr,一个tr为一个article
        for (var j = 0, jLen = trs.length; j < jLen; j++) {
          var tds = $(trs[j]).find('td');
          var article = {
            source: 'bbstianya-feeling',
            title: tds.eq(0).find('a').text(),
            link: tianya_feeling_pre + tds.eq(0).find('a').attr('href'),
            content: tds.eq(0).find('a').text(),
            desc: tds.eq(0).find('a').text(),
            author: {
              nickname: tds.eq(1).find('a').text(),
              avatar: '',
              homepage: tds.eq(1).find('a').attr('href')
            },
            hot: tds.eq(2).text()
          };
          if (article.hot > 100000) {
            //console.log(article);
            articles.push(article);
          }
        }
      }
      var articleService = require('../service/articleService');
      articleService.save(articles);

      var nextPage = $('.short-pages-2 .links a').eq($('.short-pages-2 .links a').length - 1);
      if (nextPage.text() === '下一页') {
        nextPageUrl = nextPage.attr('href');
        // 获取下一页数据
        module.exports.catchArticles({
          url: nextPageUrl
        });
      }
    });
  }
};

var spider = require('./tianyaFeelingSpider');
spider.catchArticles({
  url: '/list-feeling-1.shtml'
});
