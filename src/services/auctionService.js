const store = require('../database/store');
const id = require('../utils/id');
const notify = require('./notificationService');
exports.placeBid = (user, productId, amount) => store.update(db => {
  const p = db.products.find(x=>x.id===productId);
  if(!p) throw new Error('ไม่พบสินค้า');
  if(p.status !== 'active') throw new Error('สินค้านี้ปิดประมูลแล้ว');
  if(new Date(p.endsAt) <= new Date()) throw new Error('หมดเวลาประมูลแล้ว');
  if(p.sellerId === user.id) throw new Error('ผู้ขายไม่สามารถประมูลสินค้าตัวเองได้');
  const bidder = db.users.find(u=>u.id===user.id);
  const bidAmount = Number(amount || 0);
  const minBid = Number(p.currentPrice) + Number(p.minIncrement || 1);
  if(bidAmount < minBid) throw new Error(`ต้องเสนอราคาอย่างน้อย ${minBid}`);
  if(bidder.wallet < bidAmount) throw new Error('ยอดเงินใน Wallet ไม่พอ');
  if(p.currentWinnerId){
    const oldWinner = db.users.find(u=>u.id===p.currentWinnerId);
    if(oldWinner){ oldWinner.wallet += p.currentPrice; oldWinner.locked = Math.max(0, oldWinner.locked - p.currentPrice); }
    notify.notify(p.currentWinnerId, 'มีคนเสนอราคาสูงกว่า', `สินค้า ${p.title} ถูกเสนอราคาสูงกว่าแล้ว`, 'bid');
  }
  bidder.wallet -= bidAmount;
  bidder.locked += bidAmount;
  const bid = { id: id('bid'), userId: user.id, amount: bidAmount, createdAt: new Date().toISOString() };
  p.bids.unshift(bid);
  p.currentPrice = bidAmount;
  p.currentWinnerId = user.id;
  const settings = db.settings;
  const msLeft = new Date(p.endsAt) - Date.now();
  if(msLeft > 0 && msLeft <= Number(settings.antiSnipeMinutes || 2) * 60000){
    p.endsAt = new Date(Date.now() + Number(settings.extendMinutes || 2) * 60000).toISOString();
  }
  notify.notify(p.sellerId, 'มีผู้เสนอราคาใหม่', `${user.name} เสนอราคา ${bidAmount} บาท`, 'bid');
  return { product: p, bid };
});
exports.buyNow = (user, productId) => store.update(db => {
  const p = db.products.find(x=>x.id===productId);
  if(!p || p.status !== 'active') throw new Error('ซื้อทันทีไม่ได้');
  if(!p.buyNowPrice) throw new Error('สินค้านี้ไม่มีราคาซื้อทันที');
  if(p.sellerId === user.id) throw new Error('ซื้อสินค้าตัวเองไม่ได้');
  const buyer = db.users.find(u=>u.id===user.id);
  if(buyer.wallet < p.buyNowPrice) throw new Error('ยอดเงินใน Wallet ไม่พอ');
  if(p.currentWinnerId){
    const oldWinner = db.users.find(u=>u.id===p.currentWinnerId);
    if(oldWinner){ oldWinner.wallet += p.currentPrice; oldWinner.locked = Math.max(0, oldWinner.locked - p.currentPrice); }
  }
  buyer.wallet -= p.buyNowPrice; buyer.locked += p.buyNowPrice;
  p.status = 'sold'; p.currentWinnerId = user.id; p.currentPrice = p.buyNowPrice; p.closedAt = new Date().toISOString();
  const order = { id: id('ord'), productId: p.id, sellerId: p.sellerId, buyerId: user.id, amount: p.buyNowPrice, status: 'waiting_payment', paymentStatus: 'wallet_locked', slip: null, shipping: null, createdAt: new Date().toISOString() };
  db.orders.unshift(order);
  notify.notify(p.sellerId, 'มีคำสั่งซื้อใหม่', `${user.name} ซื้อสินค้า ${p.title}`, 'order');
  return { product: p, order };
});
