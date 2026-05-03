const store = require('../database/store');
const reviews = require('../services/reviewService');
const notify = require('../services/notificationService');

exports.dashboard = (req,res,next) => {
  try{
    const db=store.read();
    const products=db.products.filter(p=>p.sellerId===req.user.id);
    const orders=db.orders.filter(o=>o.sellerId===req.user.id);
    res.json({
      products,
      orders,
      reviews: db.reviews.filter(r=>r.sellerId===req.user.id),
      kycStatus: req.user.kycStatus
    });
  }catch(e){ next(e); }
};

// Demo mode: KYC is approved automatically after submitting the form.
// This keeps the project easy to present/test without waiting for Admin approval.
exports.kyc = (req,res,next) => {
  try{
    const result = store.update(db => {
      const u=db.users.find(x=>x.id===req.user.id);
      if(!u) throw new Error('ไม่พบผู้ขาย');

      u.kycStatus='approved';
      u.kycReason='';
      u.kyc={
        fullName:req.body.fullName,
        idCard:req.body.idCard,
        phone:req.body.phone,
        address:req.body.address,
        doc:req.file?'/'+req.file.path.replace(/\\/g,'/'):null,
        submittedAt:new Date().toISOString(),
        approvedAt:new Date().toISOString(),
        autoApproved:true
      };

      return u;
    });

    notify.notify(req.user.id, 'KYC ผ่านอัตโนมัติ', 'บัญชีผู้ขายของคุณได้รับการยืนยันแล้ว สามารถลงขายสินค้าได้ทันที', 'kyc');
    res.json(result);
  }catch(e){ next(e); }
};

exports.replyReview = (req,res,next) => {
  try{ res.json(reviews.reply(req.user, req.params.id, req.body.reply)); }
  catch(e){ next(e); }
};
