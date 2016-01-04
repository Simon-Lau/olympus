// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  nickname: String,
  logo: String,
  gender: String,
  name: String,
  sid: String,
  openid: String
});

UserSchema.virtual('date')
  .get(function () {
    return this._id.getTimestamp();
  });

mongoose.model('User', UserSchema);

