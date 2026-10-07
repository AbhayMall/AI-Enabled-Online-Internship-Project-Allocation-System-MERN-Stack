const express = require('express');
const router = express.Router();
const {
  applyToOpportunity,
  withdrawApplication,
  getMyApplications,
  getReceivedApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

// Student views own applications
router.get('/mine', roleCheck('student'), getMyApplications);

// Faculty/Admin views received applications
router.get('/received', roleCheck('faculty', 'admin'), getReceivedApplications);

// Student applies to opportunity
router.post('/:opportunityId', roleCheck('student'), applyToOpportunity);

// Student withdraws own application
router.delete('/:id', roleCheck('student', 'admin'), withdrawApplication);

// Faculty/Admin updates application status
router.put('/:id/status', roleCheck('faculty', 'admin'), updateApplicationStatus);

module.exports = router;
