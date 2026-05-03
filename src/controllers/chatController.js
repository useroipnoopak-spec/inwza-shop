const chat = require('../services/chatService');
exports.list = (req,res,next) => { try{ res.json(chat.list(req.user)); }catch(e){ next(e); } };
exports.messages = (req,res,next) => { try{ res.json(chat.messages(req.user, req.params.otherId)); }catch(e){ next(e); } };
exports.send = (req,res,next) => { try{ const msg=chat.send(req.user, req.body.toId, req.body.text); req.app.get('io').to(`user:${req.body.toId}`).emit('chat:message', msg); res.json(msg); }catch(e){ next(e); } };
