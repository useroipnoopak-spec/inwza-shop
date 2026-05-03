const admin = require('../services/adminService');
exports.dashboard = (req,res,next) => { try{ res.json(admin.dashboard()); }catch(e){ next(e); } };
exports.kyc = (req,res,next) => { try{ res.json(admin.kyc(req.params.userId, req.body.status, req.body.reason)); }catch(e){ next(e); } };
exports.wallet = (req,res,next) => { try{ res.json(admin.wallet(req.params.id, req.body.status)); }catch(e){ next(e); } };
exports.orderSlip = (req,res,next) => { try{ res.json(admin.orderSlip(req.params.id, req.body.status)); }catch(e){ next(e); } };
exports.userStatus = (req,res,next) => { try{ res.json(admin.userStatus(req.params.id, req.body.status)); }catch(e){ next(e); } };
exports.settings = (req,res,next) => { try{ res.json(admin.settings(req.body)); }catch(e){ next(e); } };
exports.resolveDispute = (req,res,next) => { try{ res.json(admin.resolveDispute(req.params.id, req.body.action)); }catch(e){ next(e); } };
