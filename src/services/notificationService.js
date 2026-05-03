const store = require('../database/store');
const id = require('../utils/id');
let ioRef = null;
exports.bindSocket = io => { ioRef = io; };
exports.notify = (userId, title, message, type='info') => {
  const n = { id: id('n'), userId, title, message, type, read: false, createdAt: new Date().toISOString() };
  store.update(db => db.notifications.unshift(n));
  if(ioRef) ioRef.to(`user:${userId}`).emit('notification', n);
  return n;
};
