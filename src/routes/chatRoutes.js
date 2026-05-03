const router = require('express').Router();
const c = require('../controllers/chatController');
const { auth } = require('../middleware/auth');
router.get('/', auth, c.list);
router.get('/:otherId', auth, c.messages);
router.post('/', auth, c.send);
module.exports = router;
