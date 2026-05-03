const store = require('../database/store');
const id = require('../utils/id');
const notify = require('./notificationService');
const config = require('../config/app');
function autoApproveTopup(requestId){
  const wait = config.autoTopupMinMs + Math.floor(Math.random() * (config.autoTopupMaxMs - config.autoTopupMinMs + 1));
  setTimeout(() => {
    store.update(db => {
      const r = db.walletRequests.find(x=>x.id===requestId);
      if(!r || r.status !== 'pending') return null;
      const u = db.users.find(x=>x.id===r.userId);
      if(!u) return null;
      r.status = 'approved'; r.approvedAt = new Date().toISOString(); r.autoApproved = true;
      u.wallet += Number(r.amount || 0);
      notify.notify(u.id, 'เติมเงินสำเร็จ', `เงินเข้า Wallet แล้ว ${r.amount} บาท`, 'wallet');
      return r;
    });
  }, wait);
}
exports.createTopup = (user, amount, slip) => store.update(db => {
  amount = Number(amount || 0); if(amount <= 0) throw new Error('จำนวนเงินไม่ถูกต้อง');
  const req = { id: id('wal'), type: 'topup', userId: user.id, amount, slip, status: 'pending', autoApproveIn: '1-3 seconds', createdAt: new Date().toISOString() };
  db.walletRequests.unshift(req);
  autoApproveTopup(req.id);
  return req;
});
exports.createWithdraw = (user, amount, bank) => store.update(db => {
  amount = Number(amount || 0); if(amount <= 0) throw new Error('จำนวนเงินไม่ถูกต้อง');
  const u = db.users.find(x=>x.id===user.id);
  if(u.wallet < amount) throw new Error('ยอดเงินไม่พอถอน');
  u.wallet -= amount;
  const req = { id: id('wal'), type: 'withdraw', userId: user.id, amount, bank, status: 'pending', createdAt: new Date().toISOString() };
  db.walletRequests.unshift(req);
  return req;
});
exports.history = user => {
  const db = store.read();
  return db.walletRequests.filter(r=>r.userId===user.id);
};
