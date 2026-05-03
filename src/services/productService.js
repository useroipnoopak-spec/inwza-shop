const store = require('../database/store');
const id = require('../utils/id');
exports.list = ({q='', category=''}) => {
  const db = store.read();
  const keyword = q.toLowerCase();
  return db.products.filter(p => (!keyword || `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(keyword)) && (!category || p.category === category)).map(p => ({...p, seller: db.users.find(u=>u.id===p.sellerId)?.name || 'Seller'}));
};
exports.detail = productId => {
  const db = store.read();
  const p = db.products.find(x=>x.id===productId);
  if(!p) throw new Error('ไม่พบสินค้า');
  return {...p, seller: db.users.find(u=>u.id===p.sellerId), reviews: db.reviews.filter(r=>r.productId===p.id)};
};
exports.create = (seller, body, files=[]) => store.update(db => {
  const u = db.users.find(x=>x.id===seller.id);
  if(u.role !== 'seller') throw new Error('เฉพาะผู้ขาย');
  if(u.kycStatus !== 'approved') throw new Error('ต้องผ่าน KYC ก่อนลงขายสินค้า');
  const startPrice = Number(body.startPrice || 0);
  const durationHours = Number(body.durationHours || 24);
  if(!body.title || startPrice <= 0) throw new Error('กรอกชื่อสินค้าและราคาเริ่มต้น');
  const p = { id: id('p'), sellerId: seller.id, title: body.title, category: body.category || 'ทั่วไป', description: body.description || '', images: files.map(f=>'/'+f.path.replace(/\\/g,'/')), startPrice, minIncrement: Number(body.minIncrement || 100), buyNowPrice: Number(body.buyNowPrice || 0), currentPrice: startPrice, currentWinnerId: null, status: 'active', endsAt: new Date(Date.now()+durationHours*3600000).toISOString(), createdAt: new Date().toISOString(), bids: [] };
  db.products.unshift(p);
  return p;
});
exports.closeExpired = () => store.update(db => {
  const closed = [];
  for(const p of db.products){
    if(p.status === 'active' && new Date(p.endsAt) <= new Date()){
      p.status = 'closed';
      p.closedAt = new Date().toISOString();
      if(p.currentWinnerId){
        const order = { id: id('ord'), productId: p.id, sellerId: p.sellerId, buyerId: p.currentWinnerId, amount: p.currentPrice, status: 'waiting_payment', paymentStatus: 'wallet_locked', slip: null, shipping: null, createdAt: new Date().toISOString() };
        db.orders.unshift(order);
      }
      closed.push(p);
    }
  }
  return closed;
});
