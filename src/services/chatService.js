const store = require('../database/store');
const id = require('../utils/id');
function roomId(a,b){ return [a,b].sort().join('_'); }
exports.list = user => {
  const db = store.read();
  const rooms = db.chats.filter(m=>m.fromId===user.id || m.toId===user.id).reduce((acc,m)=>{ acc[m.roomId]=m; return acc; },{});
  return Object.values(rooms).map(m=>({ roomId:m.roomId, last:m, otherId:m.fromId===user.id?m.toId:m.fromId, other: db.users.find(u=>u.id===(m.fromId===user.id?m.toId:m.fromId))?.name || 'User' }));
};
exports.messages = (user, otherId) => {
  const db = store.read(); const rid = roomId(user.id, otherId);
  return db.chats.filter(m=>m.roomId===rid);
};
exports.send = (user, toId, text) => store.update(db => {
  if(!db.users.find(u=>u.id===toId)) throw new Error('ไม่พบผู้รับ');
  const msg = { id: id('msg'), roomId: roomId(user.id,toId), fromId: user.id, toId, text, createdAt: new Date().toISOString() };
  db.chats.push(msg); return msg;
});
