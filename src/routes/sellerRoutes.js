const router = require('express').Router();
const c = require('../controllers/sellerController');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
router.get('/dashboard', auth, requireRole('seller'), c.dashboard);
router.post('/kyc', auth, requireRole('seller'), upload.single('kycDoc'), c.kyc);
router.post('/reviews/:id/reply', auth, requireRole('seller'), c.replyReview);
module.exports = router;
