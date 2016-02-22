var request = require('request'),
  zlib = require('zlib');
function get(params, callback) {
  request(params,
    function (error, response, data) {
      console.log(params.url);
      if (error) callback(error || response.statusCode);
      if (!error && response.statusCode == 200) {
        var buffer = new Buffer(data);
        var encoding = response.headers['content-encoding'];
        if (encoding == 'gzip') {
          zlib.gunzip(buffer, function (err, decoded) {
            callback(err && ('unzip error' + err), decoded && decoded.toString());
          });
        } else if (encoding == 'deflate') {
          zlib.inflate(buffer, function (err, decoded) {
            callback(err && ('deflate error' + err), decoded && decoded.toString());
          })
        } else {
          callback(null, buffer.toString());
        }
      }
    });
}

module.exports = {
  get: get
};
