"use strict";
var AbstractConnectionManager = require('../abstract/connection-manager')
  , ConnectionManager
  , Utils = require('../../utils')
  , Promise = require('../../promise');

ConnectionManager = function (dialect, sequelize) {
  AbstractConnectionManager.call(this, dialect, sequelize);

  this.sequelize = sequelize;
  this.sequelize.config.port = this.sequelize.config.port || 1433;

  try {
    this.lib = require(sequelize.config.dialectModulePath || 'mssql');
  } catch (err) {
    throw new Error('Please install mssql package');
  }
};

Utils._.extend(ConnectionManager.prototype, AbstractConnectionManager.prototype);

ConnectionManager.prototype.connect = function (config) {
  var self = this;

  return new Promise(function (resolve, reject) {
    var connectionConfig = {
      server: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      timezone: self.sequelize.options.timezone,
      pool: {
        max: 1,
        min: 1
      }
    };

    if (config.dialectOptions) {
      Object.keys(config.dialectOptions).forEach(function(key) {
        connectionConfig[key] = config.dialectOptions[key];
      });
    }


    var connection = new self.lib.Connection(connectionConfig, function(err) {
      if (err) {
        return reject(err);
      }

      resolve(connection);
    });
  });
};

ConnectionManager.prototype.disconnect = function (connection) {
  return new Promise(function (resolve, reject) {
    connection.close();
    resolve();
  });
};

module.exports = ConnectionManager;
