const router = require('express').Router();
const c = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');
router.post('/', auth, c.create);
module.exports = router;
