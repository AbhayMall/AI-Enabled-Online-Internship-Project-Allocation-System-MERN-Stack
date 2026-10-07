/**
 * AI-Enabled Opportunity Matching Engine
 * Computes suitability score (0 - 100%) and generates structured match explanations
 */

/**
 * Calculates match score between a student profile and an opportunity
 * @param {Object} studentProfile - Student profile with skills, resumeParsedSkills, department, preferences
 * @param {Object} opportunity - Opportunity document with requiredSkills, department, type, title, description
 * @returns {{ score: number, matchedSkills: string[], missingSkills: string[], departmentMatch: boolean, preferenceMatch: boolean, reasons: string[] }}
 */
const calculateMatchScore = (studentProfile, opportunity) => {
  if (!opportunity) {
    return { score: 0, matchedSkills: [], missingSkills: [], departmentMatch: false, preferenceMatch: false, reasons: [] };
  }

  // Combine self-declared skills and resume parsed skills into a single normalized set
  const studentSkillsRaw = [
    ...(studentProfile?.skills || []),
    ...(studentProfile?.resumeParsedSkills || [])
  ];

  const studentSkillsNormalized = new Set(
    studentSkillsRaw.map((s) => s.trim().toLowerCase())
  );

  const requiredSkills = opportunity.requiredSkills || [];
  const matchedSkills = [];
  const missingSkills = [];

  if (requiredSkills.length > 0) {
    for (const reqSkill of requiredSkills) {
      const normalizedReq = reqSkill.trim().toLowerCase();
      if (studentSkillsNormalized.has(normalizedReq)) {
        matchedSkills.push(reqSkill);
      } else {
        // Partial substring match check (e.g., 'React' in 'React.js' or 'ML' in 'Machine Learning')
        let partialFound = false;
        for (const s of studentSkillsNormalized) {
          if (s.includes(normalizedReq) || normalizedReq.includes(s)) {
            matchedSkills.push(reqSkill);
            partialFound = true;
            break;
          }
        }
        if (!partialFound) {
          missingSkills.push(reqSkill);
        }
      }
    }
  }

  // 1. Skill Score Component (0 - 65 points)
  let skillScore = 65;
  if (requiredSkills.length > 0) {
    const matchRatio = matchedSkills.length / requiredSkills.length;
    skillScore = Math.round(matchRatio * 65);
  }

  // 2. Department Alignment Component (0 - 20 points)
  let departmentMatch = false;
  let departmentScore = 0;
  if (
    opportunity.department &&
    studentProfile?.department &&
    (opportunity.department.toLowerCase() === studentProfile.department.toLowerCase() ||
     opportunity.department.toLowerCase() === 'all' ||
     opportunity.department.toLowerCase() === 'any')
  ) {
    departmentMatch = true;
    departmentScore = 20;
  } else if (!opportunity.department || !studentProfile?.department) {
    departmentScore = 10; // neutral
  }

  // 3. Domain & Preferences Component (0 - 15 points)
  let preferenceMatch = false;
  let preferenceScore = 0;
  const preferences = studentProfile?.preferences || [];
  if (preferences.length > 0) {
    const oppText = `${opportunity.title || ''} ${opportunity.description || ''} ${opportunity.type || ''}`.toLowerCase();
    for (const pref of preferences) {
      if (oppText.includes(pref.toLowerCase())) {
        preferenceMatch = true;
        preferenceScore = 15;
        break;
      }
    }
  } else {
    preferenceScore = 5; // baseline
  }

  // Total Score (capped between 0 and 100)
  const totalScore = Math.min(100, Math.max(0, skillScore + departmentScore + preferenceScore));

  // Build human-readable match explanations
  const reasons = [];
  if (matchedSkills.length > 0) {
    reasons.push(`Matched ${matchedSkills.length} of ${requiredSkills.length} required skills (${matchedSkills.slice(0, 3).join(', ')})`);
  }
  if (departmentMatch) {
    reasons.push(`Department matches '${studentProfile.department}'`);
  }
  if (preferenceMatch) {
    reasons.push(`Aligns with career preferences (${preferences.join(', ')})`);
  }
  if (missingSkills.length > 0 && requiredSkills.length > 0) {
    reasons.push(`Missing skills: ${missingSkills.slice(0, 3).join(', ')}`);
  }

  return {
    score: totalScore,
    matchedSkills,
    missingSkills,
    departmentMatch,
    preferenceMatch,
    reasons,
  };
};

/**
 * Ranks an array of opportunities for a given student profile
 * @param {Object} studentProfile - Student profile
 * @param {Array} opportunities - Array of Opportunity Mongoose docs
 * @returns {Array} Sorted opportunities with attached match analysis
 */
const rankOpportunities = (studentProfile, opportunities) => {
  const scoredOpportunities = opportunities.map((opp) => {
    const oppObj = opp.toObject ? opp.toObject() : { ...opp };
    const matchAnalysis = calculateMatchScore(studentProfile, oppObj);
    return {
      ...oppObj,
      matchScore: matchAnalysis.score,
      matchAnalysis,
    };
  });

  // Sort descending by match score
  return scoredOpportunities.sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = {
  calculateMatchScore,
  rankOpportunities,
};
