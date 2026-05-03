const store = require('../database/store');
function auth(req,res,next){
  const token = req.headers.authorization?.replace('Bearer ','') || req.headers['x-token'];
  const db = store.read();
  const session = db.sessions.find(s => s.token === token);
  if(!session) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  const user = db.users.find(u => u.id === session.userId);
  if(!user || user.status !== 'active') return res.status(403).json({ error: 'บัญชีถูกระงับหรือไม่พบผู้ใช้' });
  req.user = user;
  next();
}
function optionalAuth(req,res,next){
  const token = req.headers.authorization?.replace('Bearer ','') || req.headers['x-token'];
  const db = store.read();
  const session = db.sessions.find(s => s.token === token);
  req.user = session ? db.users.find(u => u.id === session.userId) : null;
  next();
}
function requireRole(...roles){
  return (req,res,next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'ไม่มีสิทธิ์ใช้งานส่วนนี้' });
}
module.exports = { auth, optionalAuth, requireRole };
