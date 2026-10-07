const fs = require('fs');
const pdfParse = require('pdf-parse');

// Comprehensive technical skill taxonomy
const SKILLS_DICTIONARY = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'R', 'MATLAB', 'Scala',
  'React', 'React.js', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'ASP.NET',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Sass', 'Redux', 'Zustand', 'GraphQL', 'REST API', 'WebSockets',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Supabase', 'Oracle', 'Cassandra', 'Elasticsearch', 'Prisma', 'Mongoose',
  'Docker', 'Kubernetes', 'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Terraform', 'Linux', 'Git',
  'Machine Learning', 'Deep Learning', 'Data Science', 'Artificial Intelligence', 'Natural Language Processing', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-Learn', 'Pandas', 'NumPy', 'OpenCV', 'LLM', 'LangChain',
  'Data Structures', 'Algorithms', 'System Design', 'Cybersecurity', 'Ethical Hacking', 'Cryptography', 'Blockchain', 'Solidity', 'Smart Contracts',
  'UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping', 'Wireframing',
  'Android', 'iOS', 'Flutter', 'React Native', 'Mobile Development',
  'Agile', 'Scrum', 'Jira', 'Postman', 'Unit Testing', 'Jest', 'Mocha', 'Cypress'
];

/**
 * Extracts plain text from a file (PDF or text) and finds matching skills
 * @param {string} filePath - Absolute path to uploaded resume
 * @returns {Promise<{text: string, skills: string[]}>}
 */
const parseResume = async (filePath) => {
  try {
    let extractedText = '';

    if (filePath.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text || '';
    } else {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    }

    const normalizedDoc = extractedText.toLowerCase();
    const foundSkills = new Set();

    // Scan for skills dictionary items using word boundary awareness
    for (const skill of SKILLS_DICTIONARY) {
      // Escape special characters in skill name for regex (e.g. C++, C#)
      const escapedSkill = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      
      // Match with word boundary or boundary symbols
      const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escapedSkill}([^a-zA-Z0-9_#+]|$)`, 'i');
      if (regex.test(normalizedDoc)) {
        // Canonicalize name
        let canonicalName = skill;
        if (skill === 'React.js') canonicalName = 'React';
        if (skill === 'Express.js') canonicalName = 'Express';
        if (skill === 'Amazon Web Services') canonicalName = 'AWS';
        if (skill === 'Google Cloud') canonicalName = 'GCP';
        foundSkills.add(canonicalName);
      }
    }

    return {
      text: extractedText,
      skills: Array.from(foundSkills),
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    return {
      text: '',
      skills: [],
    };
  }
};

module.exports = {
  parseResume,
  SKILLS_DICTIONARY,
};
