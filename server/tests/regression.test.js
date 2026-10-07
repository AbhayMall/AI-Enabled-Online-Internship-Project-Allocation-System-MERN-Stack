/**
 * Full Backend Regression Test Suite
 * Tests every single API endpoint in Part C across Student, Faculty, and Admin roles
 * Enforces institutional email validation (@cuchd.in for students, @cumail.in for faculty)
 */
process.env.NODE_ENV = 'test';
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const http = require('http');
const app = require('../server');

let mongoServer;
let server;
let baseUrl;

// Helper to make HTTP requests
const request = (method, path, body = null, token = null, contentType = 'application/json') => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let payload = '';
    if (body) {
      headers['Content-Type'] = contentType;
      payload = JSON.stringify(body);
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

// Test Runner
const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 Starting Full API Regression Test Pass');
  console.log('======================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failedCount++;
    }
  };

  try {
    // 1. Setup in-memory database and test server
    console.log('[Setup] Initializing In-Memory MongoDB Server...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('[Setup] Connected to In-Memory DB.');

    // Start Express server on ephemeral port
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[Setup] Test server running on ${baseUrl}\n`);

    // State holders
    let studentToken = '';
    let studentId = '';
    let facultyToken = '';
    let facultyId = '';
    let adminToken = '';
    let adminId = '';

    let opp1Id = '';
    let opp2Id = '';
    let appId1 = '';
    let appId2 = '';
    let notificationId = '';

    // ==========================================
    // 1. ROOT & HEALTH CHECK
    // ==========================================
    console.log('--- 1. Root & Health Check ---');
    const healthRes = await request('GET', '/');
    assert(healthRes.status === 200 && healthRes.body.success === true, 'GET / returns 200 OK');

    // ==========================================
    // 2. AUTHENTICATION & INSTITUTIONAL DOMAIN RESTRICTIONS
    // ==========================================
    console.log('\n--- 2. Authentication & Institutional Domain Endpoints ---');

    // 2.1 Reject Non-Institutional Domain
    const rejectNonInstRes = await request('POST', '/api/auth/register', {
      name: 'Invalid User',
      email: 'user@gmail.com',
      password: 'password123',
      role: 'student',
    });
    assert(rejectNonInstRes.status === 400 && rejectNonInstRes.body.message.includes('@cuchd.in'), 'Student registration with @gmail.com rejected (400)');

    // 2.2 Reject Faculty registering with student domain
    const rejectFacWrongDomain = await request('POST', '/api/auth/register', {
      name: 'Dr. Wrong Domain',
      email: 'teacher@cuchd.in',
      password: 'password123',
      role: 'faculty',
    });
    assert(rejectFacWrongDomain.status === 400 && rejectFacWrongDomain.body.message.includes('@cumail.in'), 'Faculty registration with @cuchd.in rejected (requires @cumail.in)');

    // 2.3 Register Student (@cuchd.in)
    const regStudentRes = await request('POST', '/api/auth/register', {
      name: 'Alice Student',
      email: 'alice@cuchd.in',
      password: 'password123',
      role: 'student',
      department: 'Computer Science',
      year: 3,
    });
    assert(regStudentRes.status === 201 && regStudentRes.body.token, 'POST /api/auth/register (Student @cuchd.in) returns 201 and token');
    studentToken = regStudentRes.body.token;
    studentId = regStudentRes.body.user.id;

    // 2.4 Register Faculty (@cumail.in)
    const regFacultyRes = await request('POST', '/api/auth/register', {
      name: 'Dr. Robert Smith',
      email: 'robert@cumail.in',
      password: 'password123',
      role: 'faculty',
      department: 'Computer Science',
      designation: 'Associate Professor',
    });
    assert(regFacultyRes.status === 201 && regFacultyRes.body.user.role === 'faculty', 'POST /api/auth/register (Faculty @cumail.in) returns 201');
    facultyToken = regFacultyRes.body.token;
    facultyId = regFacultyRes.body.user.id;

    // 2.5 Register Admin (@cumail.in)
    const regAdminRes = await request('POST', '/api/auth/register', {
      name: 'Admin Coordinator',
      email: 'admin@cumail.in',
      password: 'adminpassword123',
      role: 'admin',
    });
    assert(regAdminRes.status === 201 && regAdminRes.body.user.role === 'admin', 'POST /api/auth/register (Admin @cumail.in) returns 201');
    adminToken = regAdminRes.body.token;
    adminId = regAdminRes.body.user.id;

    // 2.6 Duplicate Email Check
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'Duplicate Alice',
      email: 'alice@cuchd.in',
      password: 'password123',
    });
    assert(dupRes.status === 400, 'POST /api/auth/register duplicate email rejected with 400');

    // 2.7 Login Check
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'alice@cuchd.in',
      password: 'password123',
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'POST /api/auth/login succeeds with 200');

    // 2.8 Invalid Login Check
    const invalidLoginRes = await request('POST', '/api/auth/login', {
      email: 'alice@cuchd.in',
      password: 'wrongpassword',
    });
    assert(invalidLoginRes.status === 401, 'POST /api/auth/login wrong password rejected with 401');

    // 2.9 GET /api/auth/me (Protected)
    const meRes = await request('GET', '/api/auth/me', null, studentToken);
    assert(meRes.status === 200 && meRes.body.user.email === 'alice@cuchd.in', 'GET /api/auth/me returns student data');

    const meUnauthRes = await request('GET', '/api/auth/me');
    assert(meUnauthRes.status === 401, 'GET /api/auth/me without token returns 401');

    // ==========================================
    // 3. ROLE-BASED ACCESS CONTROL (RBAC)
    // ==========================================
    console.log('\n--- 3. Role-Based Access Control Checks ---');
    const rbacAdminRes = await request('GET', '/api/admin/users', null, studentToken);
    assert(rbacAdminRes.status === 403, 'Student token on Admin route returns 403 Forbidden');

    const rbacCreateOppRes = await request('POST', '/api/opportunities', {
      title: 'Illegal Student Posting',
      type: 'project',
      capacity: 1,
    }, studentToken);
    assert(rbacCreateOppRes.status === 403, 'Student token on Opportunity Creation returns 403 Forbidden');

    const rbacStudentRecRes = await request('GET', '/api/match/recommendations', null, facultyToken);
    assert(rbacStudentRecRes.status === 403, 'Faculty token on Student Recommendations returns 403 Forbidden');

    // ==========================================
    // 4. STUDENT PROFILE ENDPOINTS
    // ==========================================
    console.log('\n--- 4. Student Profile Endpoints ---');
    const updateProfileRes = await request('PUT', '/api/students/profile', {
      department: 'Computer Science',
      year: 3,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Git'],
      preferences: ['AI', 'Data Science', 'Machine Learning'],
    }, studentToken);
    assert(updateProfileRes.status === 200 && updateProfileRes.body.profile.skills.includes('Python'), 'PUT /api/students/profile updates skills and preferences');

    const getProfileRes = await request('GET', '/api/students/profile', null, studentToken);
    assert(getProfileRes.status === 200 && getProfileRes.body.profile.year === 3, 'GET /api/students/profile returns updated academic info');

    // ==========================================
    // 5. FACULTY PROFILE ENDPOINTS
    // ==========================================
    console.log('\n--- 5. Faculty Profile Endpoints ---');
    const updateFacProfileRes = await request('PUT', '/api/faculty/profile', {
      department: 'Computer Science',
      designation: 'Professor & Lab Director',
    }, facultyToken);
    assert(updateFacProfileRes.status === 200 && updateFacProfileRes.body.profile.designation === 'Professor & Lab Director', 'PUT /api/faculty/profile updates faculty info');

    const getFacProfileRes = await request('GET', '/api/faculty/profile', null, facultyToken);
    assert(getFacProfileRes.status === 200 && getFacProfileRes.body.profile.department === 'Computer Science', 'GET /api/faculty/profile returns faculty profile');

    // ==========================================
    // 6. OPPORTUNITY ENDPOINTS & STUDENT EMAIL BROADCAST TRIGGER
    // ==========================================
    console.log('\n--- 6. Opportunity Endpoints & Broadcast Notification ---');

    // 6.1 Faculty creates Opportunity 1 (Triggers student broadcast alert)
    const opp1Res = await request('POST', '/api/opportunities', {
      title: 'Computer Vision & Deep Learning Research Intern',
      type: 'internship',
      description: 'Developing PyTorch object detection models for autonomous systems',
      requiredSkills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow'],
      capacity: 2,
      department: 'Computer Science',
    }, facultyToken);
    assert(opp1Res.status === 201 && opp1Res.body.opportunity._id, 'POST /api/opportunities (Opp 1) created by Faculty & broadcast sent');
    opp1Id = opp1Res.body.opportunity._id;

    // 6.2 Faculty creates Opportunity 2
    const opp2Res = await request('POST', '/api/opportunities', {
      title: 'Frontend React UI Developer Project',
      type: 'project',
      description: 'Building interactive dashboard components using React and Tailwind',
      requiredSkills: ['React', 'CSS', 'JavaScript', 'HTML'],
      capacity: 1,
      department: 'Information Technology',
    }, facultyToken);
    assert(opp2Res.status === 201, 'POST /api/opportunities (Opp 2) created by Faculty');
    opp2Id = opp2Res.body.opportunity._id;

    // 6.3 List All Open Opportunities
    const listOppsRes = await request('GET', '/api/opportunities', null, studentToken);
    assert(listOppsRes.status === 200 && listOppsRes.body.count === 2, 'GET /api/opportunities returns all open opportunities');

    // 6.4 Opportunity Filter by Type
    const filterOppRes = await request('GET', '/api/opportunities?type=internship', null, studentToken);
    assert(filterOppRes.status === 200 && filterOppRes.body.count === 1, 'GET /api/opportunities?type=internship filters correctly');

    // 6.5 Get Single Opportunity Detail
    const singleOppRes = await request('GET', `/api/opportunities/${opp1Id}`, null, studentToken);
    assert(singleOppRes.status === 200 && singleOppRes.body.opportunity.title.includes('Computer Vision'), 'GET /api/opportunities/:id returns detailed opportunity stats');

    // 6.6 Faculty List Own Opportunities
    const myOppsRes = await request('GET', '/api/opportunities/mine', null, facultyToken);
    assert(myOppsRes.status === 200 && myOppsRes.body.count === 2, 'GET /api/opportunities/mine lists faculty postings');

    // 6.7 Update Opportunity
    const updateOppRes = await request('PUT', `/api/opportunities/${opp1Id}`, {
      capacity: 3,
    }, facultyToken);
    assert(updateOppRes.status === 200 && updateOppRes.body.opportunity.capacity === 3, 'PUT /api/opportunities/:id updates posting capacity');

    // ==========================================
    // 7. AI MATCHING & RECOMMENDATIONS ENGINE
    // ==========================================
    console.log('\n--- 7. AI Matching Engine & Recommendations ---');
    const recRes = await request('GET', '/api/match/recommendations', null, studentToken);
    assert(recRes.status === 200 && recRes.body.recommendations.length === 2, 'GET /api/match/recommendations returns ranked postings');
    
    const topRec = recRes.body.recommendations[0];
    const secondRec = recRes.body.recommendations[1];
    assert(topRec._id === opp1Id && topRec.matchScore > secondRec.matchScore, `Top ranked recommendation is Opp 1 with score ${topRec.matchScore}% vs ${secondRec.matchScore}%`);
    assert(topRec.matchAnalysis.matchedSkills.includes('Python'), 'Match analysis contains matched skill breakdown');

    // ==========================================
    // 8. APPLICATION LIFECYCLE
    // ==========================================
    console.log('\n--- 8. Application Lifecycle Endpoints ---');

    // 8.1 Student applies to Opp 1
    const applyRes1 = await request('POST', `/api/applications/${opp1Id}`, null, studentToken);
    assert(applyRes1.status === 201 && applyRes1.body.application.status === 'applied', 'POST /api/applications/:opportunityId submits application');
    appId1 = applyRes1.body.application._id;
    assert(applyRes1.body.application.matchScore > 0, `Application stores matchScore automatically (${applyRes1.body.application.matchScore}%)`);

    // 8.2 Duplicate Application Prevention Check
    const dupAppRes = await request('POST', `/api/applications/${opp1Id}`, null, studentToken);
    assert(dupAppRes.status === 400, 'Duplicate application to same opportunity is prevented (400)');

    // 8.3 Student applies to Opp 2 (for withdrawal testing)
    const applyRes2 = await request('POST', `/api/applications/${opp2Id}`, null, studentToken);
    assert(applyRes2.status === 201, 'Student applies to Opp 2');
    appId2 = applyRes2.body.application._id;

    // 8.4 Student views own applications
    const myAppsRes = await request('GET', '/api/applications/mine', null, studentToken);
    assert(myAppsRes.status === 200 && myAppsRes.body.count === 2, 'GET /api/applications/mine returns 2 submitted applications');

    // 8.5 Faculty views received applications
    const receivedAppsRes = await request('GET', '/api/applications/received', null, facultyToken);
    assert(receivedAppsRes.status === 200 && receivedAppsRes.body.count === 2, 'GET /api/applications/received lists applications for faculty postings');

    // 8.6 Faculty updates status to 'under_review'
    const statusReviewRes = await request('PUT', `/api/applications/${appId1}/status`, {
      status: 'under_review',
    }, facultyToken);
    assert(statusReviewRes.status === 200 && statusReviewRes.body.application.status === 'under_review', 'PUT /api/applications/:id/status updates to under_review');

    // 8.7 Faculty updates status to 'allocated'
    const statusAllocRes = await request('PUT', `/api/applications/${appId1}/status`, {
      status: 'allocated',
      hoursCompleted: 40,
    }, facultyToken);
    assert(statusAllocRes.status === 200 && statusAllocRes.body.application.status === 'allocated' && statusAllocRes.body.allocation, 'Status change to "allocated" generates Allocation record');

    // 8.8 Student withdraws application for Opp 2
    const withdrawRes = await request('DELETE', `/api/applications/${appId2}`, null, studentToken);
    assert(withdrawRes.status === 200, 'DELETE /api/applications/:id student withdraws own application');

    // ==========================================
    // 9. NOTIFICATION ENDPOINTS
    // ==========================================
    console.log('\n--- 9. Notification Endpoints ---');
    const notifsRes = await request('GET', '/api/notifications', null, studentToken);
    assert(notifsRes.status === 200 && notifsRes.body.count >= 1, 'GET /api/notifications returns broadcast & status notifications');
    notificationId = notifsRes.body.notifications[0]._id;

    const markReadRes = await request('PUT', `/api/notifications/${notificationId}/read`, null, studentToken);
    assert(markReadRes.status === 200 && markReadRes.body.notification.read === true, 'PUT /api/notifications/:id/read marks notification as read');

    const markAllReadRes = await request('PUT', '/api/notifications/read-all', null, studentToken);
    assert(markAllReadRes.status === 200, 'PUT /api/notifications/read-all marks all notifications read');

    // ==========================================
    // 10. ADMIN & ANALYTICS ENDPOINTS
    // ==========================================
    console.log('\n--- 10. Admin Analytics & User Management ---');

    const overviewRes = await request('GET', '/api/admin/analytics/overview', null, adminToken);
    assert(overviewRes.status === 200 && overviewRes.body.analytics.users.total >= 3, 'GET /api/admin/analytics/overview returns aggregate user counts');

    const deptAnalyticsRes = await request('GET', '/api/admin/analytics/department', null, adminToken);
    assert(deptAnalyticsRes.status === 200 && deptAnalyticsRes.body.departmentAnalytics.opportunitiesByDepartment.length > 0, 'GET /api/admin/analytics/department aggregates department statistics');

    const allUsersRes = await request('GET', '/api/admin/users', null, adminToken);
    assert(allUsersRes.status === 200 && allUsersRes.body.count >= 3, 'GET /api/admin/users returns all users with profile data');

    // 10.4 Update User Role
    const tempUserRes = await request('POST', '/api/auth/register', {
      name: 'Temp Faculty Candidate',
      email: 'candidate@cuchd.in',
      password: 'password123',
      role: 'student',
    });
    const tempUserId = tempUserRes.body.user.id;

    const roleUpdateRes = await request('PUT', `/api/admin/users/${tempUserId}/role`, {
      role: 'faculty',
    }, adminToken);
    assert(roleUpdateRes.status === 200 && roleUpdateRes.body.user.role === 'faculty', 'PUT /api/admin/users/:id/role changes user role to faculty');

    // ==========================================
    // 11. CLEANUP / DELETE POSTING
    // ==========================================
    console.log('\n--- 11. Posting Management & Cleanup ---');
    const deleteOppRes = await request('DELETE', `/api/opportunities/${opp2Id}`, null, facultyToken);
    assert(deleteOppRes.status === 200, 'DELETE /api/opportunities/:id removes opportunity posting');

    console.log('\n======================================================');
    console.log(`📊 Test Results: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('======================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Test suite crashed with error:', error);
    process.exit(1);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
    console.log('[Cleanup] Disconnected test server & database.');
  }
};

runTests();
