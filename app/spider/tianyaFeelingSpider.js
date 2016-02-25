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

function _catchArticleContent(data) {
  var content = [];
  $ = cheerio.load(data, {decodeEntities: false});
  var username = encodeURIComponent($('.atl-info span a').attr('uname'));
  var blocks = $('.atl-main .atl-item');
  for (var i = 0, len = blocks.length; i < len; i++) {
    if ($(blocks[i]).attr('_host') === username) {
      content.push($(blocks[i]).find('.bbs-content').html());
    }
  }
  return {
    content: content
  }
}

module.exports = {
  catchArticles: function (params) {
    if (params.url == '') return;

    var self = arguments.callee;

    // 获取html
    network.get({
      url: tianya_feeling_pre + params.url,
      timeout: 15000
    }, function (err, data) {
      if (err) {
        console.log(err);
        console.log('request error: ' + tianya_feeling_pre + params.url + ', retry......');
        self.call(null, params);
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
  },
  catchArticleDetail: function (params, callback) {
    var self = arguments.callee;
    var articleService = require('../service/articleService');
    var requestUrl = params.nextUrl || params.article.link;
    console.log('request: ' + requestUrl);

    network.get({
      followRedirect: false,// 以30x为终止标识位
      url: requestUrl,
      timeout: 15000
    }, function (err, data) {
      if (err) {
        if (err.statusCode && /3\d\d/.test(err.statusCode.toString())) {
          params.article.finish = 1;
          articleService.save(params.article, function (err) {
            if (err) {
              throw(err);
            }
            console.log('catch article ' + params.article.title + ' finished!');
            callback(params.article);
          });
        } else if (err.statusCode && /[4-5]\d\d/.test(err.statusCode.toString())) {
          callback(err);
        } else {
          console.log(err);
          console.log('request error: ' + requestUrl + ', retry......');
          self.call(null, params, callback);
        }
        return;
      }

      // 解析一页html
      var parsedData = _catchArticleContent(data);
      var currentPageNumber = Number(requestUrl.match(/.*-(\d+)\..*/)[1]);
      var nextPage = requestUrl.replace(/(.*-)(\d+)(\..*)/, '$1' + (currentPageNumber + 1).toString() + '$3');

      // 抓取前清除旧数据
      if (currentPageNumber === 1) {
        params.article.content = [];
      }
      // 将数据存到数据库
      params.article.content = params.article.content.concat(parsedData.content);
      articleService.save(params.article, function (err, data) {
        if (err) {
          console.log(err);
          return;
        }
        console.log('save block success! now content length is ' + params.article.content.length);
        // 获取下一页数据
        setTimeout(function () {
          self.call(null, {
            article: params.article,
            nextUrl: nextPage,
            block: params.block
          }, callback);
        }, params.block);
      });
    });
  }
};
