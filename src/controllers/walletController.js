const wallet = require('../services/walletService');
exports.topup = (req,res,next) => { try{ res.json(wallet.createTopup(req.user, req.body.amount, req.file ? '/' + req.file.path.replace(/\\/g,'/') : null)); }catch(e){ next(e); } };
exports.withdraw = (req,res,next) => { try{ res.json(wallet.createWithdraw(req.user, req.body.amount, { bank:req.body.bank, accountNo:req.body.accountNo, accountName:req.body.accountName })); }catch(e){ next(e); } };
exports.history = (req,res,next) => { try{ res.json(wallet.history(req.user)); }catch(e){ next(e); } };
