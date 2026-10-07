const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/matchController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);
router.use(roleCheck('student'));

router.get('/recommendations', getRecommendations);

module.exports = router;
