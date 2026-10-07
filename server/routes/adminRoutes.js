const express = require('express');
const router = express.Router();
const {
  getAnalyticsOverview,
  getDepartmentAnalytics,
  getAllUsers,
  updateUserRole,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All admin routes require auth + admin role
router.use(auth);
router.use(roleCheck('admin'));

router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/department', getDepartmentAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
