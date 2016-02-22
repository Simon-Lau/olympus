/**
 * 解析从天涯论坛情感板块获取的点击量10W以上的文章数据
 */
var cheerio = require('cheerio');
var network = require('../util/network');

var tianya_feeling_pre = 'http://bbs.tianya.cn';

function _parse(data) {
  $ = cheerio.load(data, {decodeEntities: false});
  var articles = [];
  var tbodys = $('#main .mt5 table tbody');
  // 从第二个tbody开始为正文
  for (var i = 1, iLen = tbodys.length; i < iLen; i++) {
    var tbody = $(tbodys[i]);
    var trs = tbody.find('tr');
    // 获取每个tbody里的tr,一个tr为一个article
    for (var j = 0, jLen = trs.length; j < jLen; j++) {
      var tds = $(trs[j]).find('td');
      var homePageUrl = tds.eq(1).find('a').attr('href');
      var article = {
        source: 'bbstianya-feeling',
        title: tds.eq(0).find('a').text(),
        link: tianya_feeling_pre + tds.eq(0).find('a').attr('href'),
        content: '',
        desc: '',
        author: {
          nickname: tds.eq(1).find('a').text(),
          avatar: homePageUrl.replace('www.tianya.cn', 'tx.tianyaui.com/logo'),
          homepage: homePageUrl
        },
        hot: tds.eq(2).text()
      };
      if (article.hot > 100000) {
        articles.push(article);
      }
    }
  }
  var nextPage = $('.short-pages-2 .links a').eq($('.short-pages-2 .links a').length - 1);
  var nextPageUrl = '';
  if (nextPage.text() === '下一页') {
    nextPageUrl = nextPage.attr('href');
  }
  return {
    articles: articles,
    nextPageUrl: nextPageUrl
  };
}

function _catchArticleContent(articles) {

}

module.exports = {
  catchArticles: function (params) {
    if (params.url == '') return;

    var self = arguments.callee;

    // 获取html
    network.get({
      url: tianya_feeling_pre + params.url,
      timeout: 30000
    }, function (err, data) {
      if (err) {
        console.log('error: ');
        console.log(err);
        return;
      }

      // 解析html
      var parsedData = _parse(data);

      // 将数据存到数据库
      require('../service/articleService').save(parsedData.articles, function () {
        // 获取下一页数据
        setTimeout(function () {
          self.call(null, {
            url: parsedData.nextPageUrl,
            block: params.block
          });
        }, params.block);
      });
    });
  }
};
