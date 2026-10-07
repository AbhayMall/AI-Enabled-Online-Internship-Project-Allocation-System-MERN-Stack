/**
 * Institutional Email Notification Dispatcher Service
 * Supports batch broadcast to student emails (@cuchd.in) and individual status update alerts.
 */

/**
 * Sends a generic email (logs in dev/test, integrates with transport if configured)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const recipientList = Array.isArray(to) ? to.join(', ') : to;
  console.log(`\n======================================================`);
  console.log(`📧 [INSTITUTIONAL EMAIL DISPATCH]`);
  console.log(`To:      ${recipientList}`);
  console.log(`Subject: ${subject}`);
  console.log(`------------------------------------------------------`);
  console.log(text || '(HTML Content Generated)');
  console.log(`======================================================\n`);

  return {
    success: true,
    recipientCount: Array.isArray(to) ? to.length : 1,
    messageId: `cuchd-email-${Date.now()}`,
  };
};

/**
 * Broadcasts an alert to all registered students when a new opportunity is published
 * @param {Object} params
 * @param {Array<string>} params.studentEmails - List of student @cuchd.in email addresses
 * @param {Object} params.opportunity - The newly published Opportunity document
 */
const sendOpportunityBroadcast = async ({ studentEmails, opportunity }) => {
  if (!studentEmails || studentEmails.length === 0) return;

  const isInternship = opportunity.type === 'internship';
  const typeBadge = isInternship ? 'Internship Vacancy' : 'Capstone Project Vacancy';
  const skillsList = (opportunity.requiredSkills || []).join(', ') || 'Open to all technical domains';

  const subject = `🚀 New ${typeBadge} Posted: ${opportunity.title} (${opportunity.department || 'All Departments'})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); padding: 24px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: -0.5px;">Institutional Allocation Portal</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #c7d2fe;">New Opportunity Broadcast Alert</p>
      </div>

      <div style="padding: 24px;">
        <span style="display: inline-block; padding: 4px 10px; background-color: #e0e7ff; color: #3730a3; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
          ${typeBadge}
        </span>

        <h2 style="margin: 12px 0 8px 0; font-size: 18px; color: #0f172a; font-weight: bold;">
          ${opportunity.title}
        </h2>

        <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
          ${opportunity.description || 'A new faculty-led project opportunity is now accepting student applications.'}
        </p>

        <div style="background-color: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; color: #334155; border-left: 4px solid #4f46e5;">
          <p style="margin: 0 0 6px 0;"><strong>🏢 Department:</strong> ${opportunity.department || 'General'}</p>
          <p style="margin: 0 0 6px 0;"><strong>👥 Capacity:</strong> ${opportunity.capacity} student slot(s)</p>
          <p style="margin: 0;"><strong>🛠️ Required Skills:</strong> ${skillsList}</p>
        </div>

        <div style="text-align: center; margin: 24px 0 12px 0;">
          <a href="http://localhost:5173/student/browse" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            View Posting & Apply via AI Matcher
          </a>
        </div>
      </div>

      <div style="background-color: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        You received this notification because your account is registered with your official university email (<strong>@cuchd.in</strong>).
      </div>
    </div>
  `;

  const text = `
    [New Opportunity Alert]
    Title: ${opportunity.title}
    Type: ${typeBadge}
    Department: ${opportunity.department}
    Capacity: ${opportunity.capacity} slots
    Required Skills: ${skillsList}
    Description: ${opportunity.description}

    Log in to the student portal (http://localhost:5173/student/browse) to apply!
  `;

  return await sendEmail({
    to: studentEmails,
    subject,
    html,
    text,
  });
};

/**
 * Sends notification email to student when their application status changes
 */
const sendApplicationStatusAlert = async ({ studentEmail, studentName, opportunityTitle, newStatus }) => {
  const readableStatus = newStatus.replace('_', ' ').toUpperCase();
  const subject = `Application Update: ${opportunityTitle} is now ${readableStatus}`;

  const text = `
    Hello ${studentName || 'Student'},

    Your application status for "${opportunityTitle}" has been updated to: ${readableStatus}.

    Please log in to your dashboard to view complete allocation and feedback details.
  `;

  return await sendEmail({
    to: studentEmail,
    subject,
    text,
  });
};

module.exports = {
  sendEmail,
  sendOpportunityBroadcast,
  sendApplicationStatusAlert,
};
