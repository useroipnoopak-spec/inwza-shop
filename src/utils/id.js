const { v4: uuid } = require('uuid');
module.exports = prefix => `${prefix}_${uuid().slice(0, 8)}`;
