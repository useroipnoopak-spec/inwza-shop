const router = require('express').Router();
const c = require('../controllers/walletController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
router.get('/', auth, c.history);
router.post('/topup', auth, upload.single('slip'), c.topup);
router.post('/withdraw', auth, c.withdraw);
module.exports = router;
