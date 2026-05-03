const auth = require('../services/authService');
exports.register = (req,res,next) => { try{ res.json(auth.register(req.body)); }catch(e){ next(e); } };
exports.login = (req,res,next) => { try{ res.json(auth.login(req.body)); }catch(e){ next(e); } };
exports.me = (req,res) => res.json({ user: auth.publicUser(req.user) });
