var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Author
 */
var AuthorSchema = new Schema({
  nickname: String,
  avatar: String,
  homepage: String
});

/**
 * Article
 */
var ArticleSchema = new Schema({
  source: String,
  title: String,
  link: String,
  content: String,
  desc: String,
  author: AuthorSchema,
  hot: {type: Number, default: 0}
});

ArticleSchema.virtual('date')
  .get(function () {
    return this._id.getTimestamp();
  });

mongoose.model('Article', ArticleSchema);

