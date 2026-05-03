const orders = require('../services/orderService');
exports.list = (req,res,next) => { try{ res.json(orders.list(req.user)); }catch(e){ next(e); } };
exports.pay = (req,res,next) => { try{ res.json(orders.confirmPayment(req.user, req.params.id, req.file ? '/' + req.file.path.replace(/\\/g,'/') : null)); }catch(e){ next(e); } };
exports.ship = (req,res,next) => { try{ res.json(orders.ship(req.user, req.params.id, { carrier:req.body.carrier, trackingNo:req.body.trackingNo })); }catch(e){ next(e); } };
exports.complete = (req,res,next) => { try{ res.json(orders.complete(req.user, req.params.id)); }catch(e){ next(e); } };
exports.dispute = (req,res,next) => { try{ res.json(orders.createDispute(req.user, req.params.id, req.body.reason)); }catch(e){ next(e); } };
