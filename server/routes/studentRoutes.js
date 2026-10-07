const express = require('express');
const router = express.Router();
const { getStudentProfile, updateStudentProfile, uploadResume } = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// Student-only protected routes
router.use(auth);
router.use(roleCheck('student'));

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.post('/resume', upload.single('resume'), uploadResume);

module.exports = router;
