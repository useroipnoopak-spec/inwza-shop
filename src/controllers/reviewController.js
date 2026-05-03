const reviews = require('../services/reviewService');
exports.create = (req,res,next) => { try{ res.json(reviews.create(req.user, req.body.orderId, req.body.rating, req.body.comment)); }catch(e){ next(e); } };
