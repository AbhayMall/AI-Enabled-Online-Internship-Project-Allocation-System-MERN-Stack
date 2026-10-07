const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
} = require('../controllers/opportunityController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All opportunity routes require authentication
router.use(auth);

// Get postings created by the logged-in faculty (Must be before /:id)
router.get('/mine', roleCheck('faculty', 'admin'), getMyOpportunities);

// List open opportunities (Any logged-in user)
router.get('/', getOpportunities);

// Get single opportunity detail
router.get('/:id', getOpportunityById);

// Create posting (Faculty / Admin)
router.post('/', roleCheck('faculty', 'admin'), createOpportunity);

// Update posting (Faculty own only / Admin)
router.put('/:id', roleCheck('faculty', 'admin'), updateOpportunity);

// Delete posting (Faculty own only / Admin)
router.delete('/:id', roleCheck('faculty', 'admin'), deleteOpportunity);

module.exports = router;
