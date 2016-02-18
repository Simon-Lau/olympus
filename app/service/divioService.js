var cheerio = require('cheerio');
var articleService = require('./articleService');


module.exports = {
  /**
   * 解析从divio获取的html数据
   * @param data
   * @returns {Array} Article对象数组
   */
  parse: function (data) {
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
        source: 'divio'
      };
      result.push(article);
    }
    return result;
  },
  /**
   * 保存
   * @param data
   */
  save: function (data) {
    var result = this.parse(data);
    articleService.save(result);
  },
  /**
   * 查找
   */
  find: articleService.find
};
