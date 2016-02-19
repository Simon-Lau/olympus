var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'olympus'
    },
    port: process.env.PORT || 5000,
    db: 'mongodb://localhost:27017/olympus'
  },

  test: {
    root: rootPath,
    app: {
      name: 'olympus'
    },
    port: process.env.PORT || 5000,
    db: 'mongodb://localhost/server-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'olympus'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://catlike:123456@ds035333.mongolab.com:35333/olympus'
  },

  aliyun: {
    root: rootPath,
    app: {
      name: 'olympus'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost:27017/olympus'
  }
};

module.exports = config[env];
