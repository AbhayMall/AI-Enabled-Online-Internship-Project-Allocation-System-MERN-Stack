/**
 * Validates email format
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
};

/**
 * Validates institutional email domain based on user role:
 * - Student: Must end with @cuchd.in (e.g. 21bcs1234@cuchd.in)
 * - Faculty: Must end with @cumail.in (e.g. faculty.name@cumail.in)
 * - Admin: Must end with @cumail.in or @cuchd.in
 */
const validateRoleEmailDomain = (email, role) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }

  const normalized = email.trim().toLowerCase();

  if (role === 'student') {
    const isStudentValid = /^[a-zA-Z0-9._%+-]+@cuchd\.in$/i.test(normalized);
    if (!isStudentValid) {
      return {
        valid: false,
        message: 'Student accounts must use their official institutional email ending with @cuchd.in (e.g. yourname@cuchd.in)',
      };
    }
  } else if (role === 'faculty') {
    const isFacultyValid = /^[a-zA-Z0-9._%+-]+@cumail\.in$/i.test(normalized);
    if (!isFacultyValid) {
      return {
        valid: false,
        message: 'Faculty accounts must use their official institutional email ending with @cumail.in (e.g. yourname@cumail.in)',
      };
    }
  } else if (role === 'admin') {
    const isAdminValid = /^[a-zA-Z0-9._%+-]+@(cumail\.in|cuchd\.in)$/i.test(normalized);
    if (!isAdminValid) {
      return {
        valid: false,
        message: 'Admin accounts must use an institutional email ending with @cumail.in or @cuchd.in',
      };
    }
  }

  return { valid: true };
};

/**
 * Checks for missing required fields in request body
 */
const validateRequired = (body, fields) => {
  const missing = [];
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || (typeof body[field] === 'string' && body[field].trim() === '')) {
      missing.push(field);
    }
  }
  return missing;
};

module.exports = {
  isValidEmail,
  validateRoleEmailDomain,
  validateRequired,
};
