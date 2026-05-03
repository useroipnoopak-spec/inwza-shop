const store = require('../database/store');
const notify = require('./notificationService');
const { platformFee } = require('../utils/money');
const id = require('../utils/id');
exports.list = user => {
  const db = store.read();
  return db.orders.filter(o => user.role==='admin' || o.buyerId===user.id || o.sellerId===user.id).map(o => ({...o, product: db.products.find(p=>p.id===o.productId), buyer: db.users.find(u=>u.id===o.buyerId)?.name, seller: db.users.find(u=>u.id===o.sellerId)?.name }));
};
exports.confirmPayment = (user, orderId, slip) => store.update(db => {
  const o = db.orders.find(x=>x.id===orderId);
  if(!o || o.buyerId !== user.id) throw new Error('ไม่พบคำสั่งซื้อ');
  o.slip = slip || o.slip; o.paymentStatus = 'submitted'; o.status = 'payment_review'; o.updatedAt = new Date().toISOString();
  notify.notify(o.sellerId, 'ผู้ซื้อส่งหลักฐานชำระเงิน', `Order ${o.id}`, 'order');
  return o;
});
exports.ship = (seller, orderId, shipping) => store.update(db => {
  const o = db.orders.find(x=>x.id===orderId);
  if(!o || o.sellerId !== seller.id) throw new Error('ไม่พบคำสั่งซื้อ');
  o.shipping = shipping; o.status = 'shipped'; o.updatedAt = new Date().toISOString();
  notify.notify(o.buyerId, 'สินค้าถูกจัดส่งแล้ว', `${shipping.carrier || ''} ${shipping.trackingNo || ''}`, 'order');
  return o;
});
exports.complete = (buyer, orderId) => store.update(db => {
  const o = db.orders.find(x=>x.id===orderId);
  if(!o || o.buyerId !== buyer.id) throw new Error('ไม่พบคำสั่งซื้อ');
  if(o.status !== 'shipped') throw new Error('ยังไม่สามารถยืนยันรับสินค้าได้');
  const buyerUser = db.users.find(u=>u.id===o.buyerId);
  const sellerUser = db.users.find(u=>u.id===o.sellerId);
  const fee = platformFee(o.amount, db.settings.platformFeePercent);
  buyerUser.locked = Math.max(0, buyerUser.locked - o.amount);
  sellerUser.wallet += o.amount - fee;
  o.status = 'completed'; o.paymentStatus = 'released'; o.platformFee = fee; o.completedAt = new Date().toISOString();
  notify.notify(o.sellerId, 'คำสั่งซื้อสำเร็จ', `ระบบปล่อยเงินให้แล้ว ${o.amount - fee} บาท`, 'order');
  return o;
});
exports.createDispute = (buyer, orderId, reason) => store.update(db => {
  const o = db.orders.find(x=>x.id===orderId);
  if(!o || o.buyerId !== buyer.id) throw new Error('ไม่พบคำสั่งซื้อ');
  const d = { id: id('dis'), orderId, buyerId: buyer.id, sellerId: o.sellerId, reason, status: 'open', createdAt: new Date().toISOString() };
  db.disputes.unshift(d); o.status = 'disputed';
  return d;
});
