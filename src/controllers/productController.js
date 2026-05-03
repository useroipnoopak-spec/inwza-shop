const products = require('../services/productService');
const auction = require('../services/auctionService');
exports.list = (req,res,next) => { try{ res.json(products.list(req.query)); }catch(e){ next(e); } };
exports.detail = (req,res,next) => { try{ res.json(products.detail(req.params.id)); }catch(e){ next(e); } };
exports.create = (req,res,next) => { try{ res.json(products.create(req.user, req.body, req.files || [])); }catch(e){ next(e); } };
exports.bid = (req,res,next) => { try{ const r=auction.placeBid(req.user, req.params.id, req.body.amount); req.app.get('io').emit('bid:new', r); res.json(r); }catch(e){ next(e); } };
exports.buyNow = (req,res,next) => { try{ const r=auction.buyNow(req.user, req.params.id); req.app.get('io').emit('auction:closed', r.product); res.json(r); }catch(e){ next(e); } };
