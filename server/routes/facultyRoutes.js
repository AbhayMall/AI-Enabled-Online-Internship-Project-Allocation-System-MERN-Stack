const express = require('express');
const router = express.Router();
const { getFacultyProfile, updateFacultyProfile } = require('../controllers/facultyController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);
router.use(roleCheck('faculty'));

router.get('/profile', getFacultyProfile);
router.put('/profile', updateFacultyProfile);

module.exports = router;
