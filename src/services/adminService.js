const store = require('../database/store');
const notify = require('./notificationService');
const { platformFee } = require('../utils/money');
exports.dashboard = () => {
  const db = store.read();
  return {
    counts: {
      users: db.users.length,
      products: db.products.length,
      orders: db.orders.length,
      pendingKyc: db.users.filter(u=>u.role==='seller'&&u.kycStatus==='pending').length,
      pendingWallet: db.walletRequests.filter(w=>w.status==='pending').length,
      disputes: db.disputes.filter(d=>d.status==='open').length
    },
    users: db.users.map(({passwordHash,...u})=>u),
    walletRequests: db.walletRequests.map(w=>({...w,user:db.users.find(u=>u.id===w.userId)?.name})),
    orders: db.orders.map(o=>({...o,product:db.products.find(p=>p.id===o.productId)?.title})),
    disputes: db.disputes,
    settings: db.settings
  };
};
exports.kyc = (sellerId, status, reason='') => store.update(db => {
  const u = db.users.find(x=>x.id===sellerId && x.role==='seller');
  if(!u) throw new Error('ไม่พบผู้ขาย'); u.kycStatus=status; u.kycReason=reason;
  notify.notify(u.id, 'ผลตรวจ KYC', status==='approved'?'KYC ผ่านแล้ว':'KYC ไม่ผ่าน', 'kyc'); return u;
});
exports.wallet = (requestId, status) => store.update(db => {
  const r = db.walletRequests.find(x=>x.id===requestId); if(!r) throw new Error('ไม่พบรายการ');
  if(r.status!=='pending') return r;
  const u = db.users.find(x=>x.id===r.userId);
  r.status=status; r.reviewedAt=new Date().toISOString();
  if(status==='approved' && r.type==='topup') u.wallet += r.amount;
  if(status==='rejected' && r.type==='withdraw') u.wallet += r.amount;
  notify.notify(u.id, 'ผลรายการ Wallet', `${r.type} ${status}`, 'wallet'); return r;
});
exports.orderSlip = (orderId, status) => store.update(db => {
  const o = db.orders.find(x=>x.id===orderId); if(!o) throw new Error('ไม่พบ order');
  o.paymentStatus = status==='approved'?'paid':'rejected'; o.status = status==='approved'?'paid_waiting_ship':'waiting_payment';
  return o;
});
exports.userStatus = (userId, status) => store.update(db => { const u=db.users.find(x=>x.id===userId); if(!u) throw new Error('ไม่พบผู้ใช้'); u.status=status; return u; });
exports.settings = data => store.update(db => { db.settings = {...db.settings, ...data}; return db.settings; });
exports.resolveDispute = (disputeId, action) => store.update(db => {
  const d = db.disputes.find(x=>x.id===disputeId); if(!d) throw new Error('ไม่พบข้อพิพาท');
  const o = db.orders.find(x=>x.id===d.orderId); const buyer=db.users.find(u=>u.id===d.buyerId); const seller=db.users.find(u=>u.id===d.sellerId);
  if(action==='refund') { buyer.locked=Math.max(0,buyer.locked-o.amount); buyer.wallet += o.amount; o.status='refunded'; o.paymentStatus='refunded'; }
  else { const fee = platformFee(o.amount, db.settings.platformFeePercent); buyer.locked=Math.max(0,buyer.locked-o.amount); seller.wallet += o.amount-fee; o.status='completed'; o.paymentStatus='released'; o.platformFee=fee; }
  d.status='resolved'; d.action=action; d.resolvedAt=new Date().toISOString(); return d;
});
