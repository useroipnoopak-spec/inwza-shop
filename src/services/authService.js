const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const store = require('../database/store');
const id = require('../utils/id');
function publicUser(u){ const { passwordHash, ...safe } = u; return safe; }
exports.register = ({name,email,password,role}) => store.update(db => {
  if(!name || !email || !password) throw new Error('กรอกข้อมูลไม่ครบ');
  if(db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('อีเมลนี้ถูกใช้แล้ว');
  const user = { id: id('u'), role: role === 'seller' ? 'seller' : 'user', name, email, passwordHash: bcrypt.hashSync(password,10), wallet: 0, locked: 0, status: 'active', kycStatus: role === 'seller' ? 'pending' : 'not_required', createdAt: new Date().toISOString() };
  db.users.push(user);
  const token = uuid(); db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  return { token, user: publicUser(user) };
});
exports.login = ({email,password}) => store.update(db => {
  const user = db.users.find(u => u.email.toLowerCase() === String(email||'').toLowerCase());
  if(!user || !bcrypt.compareSync(password || '', user.passwordHash)) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  if(user.status !== 'active') throw new Error('บัญชีนี้ถูกระงับ');
  const token = uuid(); db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  return { token, user: publicUser(user) };
});
exports.publicUser = publicUser;
