const store = require('../database/store');
const id = require('../utils/id');
exports.create = (user, orderId, rating, comment) => store.update(db => {
  const o = db.orders.find(x=>x.id===orderId);
  if(!o || o.buyerId!==user.id || o.status!=='completed') throw new Error('รีวิวได้เฉพาะคำสั่งซื้อที่สำเร็จ');
  const review = { id: id('rev'), orderId, productId:o.productId, sellerId:o.sellerId, userId:user.id, rating:Number(rating||5), comment, reply:'', createdAt:new Date().toISOString() };
  db.reviews.unshift(review); return review;
});
exports.reply = (seller, reviewId, reply) => store.update(db => {
  const r = db.reviews.find(x=>x.id===reviewId);
  if(!r || r.sellerId!==seller.id) throw new Error('ไม่พบรีวิว');
  r.reply = reply; r.repliedAt = new Date().toISOString(); return r;
});
